"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  FileDown, 
  AlertTriangle,
  Info,
  Copy,
  RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import jsPDF from 'jspdf';

interface ActionDashboardProps {
  data: {
    severity_score: number;
    color_code: "RED" | "AMBER" | "GREEN";
    headline: string;
    instructions: string[];
    medic_data: string;
    is_fallback?: boolean;
  };
  onReset: () => void;
}

const ActionDashboard: React.FC<ActionDashboardProps> = ({ data, onReset }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleCheck = (idx: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setCheckedItems(newSet);
  };

  const getSeverityColorHex = (score: number) => {
    if (score >= 7) return "#e63946"; // primary red
    if (score >= 4) return "#f59e0b"; // amber
    return "#2a9d8f"; // success teal
  };

  const severityColorHex = getSeverityColorHex(data.severity_score);

  const shareToWhatsApp = () => {
    const text = `⚠️ AURA BRIDGE EMERGENCY ALERT\n\nIncident: ${data.headline}\nSeverity: ${data.severity_score}/10\n\nInstructions:\n${data.instructions.map((s,i) => `[${checkedItems.has(i)?'x':' '}] ${s}`).join('\n')}\n\nMedic Data:\n${data.medic_data}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyReport = () => {
    const text = `AURA BRIDGE EMERGENCY ALERT\nIncident: ${data.headline}\nSeverity: ${data.severity_score}/10\n\nInstructions:\n${data.instructions.map((s,i) => `[${checkedItems.has(i)?'x':' '}] ${s}`).join('\n')}\n\nMedic Data:\n${data.medic_data}`;
    navigator.clipboard.writeText(text);
    alert("Report copied to clipboard.");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(230, 57, 70);
    doc.text("AURA BRIDGE EMERGENCY REPORT", 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Incident: ${data.headline}`, 20, 35);
    doc.text(`Severity Score: ${data.severity_score}/10`, 20, 45);
    
    doc.setFontSize(16);
    doc.text("Action Checklist:", 20, 60);
    doc.setFontSize(12);
    let y = 70;
    data.instructions.forEach((step, idx) => {
      const status = checkedItems.has(idx) ? "[DONE]" : "[PENDING]";
      const lines = doc.splitTextToSize(`${status} ${step}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7;
    });

    y += 10;
    doc.setFontSize(16);
    doc.text("Medic Technical Brief:", 20, y);
    doc.setFontSize(12);
    y += 10;
    const medicLines = doc.splitTextToSize(data.medic_data, 170);
    doc.text(medicLines, 20, y);
    
    doc.save(`AuraBridge_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Incident Operations View</h2>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm px-4 py-2 border border-surface-border rounded-md bg-surface"
        >
          <RotateCcw size={16} /> New Intake
        </button>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* LEFT COLUMN: Severity & Diagnosis */}
        <div className="bg-surface border border-surface-border p-6 rounded-2xl flex flex-col items-center text-center shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Threat Assessment</h3>
          <div className="w-48 h-48 mb-6 relative">
            <CircularProgressbar 
              value={(data.severity_score / 10) * 100} 
              text={`${data.severity_score}/10`}
              styles={buildStyles({
                pathColor: severityColorHex,
                textColor: severityColorHex,
                trailColor: '#1f2937',
                textSize: '24px',
              })}
            />
            {data.severity_score >= 8 && (
                <div role="alert" className="absolute -bottom-2 w-full text-center text-xs font-bold bg-[#e63946] text-white py-1 rounded-full animate-pulse">
                  CRITICAL
                </div>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-tight text-white mb-2">{data.headline}</h1>
          {data.is_fallback && (
            <div className="mt-4 text-[#f59e0b] text-xs font-mono uppercase bg-[#f59e0b]/10 px-3 py-1 rounded">
               Fallback Rules Engaged
            </div>
          )}
        </div>

        {/* CENTER COLUMN: Action Checklist */}
        <div className="bg-surface border border-surface-border p-6 rounded-2xl shadow-lg flex flex-col">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
            <span>Prioritized Protocol</span>
            <span className="font-mono text-xs">{checkedItems.size}/{data.instructions.length}</span>
          </h3>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {data.instructions.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => toggleCheck(idx)}
                className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${checkedItems.has(idx) ? 'bg-success/10 border-success/30 opacity-70' : 'bg-[#161f33] border-surface-border hover:border-slate-500'}`}
              >
                <div className={`mt-0.5 shrink-0 ${checkedItems.has(idx) ? 'text-success' : 'text-slate-500'}`}>
                  <CheckCircle2 size={24} className={checkedItems.has(idx) ? 'fill-success/20' : ''}/>
                </div>
                <p className={`text-sm ${checkedItems.has(idx) ? 'text-slate-400 line-through decoration-slate-500' : 'text-slate-200'}`}>
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Vitals & Map */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-surface-border p-6 rounded-2xl shadow-lg flex-1">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-secondary" /> Extracted Context
            </h3>
            <div className="bg-[#161f33] p-4 rounded-xl border border-surface-border text-sm font-mono text-slate-300 h-40 overflow-y-auto">
              {data.medic_data}
            </div>
          </div>
          
          <div className="bg-surface border border-surface-border p-2 rounded-2xl shadow-lg relative overflow-hidden h-48 group">
             <img 
              src={`https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=15&size=400x200&scale=2&maptype=roadmap&markers=color:red%7C40.714728,-73.998672&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:landscape|element:geometry|color:0x2c5a71&style=feature:water|element:geometry|color:0x0e171d&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'YOUR_GOOGLE_MAPS_KEY_HERE'}`}
              alt="Incident Location map"
              className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-sm p-3 border border-surface-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-mono text-[10px] text-slate-300">ESTIMATED LOCATION</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
        <button 
          onClick={copyReport}
          className="flex items-center justify-center gap-2 w-full py-4 border border-surface-border bg-surface hover:bg-[#161f33] rounded-xl font-semibold text-slate-300 transition-colors"
        >
          <Copy size={20} /> Copy Report Text
        </button>
        <button 
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 w-full py-4 border border-surface-border bg-surface hover:bg-[#161f33] rounded-xl font-semibold text-slate-300 transition-colors"
        >
          <FileDown size={20} /> Export PDF Log
        </button>
        <button 
          onClick={shareToWhatsApp}
          className="flex items-center justify-center gap-2 w-full py-4 bg-success hover:bg-[#208276] text-white rounded-xl font-semibold transition-colors shadow-lg shadow-success/20"
        >
          <Share2 size={20} /> Transmit to Responder
        </button>
      </div>

    </div>
  );
};

export default ActionDashboard;
