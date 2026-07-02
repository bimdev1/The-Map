import { useState, useEffect } from 'react';
import { MapFilters } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  Layers, 
  MapPin, 
  Compass, 
  Eye, 
  Cpu, 
  AlertTriangle, 
  Terminal as TerminalIcon, 
  Activity, 
  Play, 
  Pause,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  filters: MapFilters;
  onChangeFilters: (filters: MapFilters) => void;
  onApplyPreset: (presetName: string) => void;
  nodeCount: number;
  arcCount: number;
  onAddManualNode: (node: MapNode) => void;
}

export default function Sidebar({
  filters,
  onChangeFilters,
  onApplyPreset,
  nodeCount,
  arcCount,
  onAddManualNode
}: SidebarProps) {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'INIT SYSTEM BOOT...',
    'NETRUNNER HUB v4.02 CONNECTED',
    'SCANNING NYC SUB-GRID SECTOR 07...',
    'SECURE CONNECTION STABLISHED VIA PROXY-ALPHA'
  ]);
  const [activeTab, setActiveTab] = useState<'control' | 'telemetry' | 'system' | 'nodes'>('control');
  const [nodeForm, setNodeForm] = useState({ lat: '', lng: '', name: '', strength: '50' });

  // Add random cyber logs over time
  useEffect(() => {
    const cyberPhrases = [
      'Querying central neural database...',
      'ICE protection layer holding at 94.3%',
      'Packet traffic overflow in Midtown relay',
      'Warning: Neural Core showing high entropy',
      'Intercepting system signal from DUMBO Sector',
      'Rogue node SYS-OMEGA ping latency spike',
      'Refreshing localized geo-coordinates...',
      'Compiling spatial 3D building layers...',
      'De-crypting sub-net communications...',
      'Bypassing secure terminal handshake...',
    ];

    const interval = setInterval(() => {
      const randomLog = `[${new Date().toLocaleTimeString()}] ${
        cyberPhrases[Math.floor(Math.random() * cyberPhrases.length)]
      }`;
      setConsoleLogs(prev => [randomLog, ...prev.slice(0, 25)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const updateFilter = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
    onChangeFilters({
      ...filters,
      [key]: value
    });
  };

  const toggleStatusFilter = (status: keyof MapFilters['activeStatus']) => {
    onChangeFilters({
      ...filters,
      activeStatus: {
        ...filters.activeStatus,
        [status]: !filters.activeStatus[status]
      }
    });
  };

  const toggleTypeFilter = (type: keyof MapFilters['nodeType']) => {
    onChangeFilters({
      ...filters,
      nodeType: {
        ...filters.nodeType,
        [type]: !filters.nodeType[type]
      }
    });
  };

  return (
    <div 
      id="cyber-sidebar"
      className="w-80 h-[92vh] max-h-[92vh] flex flex-col glass glow-border rounded select-none text-xs font-mono overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-4 border-b border-cyber-cyan/30 bg-cyber-cyan/5 relative">
        <div className="absolute top-1 right-2 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">ONLINE</span>
        </div>
        <h1 className="text-sm font-bold text-cyber-cyan tracking-[0.2em] flex items-center gap-2 glow-text">
          <Cpu className="w-4 h-4 text-cyber-cyan animate-pulse" />
          GEOSPATIAL RESEARCH CONSOLE
        </h1>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
          SOCIAL MOVEMENT MAPPING TOOLKIT v4.02
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-cyan/20 bg-black/40">
        <button
          onClick={() => setActiveTab('control')}
          className={`flex-1 py-2 text-center border-b font-medium uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'control'
              ? 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          CONTROL
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-2 text-center border-b font-medium uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'telemetry'
              ? 'text-cyber-pink border-cyber-pink bg-cyber-pink/10'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          FILTERS
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-2 text-center border-b font-medium uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'system'
              ? 'text-cyber-yellow border-cyber-yellow bg-cyber-yellow/10'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          SYSTEM LOGS
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2 text-center border-b font-medium uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'nodes'
              ? 'text-cyber-pink border-cyber-pink bg-cyber-pink/10'
              : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/40'
          }`}
        >
          NODES
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'control' && (
            <motion.div
              key="control"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* Sliders Container */}
              <div className="space-y-4 border border-cyber-cyan/20 p-3 bg-black/30 rounded">
                <div className="flex items-center gap-1.5 text-cyber-cyan font-bold uppercase tracking-wider border-b border-cyber-cyan/20 pb-1.5 mb-2">
                  <Sliders className="w-3.5 h-3.5" />
                  Grid Interface Specs
                </div>

                {/* Node Radius Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">NODE RADIUS:</span>
                    <span className="text-cyber-cyan font-bold">{filters.nodeRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="8"
                    step="0.5"
                    value={filters.nodeRadius}
                    onChange={(e) => updateFilter('nodeRadius', parseFloat(e.target.value))}
                    className="w-full accent-cyber-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>1.5PX</span>
                    <span>8.0PX</span>
                  </div>
                </div>

                {/* Glow Intensity Slider */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">GLOW INTENSITY:</span>
                    <span className="text-cyber-pink font-bold">{Math.round(filters.glowIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={filters.glowIntensity}
                    onChange={(e) => updateFilter('glowIntensity', parseFloat(e.target.value))}
                    className="w-full accent-cyber-pink cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>OFF</span>
                    <span>150%</span>
                  </div>
                </div>

                {/* Fill Color Selector */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">FILL COLOR THEME:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[
                      { id: 'gradient', label: 'HEAT' },
                      { id: 'cyan', label: 'CYAN' },
                      { id: 'pink', label: 'PINK' },
                      { id: 'red', label: 'RED' },
                      { id: 'orange', label: 'ORGN' },
                      { id: 'yellow', label: 'YELW' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => updateFilter('baseColor', theme.id as any)}
                        className={`py-1 text-[9px] font-bold border text-center rounded transition-all duration-200 ${
                          filters.baseColor === theme.id
                            ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                            : 'bg-black/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Data Simulation Adjustments */}
              <div className="space-y-4 border border-cyber-cyan/20 p-3 bg-black/30 rounded">
                <div className="flex items-center gap-1.5 text-cyber-cyan font-bold uppercase tracking-wider border-b border-cyber-cyan/20 pb-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
                  DYNAMIC GRID DENSITY
                </div>

                {/* Point Count (Node Density) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">NODE DENSITY:</span>
                    <span className="text-cyber-yellow font-bold">{filters.pointCount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={filters.pointCount}
                    onChange={(e) => updateFilter('pointCount', parseInt(e.target.value))}
                    className="w-full accent-cyber-yellow cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>1,000 NODES</span>
                    <span>10,000 NODES</span>
                  </div>
                </div>

                {/* Connection Arcs Slider */}
                <div className="space-y-1 mt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 uppercase">ARC THICKNESS:</span>
                    <span className="text-cyber-cyan font-bold">{filters.arcWidth}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.2"
                    value={filters.arcWidth}
                    onChange={(e) => updateFilter('arcWidth', parseFloat(e.target.value))}
                    className="w-full accent-cyber-cyan cursor-pointer"
                  />
                </div>

                {/* Real-time stats */}
                <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/60 p-2 rounded border border-cyber-cyan/10">
                  <div>
                    <div className="text-slate-500 uppercase">NODES GENERATED</div>
                    <div className="text-cyber-cyan font-bold text-xs">{nodeCount}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 uppercase">ACTIVE CORES</div>
                    <div className="text-cyber-pink font-bold text-xs">{arcCount} LINKS</div>
                  </div>
                </div>
              </div>

              {/* 3D Camera Controls */}
              <div className="space-y-3 border border-cyber-cyan/20 p-3 bg-black/30 rounded">
                <div className="flex items-center gap-1.5 text-cyber-cyan font-bold uppercase tracking-wider border-b border-cyber-cyan/20 pb-1.5 mb-2">
                  <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
                  3D GEOLOCATION PRESETS
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onApplyPreset('wall-street')}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyber-cyan/10 border border-cyber-cyan/20 hover:border-cyber-cyan text-slate-300 hover:text-white rounded text-left transition-all duration-200"
                  >
                    ◬ FINANCIAL CORE
                  </button>
                  <button
                    onClick={() => onApplyPreset('midtown')}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyber-cyan/10 border border-cyber-cyan/20 hover:border-cyber-cyan text-slate-300 hover:text-white rounded text-left transition-all duration-200"
                  >
                    ◬ TIMES SQUARE
                  </button>
                  <button
                    onClick={() => onApplyPreset('dumbo')}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyber-cyan/10 border border-cyber-cyan/20 hover:border-cyber-cyan text-slate-300 hover:text-white rounded text-left transition-all duration-200"
                  >
                    ◬ BROOKLYN RELAY
                  </button>
                  <button
                    onClick={() => onApplyPreset('panoramic')}
                    className="py-1.5 px-2 bg-black/60 hover:bg-cyber-cyan/10 border border-cyber-cyan/20 hover:border-cyber-cyan text-slate-300 hover:text-white rounded text-left transition-all duration-200"
                  >
                    ◬ PANORAMIC ORBIT
                  </button>
                </div>

                {/* Orbit Mode Toggle */}
                <button
                  onClick={() => updateFilter('orbitMode', !filters.orbitMode)}
                  className={`w-full py-2 px-3 border rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                    filters.orbitMode
                      ? 'bg-cyber-pink/20 border-cyber-pink text-cyber-pink shadow-[0_0_12px_rgba(255,0,85,0.4)] animate-pulse'
                      : 'bg-black/60 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 hover:border-cyber-cyan'
                  }`}
                >
                  {filters.orbitMode ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current text-cyber-pink" />
                      DISABLE ORBIT ROTATION
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-cyber-cyan" />
                      ENABLE ORBIT ROTATION
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'telemetry' && (
            <motion.div
              key="telemetry"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Status Toggles */}
              <div className="space-y-3 border border-cyber-pink/20 p-3 bg-black/30 rounded">
                <div className="flex items-center gap-1.5 text-cyber-pink font-bold uppercase tracking-wider border-b border-cyber-pink/20 pb-1.5 mb-2">
                  <Eye className="w-3.5 h-3.5 text-cyber-pink" />
                  FILTER BY NODE STATUS
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      ACTIVE
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.activeStatus.active}
                      onChange={() => toggleStatusFilter('active')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                      RESTRICTED
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.activeStatus.restricted}
                      onChange={() => toggleStatusFilter('restricted')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                      DISRUPTED
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.activeStatus.disrupted}
                      onChange={() => toggleStatusFilter('disrupted')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                      DORMANT
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.activeStatus.dormant}
                      onChange={() => toggleStatusFilter('dormant')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Node Classification Filters */}
              <div className="space-y-3 border border-cyber-pink/20 p-3 bg-black/30 rounded">
                <div className="flex items-center gap-1.5 text-cyber-pink font-bold uppercase tracking-wider border-b border-cyber-pink/20 pb-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5 text-cyber-pink" />
                  FILTER BY SITE TYPOLOGY
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                      <span className="text-cyber-red font-bold">⊛</span> MOVEMENT HUB
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.nodeType.hub}
                      onChange={() => toggleTypeFilter('hub')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                      <span className="text-cyber-orange font-bold">▲</span> COORDINATION NETWORK
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.nodeType.network}
                      onChange={() => toggleTypeFilter('network')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                      <span className="text-cyber-cyan font-bold">■</span> FIELD SITE
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.nodeType.site}
                      onChange={() => toggleTypeFilter('site')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                      <span className="text-cyber-yellow font-bold">◆</span> DATA ARCHIVE
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.nodeType.archive}
                      onChange={() => toggleTypeFilter('archive')}
                      className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Search Node bar */}
              <div className="space-y-2 border border-cyber-pink/20 p-3 bg-black/30 rounded">
                <div className="text-[10px] text-cyber-pink font-bold uppercase tracking-wider">
                  NODE CODEX SEARCH:
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ENTER NODE ID (E.G. GRID-SIGMA)..."
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value.toUpperCase())}
                    className="w-full bg-black/80 border border-slate-700 focus:border-cyber-pink text-white py-1.5 px-3 rounded text-[10px] uppercase font-mono tracking-wider focus:outline-none placeholder-slate-600 focus:shadow-[0_0_8px_rgba(255,0,85,0.2)]"
                  />
                  {filters.searchQuery && (
                    <button 
                      onClick={() => updateFilter('searchQuery', '')}
                      className="absolute right-2.5 top-1.5 text-[9px] text-slate-500 hover:text-cyber-pink"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              {/* Style Layers Option */}
              <div className="space-y-3 border border-cyber-pink/20 p-3 bg-black/30 rounded">
                <div className="text-[10px] text-cyber-pink font-bold uppercase tracking-wider">
                  VISUAL LAYERS SETTINGS
                </div>
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-300 group-hover:text-white transition-colors">
                    EXTRUDE 3D BUILDINGS
                  </span>
                  <input
                    type="checkbox"
                    checked={filters.show3DBuildings}
                    onChange={() => updateFilter('show3DBuildings', !filters.show3DBuildings)}
                    className="w-4 h-4 rounded bg-black border-slate-700 checked:bg-cyber-pink checked:border-cyber-pink text-cyber-pink cursor-pointer"
                  />
                </label>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-[52vh] border border-cyber-yellow/20 bg-black/50 p-2.5 rounded font-mono text-[10px] leading-relaxed select-text"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyber-yellow/20 text-cyber-yellow font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 animate-pulse" />
                  SYS_DAEMON_OUTPUT
                </span>
                <span className="text-[8px] opacity-75">LIVE FEED</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar scroll-smooth">
                {consoleLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`border-l-2 pl-1.5 py-0.5 break-all ${
                      log.includes('Warning') 
                        ? 'border-red-500 text-red-400 font-bold bg-red-950/15'
                        : log.includes('ONLINE') 
                          ? 'border-emerald-500 text-emerald-400'
                          : log.includes('BOOT')
                            ? 'border-cyber-cyan text-cyber-cyan font-bold'
                            : 'border-cyber-yellow/40 text-cyber-yellow/85'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-1.5 border-t border-cyber-yellow/20 flex gap-1 items-center">
                <span className="w-2 h-3 bg-cyber-yellow animate-ping inline-block" />
                <span className="text-[8px] text-slate-500 uppercase">SYS STACK RUNNING</span>
              </div>
            </motion.div>
          )}
          {activeTab === 'nodes' && (
            <motion.div
              key="nodes"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="space-y-3 border border-cyber-pink/20 p-3 bg-black/30 rounded">
                <div className="text-[10px] text-cyber-pink font-bold uppercase tracking-wider">
                  INJECT NEW NODE
                </div>
                <input 
                  type="text" placeholder="NODE NAME" value={nodeForm.name} 
                  onChange={(e) => setNodeForm(f => ({...f, name: e.target.value}))}
                  className="w-full bg-black/80 border border-slate-700 focus:border-cyber-pink text-white py-1.5 px-3 rounded text-[10px] uppercase font-mono tracking-wider focus:outline-none placeholder-slate-600 focus:shadow-[0_0_8px_rgba(255,0,85,0.2)]"
                />
                <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="LAT" value={nodeForm.lat} onChange={e => setNodeForm(f => ({...f, lat: e.target.value}))} className="w-full bg-black/80 border border-slate-700 focus:border-cyber-pink text-white py-1.5 px-3 rounded text-[10px] uppercase font-mono tracking-wider focus:outline-none placeholder-slate-600 focus:shadow-[0_0_8px_rgba(255,0,85,0.2)]"/>
                    <input type="number" placeholder="LNG" value={nodeForm.lng} onChange={e => setNodeForm(f => ({...f, lng: e.target.value}))} className="w-full bg-black/80 border border-slate-700 focus:border-cyber-pink text-white py-1.5 px-3 rounded text-[10px] uppercase font-mono tracking-wider focus:outline-none placeholder-slate-600 focus:shadow-[0_0_8px_rgba(255,0,85,0.2)]"/>
                </div>
                <div className="space-y-1">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">SIGNAL STRENGTH</div>
                    <input type="range" min="0" max="100" value={nodeForm.strength} onChange={e => setNodeForm(f => ({...f, strength: e.target.value}))} className="w-full accent-cyber-pink cursor-pointer"/>
                </div>
                <button
                  onClick={() => {
                    onAddManualNode({
                        id: 'manual-' + Date.now(),
                        coordinates: [parseFloat(nodeForm.lng), parseFloat(nodeForm.lat)],
                        name: nodeForm.name || 'UNKNOWN_NODE',
                        value: parseInt(nodeForm.strength),
                        type: 'terminal',
                        status: 'active',
                        traffic: 0,
                        latency: 0,
                        pulseOffset: 0,
                        isManual: true
                    });
                    setNodeForm({ lat: '', lng: '', name: '', strength: '50' });
                  }}
                  className="w-full py-2 bg-cyber-pink/20 border border-cyber-pink text-cyber-pink hover:bg-cyber-pink/40 hover:text-white transition-all duration-200 font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                >
                  &gt; INJECT_NODE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer statistics */}
      <div className="p-3 border-t border-cyber-cyan/30 bg-black/60 flex items-center justify-between text-[9px] text-slate-500">
        <div>
          LATENCY: <span className="text-cyber-cyan font-bold">14.02ms</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-pink animate-ping" />
          FPS: <span className="text-cyber-pink font-bold">60.00</span>
        </div>
      </div>
    </div>
  );
}
