import { useState, useEffect } from 'react';
import { Shield, Radio, Activity, Compass, Clock, Check, AlertTriangle } from 'lucide-react';

export default function HudOverlay() {
  const [time, setTime] = useState(new Date());
  const [cpuLoad, setCpuLoad] = useState(42.3);
  const [sectorStatus, setSectorStatus] = useState('ACTIVE');

  // Time & dynamic HUD data update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Simulate natural fluctuation in CPU loads and diagnostics
    const statsTimer = setInterval(() => {
      setCpuLoad(prev => {
        const delta = Math.random() * 8 - 4;
        return parseFloat(Math.min(99.9, Math.max(10, prev + delta)).toFixed(1));
      });
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 font-mono select-none text-[10px] text-slate-400">
      
      {/* SCANLINE OVERLAY */}
      <div className="absolute inset-0 scanline opacity-[0.15] mix-blend-overlay" />
      
      {/* GRID OVERLAY BACKGROUND (Subtle) */}
      <div className="absolute inset-0 cyber-grid opacity-[0.25]" />

      {/* TOP HEADER ROW */}
      <div className="flex justify-between items-start w-full">
        {/* Top-Left: Grid System Status */}
        <div className="flex flex-col gap-1 p-3 glass glow-border rounded pointer-events-auto">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            <span className="font-bold text-cyber-cyan tracking-[0.15em] uppercase text-[11px] glow-text">
              NYC METROPOLITAN RESEARCH GRID
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase flex gap-2 items-center">
            <span>GRID LOC: 40.7128°N / 74.0060°W</span>
            <span className="text-cyber-cyan font-bold">•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_8px_#10b981]" />
              COGNITIVE SYNC: 100%
            </span>
          </div>
        </div>

        {/* Top-Right: System Clock & Performance telemetry */}
        <div className="flex flex-col gap-1.5 p-3 glass glow-border-pink rounded pointer-events-auto text-right">
          <div className="flex items-center justify-end gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyber-pink" />
            <span className="font-bold text-cyber-pink text-[12px] tracking-wider glow-text-pink">
              {time.toLocaleTimeString()}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase flex gap-2 justify-end items-center">
            <span>UPTIME: 172:42:01</span>
            <span className="text-cyber-pink">•</span>
            <span>NET_LOAD: <span className="text-cyber-pink font-bold">{cpuLoad}%</span></span>
          </div>
        </div>
      </div>

      {/* MID VIEW CORNER FRAMES (Cyberpunk HUD borders) */}
      <div className="absolute top-1/2 left-2 -translate-y-1/2 w-1.5 h-16 border-l border-y border-cyber-cyan/30" />
      <div className="absolute top-1/2 right-2 -translate-y-1/2 w-1.5 h-16 border-r border-y border-cyber-pink/30" />

      {/* BOTTOM FOOTER ROW */}
      <div className="flex justify-between items-end w-full">
        {/* Bottom-Left: Sub-grid Legend Key */}
        <div className="flex flex-col gap-2 p-3 glass glow-border rounded pointer-events-auto w-48">
          <div className="font-bold text-cyber-cyan uppercase text-[9px] tracking-wider border-b border-cyber-cyan/20 pb-1 mb-1 flex items-center gap-1 glow-text">
            <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
            GRID TELEMETRY KEY
          </div>
          
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-red border border-white/20 shadow-[0_0_6px_#ff003c]" />
              <span className="text-slate-300">NEURAL CORES (HIGH DATA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-orange border border-white/20 shadow-[0_0_6px_#ff5500]" />
              <span className="text-slate-300">SIGNAL RELAYS (ROUTERS)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-yellow border border-white/20 shadow-[0_0_6px_#f3e300]" />
              <span className="text-slate-300">ICE SECURITY FIREWALLS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan border border-white/20 shadow-[0_0_6px_#00f0ff]" />
              <span className="text-slate-300">PERIPHERAL TERMINALS</span>
            </div>
            <div className="border-t border-slate-900 my-1 pb-1 pt-1 flex items-center gap-1.5 text-[8px] text-slate-500 uppercase">
              <span className="w-2.5 h-0.5 bg-gradient-to-r from-cyber-cyan to-cyber-pink inline-block" />
              <span>3D DIGITAL HIGHWAYS (ARCS)</span>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Decorative Compass Crosshairs / Coordinates */}
        <div className="flex flex-col gap-1 items-end pr-2 opacity-65">
          <div className="flex items-center gap-2">
            <span className="uppercase text-[8px] tracking-widest text-slate-500">SYS_MAP_CALIBRATION_CROSS</span>
            <div className="w-8 h-px bg-slate-700" />
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex gap-1.5">
            <span>ROTATION: 3D ENG</span>
            <span>|</span>
            <span>BEARING: DYNAMIC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
