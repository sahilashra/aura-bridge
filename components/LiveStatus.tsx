"use client";

import React, { useState, useEffect } from "react";
import { Radio, ShieldCheck, Database, Map, Signal, Wifi, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LiveStatus = () => {
  const [pulse, setPulse] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "P2P Encryption Active", icon: ShieldCheck, color: "text-[#00ff88]" },
    { label: "Gemini 1.5 Flash Reasoning Engine", icon: Database, color: "text-[#00ff88]" },
    { label: "Public Safety API Hooking", icon: Map, color: "text-[#00ff88]" },
    { label: "Network: Triangulation Engaged", icon: Signal, color: "text-[#00ff88]" },
    { label: "Vitals Stream: Online", icon: Activity, color: "text-[#ff0000]" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-2xl px-4">
      <div className="flex items-center gap-3 bg-[#0a0a0a] border border-slate-700/30 p-4 rounded-xl shadow-xl">
        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${pulse ? "bg-[#ff0000] shadow-[0_0_10px_#ff0000]" : "bg-[#550000]"}`}></div>
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {React.createElement(steps[activeStep].icon, { size: 16, className: steps[activeStep].color })}
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                {steps[activeStep].label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-1">
          <Wifi size={16} className="text-[#00ff88]" />
          <span className="text-[10px] font-mono font-bold text-[#00ff88] uppercase tracking-tighter">P-Link 4.2</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-2 overflow-hidden whitespace-nowrap">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`h-1 w-4 rounded-full transition-all duration-700 ${i === activeStep * 4 ? "bg-[#ff0000] w-12" : "bg-slate-800"}`}></div>
        ))}
      </div>
    </div>
  );
};

export default LiveStatus;
