export interface MapNode {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  name: string;
  value: number; // e.g. 10 - 100
  type: 'hub' | 'network' | 'site' | 'archive';
  status: 'active' | 'disrupted' | 'restricted' | 'dormant';
  traffic: number; // MB/s
  latency: number; // ms
  pulseOffset: number; // animation offset
  isManual?: boolean;
}

export interface MapArc {
  id: string;
  from: [number, number]; // [longitude, latitude]
  to: [number, number];
  sourceColor: [number, number, number, number]; // [r, g, b, a]
  targetColor: [number, number, number, number];
  width: number;
  speed: number;
}

export interface MapFilters {
  nodeRadius: number;
  glowIntensity: number;
  arcWidth: number;
  arcSpeed: number;
  activeStatus: {
    active: boolean;
    restricted: boolean;
    disrupted: boolean;
    dormant: boolean;
  };
  nodeType: {
    hub: boolean;
    network: boolean;
    site: boolean;
    archive: boolean;
  };
  searchQuery: string;
  pointCount: number; // e.g. 5000
  baseColor: 'red' | 'orange' | 'yellow' | 'cyan' | 'pink' | 'gradient';
  orbitMode: boolean;
  show3DBuildings: boolean;
}
