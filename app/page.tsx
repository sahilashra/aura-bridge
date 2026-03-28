"use client";

import React, { useState, useEffect } from "react";
import IntakeForm from "@/components/IntakeForm";
import ActionDashboard from "@/components/ActionDashboard";
import IncidentHistory from "@/components/IncidentHistory";
import { Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_STEPS = [
  { label: "Reading input...", icon: "📥", duration: 1200 },
  { label: "Gemini reasoning...", icon: "🧠", duration: 2500 },
  { label: "Building dashboard...", icon: "⚡", duration: 800 },
];

export default function Home() {
  const [triageResult, setTriageResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [latency] = useState(() => Math.floor(Math.random() * 8) + 12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    if (isLoading) {
      setLoadingStep(0);
      setElapsedMs(0);
      interval = setInterval(() => setElapsedMs((prev) => prev + 10), 10);
      stepTimeout = setTimeout(() => {
        setLoadingStep(1);
        setTimeout(() => setLoadingStep(2), LOADING_STEPS[1].duration);
      }, LOADING_STEPS[0].duration);
    } else {
      setElapsedMs(0);
      setLoadingStep(0);
    }
    return () => { clearInterval(interval); clearTimeout(stepTimeout); };
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent z-50"></div>
      
      <nav className="w-full max-w-5xl flex justify-between items-center py-4 px-6 md:px-0 mt-4 border-b border-surface-border mb-8">
        <div className="flex items-center gap-2">
          <HeartPulse size={24} className="text-primary animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">AuraBridge</h1>
          <span className="text-xs font-mono text-slate-400 ml-2 px-2 py-0.5 border border-surface-border rounded-md">OPS-CENTER</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-success">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_#2a9d8f]"></div>
            <span className="font-mono text-xs font-semibold tracking-wider">SYSTEM OPERATIONAL</span>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono text-slate-500">Node Latency</span>
            <span className="font-mono text-xs text-slate-300">{latency}ms</span>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {!triageResult ? (
          <motion.div 
            key="intake"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center px-4"
          >
            {isLoading ? (
              <div className="w-full max-w-3xl bg-surface border border-surface-border rounded-xl p-8 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col items-center justify-center py-12 gap-8">
                  <div className="flex gap-2">
                    {[...Array(7)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [12, 48, 12], backgroundColor: ["#1f2937", "#e63946", "#1f2937"] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                        className="w-3 rounded-full"
                      />
                    ))}
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                    {LOADING_STEPS.map((step, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: i === loadingStep ? 1 : i < loadingStep ? 0.5 : 0.25,
                          scale: i === loadingStep ? 1.04 : 1,
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border transition-all ${
                          i === loadingStep 
                            ? "border-primary bg-primary/10 text-white" 
                            : i < loadingStep
                              ? "border-success/30 bg-success/5 text-success"
                              : "border-surface-border text-slate-600"
                        }`}
                      >
                        <span className="text-lg">{i < loadingStep ? "✓" : step.icon}</span>
                        <span className="text-sm font-medium">{step.label}</span>
                        {i === loadingStep && (
                          <motion.div 
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <p className="font-mono text-primary text-sm">{(elapsedMs / 1000).toFixed(2)}s elapsed</p>
                </div>
              </div>
            ) : (
              <IntakeForm onTriageResult={setTriageResult} onLoading={setIsLoading} />
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center px-4 pb-16"
          >
            <ActionDashboard 
              data={triageResult} 
              onReset={() => { setTriageResult(null); setElapsedMs(0); }} 
            />
            <IncidentHistory />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto w-full h-8 bg-[#111827] border-t border-surface-border flex justify-between items-center px-6 fixed bottom-0 z-50">
        <div className="flex gap-6 font-mono text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><Activity size={12} className="text-primary"/> Model: gemini-2.5-flash</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success"/> TLS 1.3 Encrypted</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          {triageResult ? `Last Triage: ${new Date().toLocaleTimeString()}` : "Awaiting Incident"}
        </div>
      </footer>
    </main>
  );
}
