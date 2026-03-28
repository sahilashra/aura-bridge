import { NextResponse } from "next/server";
import { saveIncident, getRecentIncidents } from "@/lib/firestore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const incidents = await getRecentIncidents(5);
    return NextResponse.json({ incidents });
  } catch (error: any) {
    return NextResponse.json({ incidents: [], error: error.message }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await saveIncident(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
