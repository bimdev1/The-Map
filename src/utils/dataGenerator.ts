import { MapNode, MapArc } from '../types';

// Helper for Gaussian / Box-Muller transform to get natural organic clustering
function randomNormal(mean = 0, stdDev = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

const CLUSTERS = [
  {
    name: 'Neural Core (Wall Street)',
    lon: -74.0090,
    lat: 40.7060,
    stdDev: 0.005,
    weight: 0.35,
    preferredType: 'core' as const,
  },
  {
    name: 'Grid Hub (Midtown)',
    lon: -73.9850,
    lat: 40.7540,
    stdDev: 0.007,
    weight: 0.35,
    preferredType: 'relay' as const,
  },
  {
    name: 'Sub-Net Sector (Williamsburg)',
    lon: -73.9600,
    lat: 40.7150,
    stdDev: 0.008,
    weight: 0.15,
    preferredType: 'terminal' as const,
  },
  {
    name: 'LIC Relay (Queens)',
    lon: -73.9450,
    lat: 40.7450,
    stdDev: 0.006,
    weight: 0.10,
    preferredType: 'ice' as const,
  },
  {
    name: 'Rogue Outpost (Central Park)',
    lon: -73.9680,
    lat: 40.7800,
    stdDev: 0.012,
    weight: 0.05,
    preferredType: 'ice' as const,
  },
];

const NODE_TYPES = ['core', 'relay', 'terminal', 'ice'] as const;
const NODE_STATUSES = ['active', 'compromised', 'restricted', 'offline'] as const;

const PREFIXES = ['GRID', 'CORE', 'NODE', 'ICE', 'TERM', 'NET', 'SYS', 'DAEMON', 'PROXY', 'HUB'];
const SUFFIXES = ['ALPHA', 'SIGMA', 'OMEGA', 'X', 'PRIME', 'V', 'ZETA', 'BETA', 'KAPPA', 'LINK'];

function generateNodeName(id: number): string {
  const p = PREFIXES[id % PREFIXES.length];
  const s = SUFFIXES[(id >> 1) % SUFFIXES.length];
  const hex = (id * 179 + 543).toString(16).toUpperCase().slice(-4);
  return `${p}-${s}_${hex}`;
}

export function generateCyberData(count: number): { nodes: MapNode[]; arcs: MapArc[] } {
  const nodes: MapNode[] = [];
  
  // 1. Generate Nodes
  for (let i = 0; i < count; i++) {
    // Select cluster based on weights
    const roll = Math.random();
    let selectedCluster = CLUSTERS[0];
    let weightSum = 0;
    
    for (const cluster of CLUSTERS) {
      weightSum += cluster.weight;
      if (roll <= weightSum) {
        selectedCluster = cluster;
        break;
      }
    }
    
    // Gaussian spread coordinates
    const lon = randomNormal(selectedCluster.lon, selectedCluster.stdDev);
    const lat = randomNormal(selectedCluster.lat, selectedCluster.stdDev);
    
    // Generate type and value
    const typeRoll = Math.random();
    let type: MapNode['type'] = selectedCluster.preferredType;
    if (typeRoll > 0.7) {
      type = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
    }
    
    // Value represents data throughput (10 - 100)
    // Cores have generally higher values
    let value = Math.floor(Math.random() * 60) + 20;
    if (type === 'core') value = Math.floor(Math.random() * 30) + 70;
    else if (type === 'terminal') value = Math.floor(Math.random() * 40) + 10;
    
    // Select status based on probabilities
    const statusRoll = Math.random();
    let status: MapNode['status'] = 'active';
    if (statusRoll < 0.1) {
      status = 'offline';
    } else if (statusRoll < 0.22) {
      status = 'restricted';
    } else if (statusRoll < 0.28) {
      status = 'compromised';
    }
    
    // Traffic & Latency based on value
    const traffic = parseFloat((value * (Math.random() * 2.5 + 0.5)).toFixed(1)); // MB/s
    const latency = type === 'core' 
      ? Math.floor(Math.random() * 8) + 2 // Cores are extremely fast
      : Math.floor(Math.random() * 80) + (status === 'restricted' ? 120 : 10);
      
    nodes.push({
      id: `node-${i}`,
      coordinates: [lon, lat],
      name: generateNodeName(i),
      value,
      type,
      status,
      traffic,
      latency,
      pulseOffset: Math.random() * Math.PI * 2,
    });
  }
  
  // 2. Generate Arcs (connections between nodes)
  const arcs: MapArc[] = [];
  const cores = nodes.filter(n => n.type === 'core' && n.status !== 'offline');
  const relays = nodes.filter(n => n.type === 'relay' && n.status !== 'offline');
  
  if (cores.length > 0) {
    // A. Connect Core to Core to form the high-speed backbone
    const backboneConnections = Math.min(30, Math.floor(cores.length * 1.5));
    for (let i = 0; i < backboneConnections; i++) {
      const fromNode = cores[Math.floor(Math.random() * cores.length)];
      const toNode = cores[Math.floor(Math.random() * cores.length)];
      
      if (fromNode.id !== toNode.id) {
        arcs.push(createArc(`arc-backbone-${i}`, fromNode, toNode, 'core-core'));
      }
    }
    
    // B. Connect Relays to nearest Cores
    const relayConnections = Math.min(120, relays.length);
    for (let i = 0; i < relayConnections; i++) {
      const fromNode = relays[i];
      // Find a random core (or we could search for closest, but random is great for cross-river connections)
      const toNode = cores[Math.floor(Math.random() * cores.length)];
      arcs.push(createArc(`arc-relay-${i}`, fromNode, toNode, 'relay-core'));
    }
    
    // C. Connect some terminals/ICE to nearby relays or cores
    const terminals = nodes.filter(n => (n.type === 'terminal' || n.type === 'ice') && n.status === 'active');
    const randomConns = Math.min(100, Math.floor(terminals.length * 0.15));
    
    for (let i = 0; i < randomConns; i++) {
      const fromNode = terminals[Math.floor(Math.random() * terminals.length)];
      const toNode = Math.random() > 0.4 && relays.length > 0
        ? relays[Math.floor(Math.random() * relays.length)]
        : cores[Math.floor(Math.random() * cores.length)];
        
      arcs.push(createArc(`arc-peripheral-${i}`, fromNode, toNode, 'peripheral'));
    }
  }
  
  return { nodes, arcs };
}

function createArc(id: string, fromNode: MapNode, toNode: MapNode, classification: string): MapArc {
  // Determine arc styling based on connection type
  let width = 1.0;
  let speed = 1.5;
  
  // Neon colors in RGB + opacity
  // Red: [255, 0, 60], Orange: [255, 85, 0], Yellow: [243, 227, 0], Cyan: [0, 240, 255], Pink: [255, 0, 85]
  let sourceColor: [number, number, number, number] = [0, 240, 255, 180]; // Cyan default
  let targetColor: [number, number, number, number] = [255, 0, 85, 180];  // Pink default
  
  if (classification === 'core-core') {
    width = 3.0;
    speed = 3.0;
    // Core high-speed connections glow hot yellow-to-orange-to-red
    sourceColor = [255, 0, 60, 220];   // Neon Red
    targetColor = [243, 227, 0, 220];  // Neon Yellow
  } else if (classification === 'relay-core') {
    width = 1.8;
    speed = 2.0;
    sourceColor = [255, 85, 0, 180];   // Neon Orange
    targetColor = [0, 240, 255, 180];  // Neon Cyan
  } else {
    // Terminals are cyan or pink
    width = 1.0;
    speed = 1.2;
    sourceColor = [0, 240, 255, 120];  // Neon Cyan (softer)
    targetColor = [255, 0, 85, 120];   // Neon Pink
  }
  
  return {
    id,
    from: fromNode.coordinates,
    to: toNode.coordinates,
    sourceColor,
    targetColor,
    width,
    speed,
  };
}
