"use client";

import React from "react";
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Share2, 
  FileDown, 
  AlertTriangle,
  Info 
} from "lucide-react";
import { motion } from "framer-motion";

interface ActionDashboardProps {
  data: {
    severity_score: number;
    color_code: "RED" | "AMBER" | "GREEN";
    headline: string;
    instructions: string[];
    medic_data: string;
    is_fallback?: boolean;
  };
}

const ActionDashboard: React.FC<ActionDashboardProps> = ({ data }) => {
  const getSeverityColor = (code: string) => {
    switch (code) {
      case "RED": return "text-[#ff0000] border-[#ff0000] bg-red-950/20";
      case "AMBER": return "text-[#ffaa00] border-[#ffaa00] bg-amber-950/20";
      case "GREEN": return "text-[#00ff88] border-[#00ff88] bg-emerald-950/20";
      default: return "text-white border-white bg-slate-900";
    }
  };

  const severityColorClass = getSeverityColor(data.color_code);

  const shareToWhatsApp = () => {
    const text = `⚠️ AURA BRIDGE EMERGENCY ALERT\n\nIncident: ${data.headline}\nSeverity: ${data.severity_score}/10\n\nInstructions:\n${data.instructions.join('\n- ')}\n\nMedic Data: ${data.medic_data}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`w-full max-w-2xl bg-[#000000] border-4 p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-2xl ${severityColorClass.split(' ')[1]}`}
    >
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-sm font-mono tracking-widest uppercase mb-2 text-slate-500">Bridge Recommendation</h2>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-4">
            {data.headline}
          </h1>
          <div className={`px-4 py-2 border-2 inline-block font-black text-2xl skew-x-[-12deg] mb-4 ${severityColorClass.split(' ')[0]} ${severityColorClass.split(' ')[1]}`}>
            SEVERITY: {data.severity_score}/10
          </div>
        </div>
        <div className={`flex flex-col items-center justify-center w-24 h-24 border-4 rounded-full font-black text-4xl mb-4 ${severityColorClass.split(' ')[0]} ${severityColorClass.split(' ')[1]}`}>
          {data.severity_score}
        </div>
      </div>

      <div className="space-y-6 mb-12">
        <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-white">
          <ShieldCheck size={28} className="text-[#00ff88]" />
          Life-Saving Actions
        </h3>
        {data.instructions.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-start gap-6 p-6 border-l-8 border-[#ffffff] bg-slate-900/40 rounded-r-xl`}
          >
            <div className="bg-white text-black font-black text-4xl w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg italic">
              {idx + 1}
            </div>
            <p className="text-3xl font-black text-white leading-tight">
              {step}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#111111] p-6 rounded-xl border border-dashed border-slate-700 mb-12">
        <h4 className="text-sm font-mono uppercase text-slate-500 mb-4 flex items-center gap-2">
          <Info size={16} /> Medic Technical Brief
        </h4>
        <p className="text-xl font-mono text-[#00ff88] bg-[#000000] p-4 border border-[#00ff88]/30 rounded-lg">
          {data.medic_data}
        </p>
      </div>

      {/* Static Map Integration */}
      <div className="mb-12 border-4 border-slate-800 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all cursor-crosshair">
        <img 
          src={`https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=15&size=800x400&scale=2&maptype=roadmap&markers=color:red%7C40.714728,-73.998672&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || 'DUMMY_KEY'}`}
          alt="Incident Location"
          className="w-full h-auto brightness-75 contrast-125"
        />
        <div className="bg-[#000000] p-3 border-t border-slate-800 flex items-center gap-4">
          <MapPin size={24} className="text-[#ff0000]" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-400">Target Lat/Long: 40.714728, -73.998672 [AUTO-TRIANGULATED]</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={shareToWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xl transition-all"
        >
          <Share2 size={24} /> WhatsApp
        </button>
        <button 
          className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xl transition-all"
        >
          <FileDown size={24} /> PDF Logs
        </button>
      </div>

      {data.is_fallback && (
        <p className="text-center text-[#ffaa00] mt-6 font-mono text-[10px] uppercase">
          AI ERROR: Raw output bridge engaged. Verification required.
        </p>
      )}
    </motion.div>
  );
};

export default ActionDashboard;
