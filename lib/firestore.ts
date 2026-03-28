/**
 * Firebase Admin SDK — Firestore client
 * Initialized lazily to avoid build-time failures when env vars are absent.
 */

let firestoreDb: FirebaseFirestore.Firestore | null = null;

async function getDb(): Promise<FirebaseFirestore.Firestore | null> {
  if (firestoreDb) return firestoreDb;

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.warn("FIREBASE_SERVICE_ACCOUNT env var not set — Firestore disabled.");
    return null;
  }

  try {
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    firestoreDb = admin.firestore();
    return firestoreDb;
  } catch (e: any) {
    console.error("Firebase Admin init failed:", e.message);
    return null;
  }
}

export interface IncidentRecord {
  severity: number;
  headline: string;
  location: string;
  timestamp: string;
}

export async function saveIncident(incident: IncidentRecord): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.collection("incidents").add({
    ...incident,
    createdAt: new Date(),
  });
}

export async function getRecentIncidents(limit: number = 5): Promise<IncidentRecord[]> {
  const db = await getDb();
  if (!db) return [];
  const snapshot = await db
    .collection("incidents")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => doc.data() as IncidentRecord);
}
