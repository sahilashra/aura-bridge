"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Camera, Send, FileText, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface IntakeFormProps {
  onTriageResult: (result: any) => void;
  onLoading: (isLoading: boolean) => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onTriageResult, onLoading }) => {
  const [inputText, setInputText] = useState("");
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    onLoading(true);
    setError(null);

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size too large (max 10MB)");
        continue;
      }

      const base64 = await convertToBase64(file);
      newImages.push(base64 as string);
    }
    setImagesBase64((prev) => [...prev, ...newImages]);
    onLoading(false);
  };

  const convertToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTriage = async () => {
    if (!inputText && imagesBase64.length === 0) {
      setError("Please describe the emergency or upload a photo.");
      return;
    }

    onLoading(true);
    setError(null);

    try {
      // Process images for Gemini format (inlineData)
      const geminiImages = imagesBase64.map((b64) => {
        const mimeType = b64.split(";")[0].split(":")[1];
        const data = b64.split(",")[1];
        return { inlineData: { data, mimeType } };
      });

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputText, images: geminiImages }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Triage failed");
      }

      const result = await res.json();
      onTriageResult(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#000000] border-4 border-[#ff0000] p-6 shadow-[0_0_20px_rgba(255,0,0,0.5)] rounded-2xl">
      <div className="flex items-center gap-2 mb-6 text-[#ff0000]">
        <AlertCircle size={32} />
        <h2 className="text-3xl font-black uppercase tracking-tighter">Emergency Intake</h2>
      </div>

      <textarea
        className="w-full h-48 bg-[#0a0a0a] text-white p-4 text-2xl border-2 border-slate-800 focus:border-[#ff0000] rounded-xl outline-none placeholder:text-slate-700 transition-all font-mono mb-6"
        placeholder="Describe the incident... (e.g. 'Car crash on HW-10, someone is trapped, heavy bleeding...')"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <div className="flex flex-wrap gap-4 mb-6">
        {imagesBase64.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 border-2 border-slate-800 rounded-lg overflow-hidden">
            <img src={img} alt="Incident" className="w-full h-full object-cover" />
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 flex flex-col items-center justify-center border-4 border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-[#ff0000] rounded-lg transition-all"
        >
          <Camera size={32} />
          <span className="text-xs font-bold uppercase mt-1">Photo</span>
        </button>
        <input
          type="file"
          hidden
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/30 text-[#ff4444] border-l-4 border-[#ff0000] p-4 font-bold text-lg mb-6 flex items-center gap-2"
        >
          <AlertCircle size={24} />
          {error}
        </motion.div>
      )}

      <button
        onClick={handleTriage}
        className="w-full bg-[#ff0000] hover:bg-[#cc0000] active:scale-95 text-white py-6 rounded-xl flex items-center justify-center gap-3 transition-all"
      >
        <Send size={32} />
        <span className="text-4xl font-black uppercase italic tracking-tighter">Execute Bridge</span>
      </button>

      <p className="mt-4 text-slate-500 font-mono text-center text-xs uppercase tracking-widest animate-pulse">
        Encrypted P2P Link Active
      </p>
    </div>
  );
};

export default IntakeForm;
