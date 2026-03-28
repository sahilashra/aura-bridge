"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import { Camera, Send, FileText, AlertCircle, Mic, Paperclip, Type, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from 'dompurify'; // ensure DOMPurify is available

interface IntakeFormProps {
  onTriageResult: (result: any) => void;
  onLoading: (isLoading: boolean) => void;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onTriageResult, onLoading }) => {
  const [inputText, setInputText] = useState("");
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "photo" | "voice" | "doc">("text");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText((prev) => prev + " " + finalTranscript);
      }
    };
    
    recognition.onerror = (event: any) => {
      setError("Speech recognition error: " + event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();

    // Stop after 15 seconds to prevent runaway
    setTimeout(() => {
      recognition.stop();
      setIsListening(false);
    }, 15000);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    onLoading(true);
    setError(null);

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large (max 5MB)");
        continue;
      }

      const base64 = await convertToBase64(file);
      newImages.push(base64 as string);
    }
    setImagesBase64((prev) => [...prev, ...newImages]);
    onLoading(false);
    if(newImages.length > 0) setActiveTab("photo");
  };

  const convertToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleTriage = async () => {
    if (!inputText && imagesBase64.length === 0) {
      setError("Please describe the emergency or upload a photo.");
      return;
    }

    onLoading(true);
    setError(null);

    try {
      // Input sanitization
      const cleanInput = DOMPurify.sanitize(inputText, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

      const geminiImages = imagesBase64.map((b64) => {
        const mimeType = b64.split(";")[0].split(":")[1];
        const data = b64.split(",")[1];
        return { inlineData: { data, mimeType } };
      });

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: cleanInput, images: geminiImages }),
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
    <div className="w-full max-w-3xl bg-surface border border-surface-border p-8 shadow-2xl rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle size={28} className="text-secondary" />
        <h2 className="text-2xl font-bold tracking-tight text-white">New Emergency Report</h2>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab("text")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'text' ? 'bg-surface-border text-white' : 'text-slate-400 hover:text-white'}`}>
          <Type size={16} /> Text
        </button>
        <button onClick={() => setActiveTab("photo")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'photo' ? 'bg-surface-border text-white' : 'text-slate-400 hover:text-white'}`}>
          <Camera size={16} /> Photo
        </button>
        <button onClick={() => setActiveTab("voice")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'voice' ? 'bg-surface-border text-white' : 'text-slate-400 hover:text-white'}`}>
          <Mic size={16} /> Voice
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-500 cursor-not-allowed">
          <Paperclip size={16} /> Document <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-1">SOON</span>
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {activeTab !== "photo" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mb-6">
            <textarea
              className="w-full h-40 bg-[#161f33] text-white p-4 text-base border-2 border-surface-border focus:border-primary rounded-xl outline-none placeholder:text-slate-500 transition-all font-sans resize-none"
              placeholder="Describe the incident... (e.g. 'Car crash on HW-10, heavy bleeding, unresponsive...')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500">
              {inputText.length} chars
            </div>
            {activeTab === "voice" && (
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={startListening} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isListening ? 'bg-primary text-white animate-pulse' : 'bg-surface-border text-white'}`}
                  >
                    <Mic size={14} /> {isListening ? 'Listening...' : 'Record Voice'}
                  </button>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
            <div 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-600 hover:border-primary rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#161f33]"
            >
              <Camera size={40} className="text-slate-500 mb-4" />
              <p className="text-slate-400">Drag photo here or click to upload</p>
              <p className="text-xs text-slate-500 mt-2 font-mono">Max 5MB per image</p>
            </div>
            <input type="file" hidden ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {imagesBase64.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {imagesBase64.map((img, idx) => (
            <div key={idx} className="relative w-24 h-24 border border-surface-border rounded-lg overflow-hidden shadow-sm">
              <img src={img} alt="Incident" className="w-full h-full object-cover" />
              <button 
                onClick={() => setImagesBase64(prev => prev.filter((_, i) => i !== idx))} 
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-primary transition-colors"
              >
                <div className="w-3 h-3 flex items-center justify-center leading-none text-xs">&times;</div>
              </button>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/10 text-primary border-l-4 border-primary p-4 text-sm mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      ) : null}

      <button
        onClick={handleTriage}
        className="group relative w-full bg-primary hover:bg-red-600 text-white py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg overflow-hidden transition-all duration-300"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        Analyze & Triage &rarr;
      </button>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default IntakeForm;
