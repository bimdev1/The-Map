import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer } from '@deck.gl/layers';
import { MapNode, MapArc, MapFilters } from '../types';

interface CyberMapProps {
  nodes: MapNode[];
  arcs: MapArc[];
  filters: MapFilters;
  selectedNode: MapNode | null;
  onSelectNode: (node: MapNode | null) => void;
  mapInstanceRef: React.MutableRefObject<maplibregl.Map | null>;
}

export default function CyberMap({
  nodes,
  arcs,
  filters,
  selectedNode,
  onSelectNode,
  mapInstanceRef,
}: CyberMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // CartoDB Dark Matter Vector Style - clean, completely dark, perfect for cyberpunk styling
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-73.985, 40.738], // Central Manhattan coordinates
      zoom: 12.8,
      pitch: 55, // Highly pitched for 3D depth and arcs
      bearing: 15,
      antialias: true,
      attributionControl: false, // Cleaner minimalist UI
    } as any);

    mapInstanceRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update sources and layers whenever map is loaded and nodes/arcs/filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Filter nodes based on active filters
    const filteredNodes = nodes.filter(node => {
      // Filter by status
      if (!filters.activeStatus[node.status]) return false;
      // Filter by infrastructure type
      if (!filters.nodeType[node.type]) return false;
      // Filter by search query
      if (filters.searchQuery && !node.name.includes(filters.searchQuery) && !node.id.includes(filters.searchQuery)) {
        return false;
      }
      return true;
    });

    // 1. Manage Node Source and Layers
    const nodeGeoJson: any = {
      type: 'FeatureCollection',
      features: filteredNodes.map(node => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: node.coordinates,
        },
        properties: {
          id: node.id,
          name: node.name,
          value: node.value,
          type: node.type,
          status: node.status,
          traffic: node.traffic,
          latency: node.latency,
        },
      })),
    };

    if (map.getSource('cyber-nodes')) {
      (map.getSource('cyber-nodes') as maplibregl.GeoJSONSource).setData(nodeGeoJson);
    } else {
      map.addSource('cyber-nodes', {
        type: 'geojson',
        data: nodeGeoJson,
      });

      // Get color expression based on theme configuration
      const getColorExpression = () => {
        return [
          'case',
          ['==', ['get', 'type'], 'core'], '#ff003c',    // Neon Red for neural cores
          ['==', ['get', 'type'], 'relay'], '#ff5500',   // Neon Orange for routers
          ['==', ['get', 'type'], 'ice'], '#f3e300',     // Neon Yellow for ICE Gateways
          '#00f0ff',                                      // Neon Cyan for standard terminals
        ];
      };

      // A. Ambient Outer Halo (Large, heavy blur, low opacity)
      map.addLayer({
        id: 'nodes-outer-halo',
        source: 'cyber-nodes',
        type: 'circle',
        paint: {
          'circle-color': getColorExpression(),
          'circle-radius': filters.nodeRadius * 5.0,
          'circle-blur': 1.2,
          'circle-opacity': filters.glowIntensity * 0.25,
        },
      });

      // B. Inner Neon Glow (Medium, medium blur, medium opacity)
      map.addLayer({
        id: 'nodes-inner-glow',
        source: 'cyber-nodes',
        type: 'circle',
        paint: {
          'circle-color': getColorExpression(),
          'circle-radius': filters.nodeRadius * 2.5,
          'circle-blur': 0.7,
          'circle-opacity': filters.glowIntensity * 0.6,
        },
      });

      // C. Core Point (Small, sharp, high opacity)
      map.addLayer({
        id: 'nodes-core',
        source: 'cyber-nodes',
        type: 'circle',
        paint: {
          'circle-color': getColorExpression(),
          'circle-radius': filters.nodeRadius,
          'circle-opacity': 0.95,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.2,
        },
      });

      // D. Register events on the nodes
      map.on('click', 'nodes-core', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          const clickedNode = nodes.find(n => n.name === props.name);
          if (clickedNode) {
            onSelectNode(clickedNode);
            // Center camera smoothly on clicked node
            map.easeTo({
              center: clickedNode.coordinates,
              zoom: Math.max(map.getZoom(), 13.8),
              duration: 1000,
            });
          }
        }
      });

      map.on('mouseenter', 'nodes-core', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'nodes-core', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // 2. Manage 3D Connection Arcs (via deck.gl MapboxLayer inside MapLibre)
    const activeArcs = arcs.filter(arc => {
      // Only keep connections if both source and target nodes match active filters
      const fromNode = nodes.find(n => n.coordinates[0] === arc.from[0] && n.coordinates[1] === arc.from[1]);
      const toNode = nodes.find(n => n.coordinates[0] === arc.to[0] && n.coordinates[1] === arc.to[1]);
      
      if (!fromNode || !toNode) return false;
      
      if (!filters.activeStatus[fromNode.status] || !filters.activeStatus[toNode.status]) return false;
      if (!filters.nodeType[fromNode.type] || !filters.nodeType[toNode.type]) return false;
      
      return true;
    });

    // 2. Manage 3D Connection Arcs (via deck.gl MapboxOverlay inside MapLibre)
    if (!overlayRef.current) {
        overlayRef.current = new MapboxOverlay({
          layers: []
        });
        map.addControl(overlayRef.current as any);
    }

    overlayRef.current.setProps({
        layers: [
            new ArcLayer({
              id: 'deck-arcs',
              data: activeArcs,
              getSourcePosition: (d: MapArc) => d.from,
              getTargetPosition: (d: MapArc) => d.to,
              getSourceColor: (d: MapArc) => d.sourceColor,
              getTargetColor: (d: MapArc) => d.targetColor,
              getWidth: (d: MapArc) => d.width * filters.arcWidth,
              getHeight: 0.65, // Parabolic height scale
              tilt: 12,        // Slightly tilted to show full 3D arc shapes
            })
        ]
    });

    // 3. Customize Base Map Color Schemes & Apply 3D Building Extrusions
    const style = map.getStyle();
    
    // Find building footprints source
    const buildingLayer = style.layers?.find(
      l => l.id.includes('building') || (l as any)['source-layer']?.includes('building')
    );

    if (map.getLayer('cyber-3d-buildings')) {
      map.removeLayer('cyber-3d-buildings');
    }

    if (filters.show3DBuildings && buildingLayer && buildingLayer.source) {
      map.addLayer({
        id: 'cyber-3d-buildings',
        source: buildingLayer.source,
        'source-layer': (buildingLayer as any)['source-layer'],
        type: 'fill-extrusion',
        minzoom: 12.5,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'height'],
            0, '#040812',    // Tiny buildings are very dark charcoal blue
            50, '#081223',   // Medium structures
            150, '#0b1c35',  // Skyscrapers
            300, '#0f2444'   // Tallest monoliths
          ],
          'fill-extrusion-height': ['coalesce', ['get', 'height'], ['get', 'render_height'], 30],
          'fill-extrusion-base': ['coalesce', ['get', 'min_height'], ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.82,
        },
      });
    }

    // Apply Node Filter colors dynamically
    let colorExpression: any;
    if (filters.baseColor === 'gradient') {
      colorExpression = [
        'case',
        ['==', ['get', 'type'], 'core'], '#ff003c',
        ['==', ['get', 'type'], 'relay'], '#ff5500',
        ['==', ['get', 'type'], 'ice'], '#f3e300',
        '#00f0ff',
      ];
    } else if (filters.baseColor === 'cyan') {
      colorExpression = '#00f0ff';
    } else if (filters.baseColor === 'pink') {
      colorExpression = '#ff0055';
    } else if (filters.baseColor === 'yellow') {
      colorExpression = '#f3e300';
    } else if (filters.baseColor === 'red') {
      colorExpression = '#ff003c';
    } else if (filters.baseColor === 'orange') {
      colorExpression = '#ff5500';
    }

    if (map.getLayer('nodes-core')) {
      map.setPaintProperty('nodes-core', 'circle-color', colorExpression);
      map.setPaintProperty('nodes-core', 'circle-radius', filters.nodeRadius);
    }
    if (map.getLayer('nodes-inner-glow')) {
      map.setPaintProperty('nodes-inner-glow', 'circle-color', colorExpression);
      map.setPaintProperty('nodes-inner-glow', 'circle-radius', filters.nodeRadius * 2.5);
      map.setPaintProperty('nodes-inner-glow', 'circle-opacity', filters.glowIntensity * 0.6);
    }
    if (map.getLayer('nodes-outer-halo')) {
      map.setPaintProperty('nodes-outer-halo', 'circle-color', colorExpression);
      map.setPaintProperty('nodes-outer-halo', 'circle-radius', filters.nodeRadius * 5.0);
      map.setPaintProperty('nodes-outer-halo', 'circle-opacity', filters.glowIntensity * 0.25);
    }

  }, [nodes, arcs, filters, mapLoaded]);

  // Handle active selected node highlighting on the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !selectedNode) return;

    // Center camera on the selected node if one is chosen
    map.easeTo({
      center: selectedNode.coordinates,
      zoom: Math.max(map.getZoom(), 13.8),
      duration: 1000,
    });

  }, [selectedNode, mapLoaded]);

  return (
    <div className="relative w-full h-full bg-[#030306]">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
