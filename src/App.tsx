import { useState, useEffect, useRef } from 'react';
import CyberMap from './components/CyberMap';
import Sidebar from './components/Sidebar';
import NodeInspector from './components/NodeInspector';
import HudOverlay from './components/HudOverlay';
import { generateCyberData } from './utils/dataGenerator';
import { MapNode, MapArc, MapFilters } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Eye, ShieldAlert, Wifi, Database } from 'lucide-react';
import maplibregl from 'maplibre-gl';

export default function App() {
  const [filters, setFilters] = useState<MapFilters>({
    nodeRadius: 3.5,
    glowIntensity: 0.9,
    arcWidth: 1.4,
    arcSpeed: 1.5,
    activeStatus: {
      active: true,
      restricted: true,
      disrupted: true,
      dormant: false,
    },
    nodeType: {
      hub: true,
      network: true,
      site: true,
      archive: true,
    },
    searchQuery: '',
    pointCount: 5000,
    baseColor: 'gradient',
    orbitMode: false,
    show3DBuildings: true,
  });

  const [data, setData] = useState<{ nodes: MapNode[]; arcs: MapArc[] }>({ nodes: [], arcs: [] });
  const [manualNodes, setManualNodes] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  // Generate data based on point density filter
  useEffect(() => {
    const generated = generateCyberData(filters.pointCount);
    setData(generated);
    
    // Clear selected node if it's no longer in the generated set
    if (selectedNode) {
      const exists = generated.nodes.some(n => n.id === selectedNode.id);
      if (!exists) setSelectedNode(null);
    }
  }, [filters.pointCount]);

  // Orbit rotation effect
  useEffect(() => {
    let animationFrameId: number;
    
    const rotate = () => {
      const map = mapInstanceRef.current;
      if (map && filters.orbitMode) {
        const currentBearing = map.getBearing();
        // Slowly increment bearing
        map.setBearing((currentBearing + 0.08) % 360);
        animationFrameId = requestAnimationFrame(rotate);
      }
    };

    if (filters.orbitMode) {
      rotate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [filters.orbitMode]);

  // Simulated System Boot Sequence
  useEffect(() => {
    const logs = [
        '[vite] connecting to HMR server...',
        '[react] mounting virtual DOM components...',
        '[maplibre] initializing WebGL2 context...',
        '[maplibre] fetching CartoDB Dark Matter vector tiles...',
        '[deck.gl] compiling ArcLayer shaders...',
        '[data] parsing 5000+ GeoJSON node features...',
        '[app] spatial intelligence toolkit ready.'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logs.length) {
        setBootLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(logInterval);
          setTimeout(() => setIsBooting(false), 500); // Small fade-out delay
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 250);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  // Handle Geolocation Presets
  const handleApplyPreset = (presetName: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Disables orbital rotation on selecting preset to allow focused view
    if (filters.orbitMode) {
      setFilters(prev => ({ ...prev, orbitMode: false }));
    }

    switch (presetName) {
      case 'wall-street':
        map.flyTo({
          center: [-74.0090, 40.7060], // Wall St Financial Core
          zoom: 14.5,
          pitch: 62,
          bearing: 38,
          speed: 1.2,
          curve: 1.4,
        });
        break;
      case 'midtown':
        map.flyTo({
          center: [-73.9850, 40.7540], // Times Square Grid Hub
          zoom: 14.0,
          pitch: 58,
          bearing: -22,
          speed: 1.2,
          curve: 1.4,
        });
        break;
      case 'dumbo':
        map.flyTo({
          center: [-73.9900, 40.7020], // Brooklyn DUMBO sector
          zoom: 14.2,
          pitch: 48,
          bearing: 74,
          speed: 1.2,
          curve: 1.4,
        });
        break;
      case 'panoramic':
        map.flyTo({
          center: [-73.975, 40.735], // Overhead wide view
          zoom: 11.5,
          pitch: 65,
          bearing: 115,
          speed: 1.0,
          curve: 1.2,
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans text-slate-100">
      
      {/* BOOTING LOADING INTRO */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            key="bootloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 bg-[#020205] flex flex-col justify-between p-8 font-mono text-xs text-cyber-cyan"
          >
            {/* Top Logo branding */}
            <div className="flex justify-between border-b border-cyber-cyan/30 pb-4">
              <div>
                <div className="text-sm font-bold tracking-[0.25em] flex items-center gap-2 glow-text">
                  <Terminal className="w-5 h-5 text-cyber-cyan animate-pulse" />
                  COGNITIVE DEEP_NET GRID SYSTEM
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  SYS MODEL VERSION v4.0.2 / PROTOTYPE ENGINE
                </div>
              </div>
              <div className="text-right flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyber-pink" />
                <span className="text-[10px] text-cyber-pink font-bold uppercase tracking-widest glow-text-pink">ICE PROTECTION: ENABLED</span>
              </div>
            </div>

            {/* Middle Logs Section */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-6">
              
              {/* Spinning Decryptor Ring */}
              <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyber-cyan/20 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-1 rounded-full border-2 border-dashed border-cyber-pink/50 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-3 rounded-full border border-cyber-yellow animate-pulse" />
                  <span className="text-[11px] font-bold text-cyber-cyan glow-text">{Math.min(100, bootProgress)}%</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold uppercase text-white tracking-widest glow-text">DECRYPTING SECTOR 07 INTERFACES...</div>
                  <div className="h-2 w-full bg-slate-950 border border-cyber-cyan/30 rounded overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyber-cyan shadow-[0_0_8px_#00f3ff]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(100, bootProgress)}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Booting Diagnostics Logs */}
              <div className="h-52 glass glow-border rounded p-4 font-mono text-[10px] leading-relaxed overflow-hidden flex flex-col justify-end">
                <div className="space-y-1.5">
                  {bootLogs.map((log, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-cyber-pink">▶</span>
                      <span className="text-slate-300">{log}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Credits */}
            <div className="border-t border-cyber-cyan/30 pt-4 flex justify-between items-center text-[10px] text-slate-500">
              <span className="uppercase">NEURO-SPICE NET_CORE DEPLOYMENT</span>
              <span className="uppercase">GRID CONNECTION: ESTABLISHED 2026-07-01</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE MAP LAYER */}
      <div className="absolute inset-0 w-full h-full z-0">
        <CyberMap 
          nodes={data.nodes}
          manualNodes={manualNodes}
          arcs={data.arcs}
          filters={filters}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          mapInstanceRef={mapInstanceRef}
        />
      </div>

      {/* FLOATING SIDEBAR (LEFT) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <Sidebar 
          filters={filters}
          onChangeFilters={setFilters}
          onApplyPreset={handleApplyPreset}
          nodeCount={data.nodes.length}
          arcCount={data.arcs.length}
          onAddManualNode={(node) => setManualNodes(prev => [...prev, node])}
        />
      </div>

      {/* HUD SCI-FI OVERLAYS (CORNER INDICATORS, LABELS) */}
      <HudOverlay />

      {/* INTERACTIVE DIAGNOSTIC INSPECTOR (BOTTOM RIGHT) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <NodeInspector 
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>

    </div>
  );
}
