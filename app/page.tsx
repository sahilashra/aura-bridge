"use client";

import React, { useState } from "react";
import IntakeForm from "@/components/IntakeForm";
import ActionDashboard from "@/components/ActionDashboard";
import LiveStatus from "@/components/LiveStatus";
import { ShieldCheck, Cross, Triangle, Activity, LifeBuoy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [triageResult, setTriageResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center p-6 md:p-12 selection:bg-[#ff0000]">
      {/* Header Overlay */}
      <div className="fixed top-0 left-0 w-full h-1 bg-[#ff0000] z-50 animate-pulse"></div>
      
      {/* Sticky Banner */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-16 border-b border-white/10 pb-8 mt-8">
        <div className="flex flex-col gap-1 items-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff0000] p-2 rounded-lg italic font-black text-2xl -skew-x-12">AB</div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Aura Bridge</h1>
          </div>
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-slate-500 font-bold">Universal Emergency Data Connector</span>
        </div>
        
        <div className="hidden md:flex gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-slate-500">Node Status</span>
            <div className="flex items-center gap-2 text-[#00ff88]">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping"></div>
              <span className="font-bold uppercase tracking-widest text-xs">ENCRYPTED-LINK-4J</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-mono text-slate-500">Latency</span>
            <span className="font-bold uppercase tracking-widest text-xs text-white">4ms</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!triageResult ? (
          <motion.div 
            key="intake"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-12">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 italic">
                Report <span className="text-[#ff0000]">Incident</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-bold uppercase tracking-widest">
                Images &bull; Text &bull; Voice &bull; Unstructured
              </p>
            </div>
            
            <IntakeForm 
              onTriageResult={setTriageResult} 
              onLoading={setIsLoading} 
            />

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 flex flex-col items-center gap-4 py-8 px-12 border border-[#ff0000]/30 rounded-2xl bg-black shadow-[0_0_50px_rgba(255,0,0,0.2)]"
              >
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ scaleY: [1, 2, 1], height: [20, 60, 20], backgroundColor: ["#550000", "#ff0000", "#550000"] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 h-12 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-2xl font-black uppercase italic tracking-tighter text-[#ff0000] animate-pulse">
                  Gemini Flash Reasoning Underway...
                </span>
              </motion.div>
            )}

            {!isLoading && <LiveStatus />}
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-12 flex items-center gap-4">
              <button 
                onClick={() => setTriageResult(null)}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-black uppercase text-sm border border-white/10 hover:border-white/30 transition-all"
              >
                &larr; New Intake
              </button>
            </div>
            
            <ActionDashboard data={triageResult} />
            
            <LiveStatus />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Vitals */}
      <div className="fixed bottom-12 right-12 opacity-30 hidden md:block select-none pointer-events-none">
        <div className="flex items-end gap-1 mb-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1 bg-[#ff0000] rounded-full" style={{ height: Math.random() * 40 + 10 + 'px' }}></div>
          ))}
        </div>
        <span className="font-mono text-[8px] uppercase tracking-widest block text-right font-bold">Link Aggregation Signal</span>
      </div>

      <div className="mt-auto pt-24 pb-12 w-full max-w-4xl border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600">&copy; 2026 Aura Bridge &bull; 01C900-E790B5-74C4BF</p>
        <div className="flex gap-12 font-mono text-[10px] uppercase font-bold tracking-widest text-[#ff0000]">
          <span className="flex items-center gap-2 animate-pulse"><Activity size={12} /> Live Triage active</span>
          <span className="flex items-center gap-2"><LifeBuoy size={12} /> Priority 1 Access</span>
        </div>
      </div>
    </main>
  );
}
