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
    name: 'Financial District Protest Hub',
    lon: -74.0090,
    lat: 40.7060,
    stdDev: 0.005,
    weight: 0.35,
    preferredType: 'hub' as const,
  },
  {
    name: 'Midtown Mutual Aid Network',
    lon: -73.9850,
    lat: 40.7540,
    stdDev: 0.007,
    weight: 0.35,
    preferredType: 'network' as const,
  },
  {
    name: 'Brooklyn Organizing Center',
    lon: -73.9600,
    lat: 40.7150,
    stdDev: 0.008,
    weight: 0.15,
    preferredType: 'site' as const,
  },
  {
    name: 'Historical Archive (LIC)',
    lon: -73.9450,
    lat: 40.7450,
    stdDev: 0.006,
    weight: 0.10,
    preferredType: 'archive' as const,
  },
  {
    name: 'Rogue Field Site (Central Park)',
    lon: -73.9680,
    lat: 40.7800,
    stdDev: 0.012,
    weight: 0.05,
    preferredType: 'archive' as const,
  },
];

const NODE_TYPES = ['hub', 'network', 'site', 'archive'] as const;
const NODE_STATUSES = ['active', 'disrupted', 'restricted', 'dormant'] as const;

const PREFIXES = ['SITE', 'NODE', 'SOC', 'DATA', 'ARCHIVE', 'GRID', 'MOV', 'AID', 'COLLECTIVE', 'HUB'];
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
    // Hubs have generally higher values
    let value = Math.floor(Math.random() * 60) + 20;
    if (type === 'hub') value = Math.floor(Math.random() * 30) + 70;
    else if (type === 'site') value = Math.floor(Math.random() * 40) + 10;
    
    // Select status based on probabilities
    const statusRoll = Math.random();
    let status: MapNode['status'] = 'active';
    if (statusRoll < 0.1) {
      status = 'dormant';
    } else if (statusRoll < 0.22) {
      status = 'restricted';
    } else if (statusRoll < 0.28) {
      status = 'disrupted';
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
  const hubs = nodes.filter(n => n.type === 'hub' && n.status !== 'dormant');
  const networks = nodes.filter(n => n.type === 'network' && n.status !== 'dormant');
  
  if (hubs.length > 0) {
    // A. Connect Hub to Hub to form the high-speed backbone
    const backboneConnections = Math.min(30, Math.floor(hubs.length * 1.5));
    for (let i = 0; i < backboneConnections; i++) {
      const fromNode = hubs[Math.floor(Math.random() * hubs.length)];
      const toNode = hubs[Math.floor(Math.random() * hubs.length)];
      
      if (fromNode.id !== toNode.id) {
        arcs.push(createArc(`arc-backbone-${i}`, fromNode, toNode, 'hub-hub'));
      }
    }
    
    // B. Connect Networks to nearest Hubs
    const networkConnections = Math.min(120, networks.length);
    for (let i = 0; i < networkConnections; i++) {
      const fromNode = networks[i];
      // Find a random hub
      const toNode = hubs[Math.floor(Math.random() * hubs.length)];
      arcs.push(createArc(`arc-network-${i}`, fromNode, toNode, 'network-hub'));
    }
    
    // C. Connect some sites/archives to nearby networks or hubs
    const peripherals = nodes.filter(n => (n.type === 'site' || n.type === 'archive') && n.status === 'active');
    const randomConns = Math.min(100, Math.floor(peripherals.length * 0.15));
    
    for (let i = 0; i < randomConns; i++) {
      const fromNode = peripherals[Math.floor(Math.random() * peripherals.length)];
      const toNode = Math.random() > 0.4 && networks.length > 0
        ? networks[Math.floor(Math.random() * networks.length)]
        : hubs[Math.floor(Math.random() * hubs.length)];
        
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
  
  if (classification === 'hub-hub') {
    width = 3.0;
    speed = 3.0;
    // Hub high-speed connections glow hot yellow-to-orange-to-red
    sourceColor = [255, 0, 60, 220];   // Neon Red
    targetColor = [243, 227, 0, 220];  // Neon Yellow
  } else if (classification === 'network-hub') {
    width = 1.8;
    speed = 2.0;
    sourceColor = [255, 85, 0, 180];   // Neon Orange
    targetColor = [0, 240, 255, 180];  // Neon Cyan
  } else {
    // Peripherals are cyan or pink
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
