import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "dummy_key_for_build";

export const genAI = new GoogleGenerativeAI(apiKey);
export const model = genAI.getGenerativeModel(
  { model: "models/gemini-2.5-flash" },
  { apiVersion: "v1" }
);

