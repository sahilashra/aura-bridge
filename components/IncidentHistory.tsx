"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Incident {
  severity: number;
  headline: string;
  location: string;
  timestamp: string;
}

const SeverityBadge = ({ score }: { score: number }) => {
  const color = score >= 8 ? "bg-red-900/40 text-red-400 border-red-700" 
    : score >= 5 ? "bg-amber-900/40 text-amber-400 border-amber-700" 
    : "bg-teal-900/40 text-teal-400 border-teal-700";
  return (
    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${color}`}>
      {score}/10
    </span>
  );
};

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/incidents")
      .then(r => r.json())
      .then(data => setIncidents(data.incidents || []))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (incidents.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mt-8">
      <div className="bg-surface border border-surface-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Clock size={16} className="text-secondary" /> Recent Incidents
        </h3>
        <div className="space-y-3">
          <AnimatePresence>
            {incidents.map((incident, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-3 bg-[#161f33] border border-surface-border rounded-xl"
              >
                <SeverityBadge score={incident.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate font-medium">{incident.headline}</p>
                  <p className="text-xs text-slate-500 mt-0.5">📍 {incident.location}</p>
                </div>
                <span className="text-xs text-slate-600 font-mono shrink-0">
                  {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
