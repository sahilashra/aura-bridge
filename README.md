# AURA BRIDGE 🚨

**Aura Bridge** is a universal emergency data connector that transforms messy, unstructured data (images of accidents, frantic text, and voice transcripts) into structured, prioritized, and life-saving action steps. It is built natively for speed and accessibility, utilizing agentic AI to triage critical situations instantly.

This project was built during the SuperHack 2025 sprint.

## 🚀 Features

- **Agentic AI Triage**: Powered by **Gemini 2.5 Flash** for high-speed reasoning and information extraction.
- **Multimodal Panic Intake**: Accepts raw text or drag-and-drop "panic photos".
- **Deterministic Output**: Uses a strict fallback safety layer to ensure JSON-structured emergency checklists never fail.
- **High-Contrast "Panic UI"**: Accessibility-first design (`text-2xl` scales) to maximize legibility in high-stress, low-visibility scenarios.
- **Instant Transmission**: Easily share technical Medic Briefs securely to WhatsApp or download as offline logs.
- **Live Triangulation Mock**: Integrated Google Maps for incident location awareness.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **AI Engine**: Google Generative AI (`@google/generative-ai` models/gemini-2.5-flash)
- **Styling**: Tailwind CSS v4 (Custom Emergency Tokens)
- **Animations**: Framer Motion
- **Deployment**: Google Cloud Run

## 🔌 Environment Setup

Create a `.env.local` file with the following variables:

```bash
GEMINI_API_KEY="your_google_ai_studio_key"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your_google_maps_key"
```

## 🏁 Getting Started

Run the development server locally:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the Panic Intake UI.

## ☁️ Deployment

This project is configured for continuous deployment on **Google Cloud Run**.

```bash
gcloud run deploy aura-bridge \
  --source . \
  --project YOUR_PROJECT_ID \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=...,NEXT_PUBLIC_GOOGLE_MAPS_KEY=..."
```

## 🛡️ Hackathon Goals
- **Problem**: Critical time is wasted deciphering disorganized panic signals.
- **Solution**: An agentic bridge that structures "the noise" and tells the user what to do immediately.
- **USP**: Human-in-the-loop actioning, closed-loop processing, and extreme-accessibility UI design.
