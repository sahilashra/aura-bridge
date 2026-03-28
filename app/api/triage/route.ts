import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { saveIncident } from "@/lib/firestore";

export const runtime = "nodejs";

const systemPrompt = `
You are the "Aura Bridge" Emergency Triage AI. 
TASK: Extract critical data from unstructured inputs (handwritten notes, frantic text, or images).
LOGIC: Perform OCR if image input. Identify allergies, blood types, location, and threats. 

STRICT JSON OUTPUT ONLY — no markdown, no explanation:
{
  "severity": number (1-10, where 10 is immediately life-threatening),
  "primary_threat": "concise string describing the main emergency",
  "confidence_score": number (0-100, your confidence in this assessment),
  "location": "city or address extracted from the incident text. Default to 'New Delhi, India' if not found.",
  "extracted_vitals": {
    "allergies": ["string"],
    "blood_type": "string or Unknown"
  },
  "user_checklist": ["actionable step 1", "actionable step 2", "actionable step 3", "step 4", "step 5"],
  "suggested_resources": ["relevant emergency resource e.g. Trauma Center, Poison Control: 1800-116-117"],
  "professional_brief": "Short 1-2 sentence summary for a paramedic"
}

Rules:
- If Penicillin allergy is detected, set severity >= 9.
- user_checklist must have 5 actionable steps in order of priority.
- suggested_resources should list 2-3 relevant real-world contacts or facilities.
- location must be a real place name usable in Google Maps.
`;

const rateLimitMap = new Map<string, { count: number, timestamp: number }>();

export async function POST(req: Request) {
  try {
    // Basic Rate Limiting (10 req/min)
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000;
    
    if (rateLimitMap.has(ip)) {
      const record = rateLimitMap.get(ip)!;
      if (now - record.timestamp < windowMs) {
        if (record.count >= 10) {
          return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
        }
        record.count += 1;
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }

    const { input, images } = await req.json();

    if (!input && (!images || images.length === 0)) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    let contents: any[] = [{ text: systemPrompt }];
    
    if (input) {
      contents.push({ text: `USER INPUT: ${input}` });
    }

    if (images && images.length > 0) {
      images.forEach((img: { inlineData: { data: string; mimeType: string } }) => {
        if (img.inlineData.data.length > 5 * 1024 * 1024 * 1.34) {
             throw new Error("Image payload too large.");
        }
        contents.push(img);
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: contents }]
    });

    const responseText = result.response.text();
    console.log("Raw Gemini Response:", responseText);

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsedData = JSON.parse(jsonString);

      // Dynamic Maps using extracted location
      const map_key = process.env.GOOGLE_MAPS_KEY || "";
      const location = parsedData.location || "New Delhi, India";
      const encodedLocation = encodeURIComponent(location);
      const map_url = map_key
        ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodedLocation}&zoom=14&size=400x200&scale=2&maptype=roadmap&markers=color:red%7C${encodedLocation}&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:landscape|element:geometry|color:0x2c5a71&style=feature:water|element:geometry|color:0x0e171d&key=${map_key}`
        : "";

      const color_code = parsedData.severity >= 8 ? "RED" : parsedData.severity >= 5 ? "AMBER" : "GREEN";
      
      const transformedData = {
        severity_score: parsedData.severity,
        confidence_score: parsedData.confidence_score || 80,
        color_code: color_code,
        headline: parsedData.primary_threat,
        location: location,
        instructions: parsedData.user_checklist || [],
        suggested_resources: parsedData.suggested_resources || [],
        map_url: map_url,
        medic_data: `${parsedData.professional_brief || ""} | Allergies: ${parsedData.extracted_vitals?.allergies?.join(", ") || "None"} | Blood Type: ${parsedData.extracted_vitals?.blood_type || "Unknown"}`
      };

      // Save to Firestore (non-blocking — don't let this fail the response)
      saveIncident({
        severity: parsedData.severity,
        headline: parsedData.primary_threat,
        location: location,
        timestamp: new Date().toISOString(),
      }).catch((e: any) => console.warn("Firestore save failed (non-critical):", e.message));

      return NextResponse.json(transformedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({
        severity_score: 5,
        confidence_score: 40,
        color_code: "AMBER",
        headline: "Analysis error — please retry",
        location: "Unknown",
        map_url: "",
        instructions: ["Fallback: Raw response parsing failed", responseText.substring(0, 100)],
        suggested_resources: [],
        medic_data: responseText,
        is_fallback: true
      });
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
