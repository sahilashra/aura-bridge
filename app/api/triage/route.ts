import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `
You are the "Aura Bridge" Emergency Triage AI. 
TASK: Extract critical data from unstructured inputs (handwritten notes or frantic text).
INPUT: A photo of a handwritten medical note.
LOGIC: Perform OCR to identify allergies and blood types. 

STRICT JSON OUTPUT ONLY:
{
  "severity": number (1-10),
  "primary_threat": "string",
  "extracted_vitals": {
    "allergies": ["string"],
    "blood_type": "string"
  },
  "user_checklist": ["step 1", "step 2"],
  "professional_brief": "Short summary for a paramedic"
}

Note: If 'Penicillin Allergy' is detected, set severity to 9.
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
        // Size validation (~5MB base64 check)
        if (img.inlineData.data.length > 5 * 1024 * 1024 * 1.34) {
             throw new Error("Image payload too large.");
        }
        contents.push(img);
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: contents }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    console.log("Raw Gemini Response:", responseText);

    // Schema Validation & Cleanup
    try {
      const parsedData = JSON.parse(responseText);

      // Map the new structured output to what the frontend ActionDashboard expects
      const color_code = parsedData.severity >= 8 ? "RED" : parsedData.severity >= 5 ? "AMBER" : "GREEN";
      const transformedData = {
        severity_score: parsedData.severity,
        color_code: color_code,
        headline: parsedData.primary_threat,
        instructions: parsedData.user_checklist || [],
        medic_data: `${parsedData.professional_brief || ""} | Allergies: ${parsedData.extracted_vitals?.allergies?.join(", ") || "None"} | Blood Type: ${parsedData.extracted_vitals?.blood_type || "Unknown"}`
      };

      return NextResponse.json(transformedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return NextResponse.json({
        severity_score: 5,
        color_code: "AMBER",
        headline: "Analysis error",
        instructions: ["Fallback: Raw response parsing failed", responseText.substring(0, 100)],
        medic_data: responseText,
        is_fallback: true
      });
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
