import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const runtime = "edge";

const systemPrompt = `
  SYSTEM: You are the Aura Bridge Triage Engine.
  TASK: Convert messy input (frantic text, voice transcripts, or incident details) into structured emergency actions.
  CONSTRAINT: Return ONLY valid JSON.
  
  SOCIETAL GOAL: Minimize panic. Use clear, imperative verbs.
  SAFETY LAYER: If the input is not related to an emergency, health crisis, or accident, redirect the user politely. Do not provide medical advice for non-emergency scenarios.

  JSON SCHEMA:
  {
    "severity_score": 1-10,
    "color_code": "RED|AMBER|GREEN",
    "headline": "Immediate Threat Name",
    "instructions": ["Step 1 (Clear)", "Step 2 (Clear)"],
    "medic_data": "Technical summary for first responders"
  }
`;

export async function POST(req: Request) {
  try {
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
        contents.push(img);
      });
    }

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    console.log("Raw Gemini Response:", responseText);

    // Schema Validation & Cleanup
    try {
      // Find JSON block if it exists
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsedData = JSON.parse(jsonString);

      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      // Fallback: Return raw text with a generic structure
      return NextResponse.json({
        severity_score: 5,
        color_code: "AMBER",
        headline: "Analysis in progress",
        instructions: [responseText.substring(0, 100) + "..."],
        medic_data: responseText,
        is_fallback: true
      });
    }
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
