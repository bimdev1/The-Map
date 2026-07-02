import { useState, useEffect, useRef } from 'react';
import { MapNode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Activity, 
  Radio, 
  Clock, 
  Zap, 
  AlertTriangle,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';

interface NodeInspectorProps {
  node: MapNode | null;
  onClose: () => void;
}

export default function NodeInspector({ node, onClose }: NodeInspectorProps) {
  const [trafficHistory, setTrafficHistory] = useState<number[]>([]);
  const [pingActive, setPingActive] = useState(false);
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial traffic history & maintain rolling updates
  useEffect(() => {
    if (!node) {
      setTrafficHistory([]);
      setPingLogs([]);
      setPingActive(false);
      return;
    }

    // Pre-populate history
    const baseVal = node.traffic;
    const history = Array.from({ length: 15 }, () => 
      Math.max(2, parseFloat((baseVal + (Math.random() * 20 - 10)).toFixed(1)))
    );
    setTrafficHistory(history);
    setPingLogs([`CONNECTED TO NODE [${node.name}]`, 'SECURITY PROTOCOLS DETECTED. BYPASSING...']);

    // Periodically update rolling traffic graph
    const interval = setInterval(() => {
      setTrafficHistory(prev => {
        const nextVal = Math.max(2, parseFloat((node.traffic + (Math.random() * 16 - 8)).toFixed(1)));
        return [...prev.slice(1), nextVal];
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [node]);

  if (!node) return null;

  // Render SVG Sparkline
  const maxTraffic = Math.max(...trafficHistory, 10);
  const minTraffic = Math.min(...trafficHistory, 0);
  const width = 260;
  const height = 50;
  const padding = 5;

  const points = trafficHistory.map((val, idx) => {
    const x = padding + (idx / (trafficHistory.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minTraffic) / (maxTraffic - minTraffic || 1)) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const handlePing = () => {
    if (pingActive) return;
    setPingActive(true);
    setPingLogs(prev => [`[${new Date().toLocaleTimeString()}] INITIATING MANUAL PING BURST...`, ...prev]);

    let step = 0;
    const pings = [
      `SENT 64 BYTES TO ${node.coordinates[0].toFixed(4)}, ${node.coordinates[1].toFixed(4)}`,
      `REPLY FROM ${node.name}: latency=${(node.latency + Math.random() * 4 - 2).toFixed(1)}ms TTL=64`,
      `REPLY FROM ${node.name}: latency=${(node.latency + Math.random() * 2 - 1).toFixed(1)}ms TTL=64`,
      `REPLY FROM ${node.name}: latency=${(node.latency + Math.random() * 6 - 3).toFixed(1)}ms TTL=64`,
      `PING SUMMARY: 3 packets transmitted, 3 received, 0% packet loss.`,
      `DIAGNOSTICS COMPLETE. NODE STATE: OPTIMAL.`
    ];

    pingIntervalRef.current = setInterval(() => {
      if (step < pings.length) {
        setPingLogs(prev => [`[${new Date().toLocaleTimeString()}] ${pings[step]}`, ...prev]);
        step++;
      } else {
        setPingActive(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      }
    }, 600);
  };

  // Status Badge configs
  const statusConfig = {
    active: { color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40', text: 'ACTIVE / STABLE' },
    restricted: { color: 'text-amber-400 bg-amber-950/40 border-amber-500/40', text: 'RESTRICTED' },
    disrupted: { color: 'text-rose-500 bg-rose-950/40 border-rose-500/40', text: 'DISRUPTED / POLICE' },
    dormant: { color: 'text-slate-500 bg-slate-900/40 border-slate-700/40', text: 'DORMANT / HISTORICAL' },
  };

  const typeLabels = {
    hub: 'MOVEMENT HUB',
    network: 'COORDINATION NETWORK',
    site: 'FIELD SITE',
    archive: 'DATA ARCHIVE',
  };

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-96 glass glow-border-pink rounded select-none font-mono text-xs text-slate-200 overflow-hidden"
      >
        {/* Title Bar */}
        <div className="flex items-center justify-between p-3 border-b border-cyber-pink/30 bg-cyber-pink/5 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-pink animate-pulse shadow-[0_0_8px_#ff0055]" />
            <h2 className="font-bold tracking-wider text-cyber-pink text-xs uppercase glow-text-pink">
              SITE METADATA: {node.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-cyber-pink transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Telemetry */}
        <div className="p-4 space-y-4">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded border border-cyber-pink/15">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">CLASSIFICATION</div>
              <div className="font-bold text-cyber-cyan text-[10px] truncate mt-0.5">
                {typeLabels[node.type]}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">GRID COORDS</div>
              <div className="text-white text-[10px] font-semibold mt-0.5">
                {node.coordinates[0].toFixed(5)}, {node.coordinates[1].toFixed(5)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">ACCESS PROTOCOL</div>
              <div className={`font-semibold text-[10px] mt-0.5 flex items-center gap-1 ${
                node.status === 'compromised' ? 'text-red-400' : 'text-slate-300'
              }`}>
                {node.status === 'compromised' ? (
                  <>
                    <Shield className="w-3 h-3 text-red-400" />
                    UNSECURED
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-cyber-cyan" />
                    PORT_8080/SSH
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">GRID SYSTEM STATE</div>
              <div className={`border text-[8px] font-bold px-1.5 py-0.5 rounded text-center inline-block mt-0.5 ${statusConfig[node.status].color}`}>
                {statusConfig[node.status].text}
              </div>
            </div>
          </div>

          {/* Sparkline & Traffic Chart */}
          <div className="border border-cyber-pink/20 p-3 bg-black/40 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-[10px] text-cyber-pink font-bold uppercase">
                <Activity className="w-3.5 h-3.5" />
                DATA THROUGHPUT (MB/S)
              </div>
              <span className="text-[10px] text-white font-bold">{trafficHistory[trafficHistory.length - 1]} MB/S</span>
            </div>
            
            {/* SVG Sparkline */}
            <div className="relative h-14 w-full bg-black/60 rounded border border-slate-900 flex items-center justify-center">
              {trafficHistory.length > 0 ? (
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff0055" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ff0055" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Shaded Area */}
                  <path
                    d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
                    fill="url(#gradient-area)"
                  />
                  {/* Sparkline Path */}
                  <polyline
                    fill="none"
                    stroke="#ff0055"
                    strokeWidth="1.8"
                    points={points}
                    className="drop-shadow-[0_0_4px_rgba(255,0,85,0.6)]"
                  />
                </svg>
              ) : (
                <span className="text-slate-600 uppercase text-[9px]">CALIBRATING TELEMETRY...</span>
              )}
            </div>
            
            <div className="flex justify-between text-[8px] text-slate-500 mt-1 uppercase">
              <span>ROLLING HISTORY</span>
              <span>LIVE TRANSMISSION</span>
            </div>
          </div>

          {/* Hardware Specifications */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-black/30 p-2 rounded border border-slate-900 flex items-center justify-between">
              <span className="text-slate-500 uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyber-yellow" /> PING:
              </span>
              <span className="text-cyber-yellow font-bold">{node.latency} ms</span>
            </div>
            <div className="bg-black/30 p-2 rounded border border-slate-900 flex items-center justify-between">
              <span className="text-slate-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyber-cyan" /> UPTIME:
              </span>
              <span className="text-cyber-cyan font-bold">99.98%</span>
            </div>
          </div>

          {/* Interactive Hacking/Diagnostic Terminal */}
          <div className="border border-cyber-pink/20 bg-black/60 rounded p-2.5 flex flex-col h-32 overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-cyber-pink/20">
              <span className="text-[9px] text-cyber-pink font-bold uppercase tracking-wider flex items-center gap-1">
                <ChevronRight className="w-3 h-3 animate-pulse" />
                Diagnostic Console
              </span>
              <button
                onClick={handlePing}
                disabled={pingActive || node.status === 'offline'}
                className={`text-[8px] font-bold px-2 py-0.5 border rounded uppercase transition-all ${
                  node.status === 'offline'
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : pingActive
                      ? 'border-cyber-pink/50 text-cyber-pink bg-cyber-pink/15 animate-pulse cursor-wait'
                      : 'border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/15 hover:shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                }`}
              >
                {pingActive ? 'PINGING...' : 'PING NODE'}
              </button>
            </div>
            
            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto space-y-1 text-[9px] text-slate-400 font-mono pr-1 custom-scrollbar">
              {pingLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`border-l pl-1.5 py-0.5 break-all ${
                    log.includes('REPLY') 
                      ? 'border-cyber-cyan text-cyber-cyan font-semibold'
                      : log.includes('COMPLETE') || log.includes('CONNECTED')
                        ? 'border-emerald-500 text-emerald-400 font-bold'
                        : log.includes('SENT')
                          ? 'border-cyber-pink text-cyber-pink'
                          : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
              {pingLogs.length === 0 && (
                <div className="text-slate-600 uppercase text-center mt-4">
                  DIAGNOSTIC STREAM VACANT
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footnotes */}
        <div className="bg-black/70 p-2 border-t border-cyber-pink/30 flex justify-between items-center text-[8px] text-slate-500">
          <span className="uppercase">GRID DATA PACKET SYNC: ENABLED</span>
          <span className="text-cyber-pink font-bold">SECURE ENCRYPTION v12</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
