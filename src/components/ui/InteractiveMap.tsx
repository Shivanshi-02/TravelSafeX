"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "victim" | "guardian" | "police" | "safezone";
}

interface InteractiveMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markers?: MapMarker[];
  routeCoordinates?: [number, number][]; // Array of [lat, lng]
  lineColor?: string;
}

export default function InteractiveMap({
  lat,
  lng,
  zoom = 15,
  markers = [],
  routeCoordinates = [],
  lineColor = "#10b981",
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersGroup = useRef<any>(null);
  const routeLine = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // 1. Load Leaflet CSS
    if (!document.getElementById("leaflet-css-cdn")) {
      const link = document.createElement("link");
      link.id = "leaflet-css-cdn";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // 2. Initialize map instance
      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([lat, lng], zoom);

        // Dark Matter map tiles (obsidian-cyber aesthetic)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          subdomains: "abcd",
        }).addTo(leafletMap.current);

        // Add zoom controls in bottom-right
        L.control.zoom({ position: "bottomright" }).addTo(leafletMap.current);

        // Layer group for markers
        markersGroup.current = L.layerGroup().addTo(leafletMap.current);
      } else {
        // Update view
        leafletMap.current.setView([lat, lng], zoom);
      }

      // 3. Render Markers
      if (markersGroup.current) {
        markersGroup.current.clearLayers();

        markers.forEach((marker) => {
          // Custom glowing html marker icons
          const colorClass =
            marker.type === "victim"
              ? "bg-red-500 shadow-[0_0_12px_#ef4444]"
              : marker.type === "guardian"
                ? "bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                : marker.type === "police"
                  ? "bg-purple-500 shadow-[0_0_12px_#a855f7]"
                  : "bg-emerald-400 shadow-[0_0_12px_#34d399]";

          const customIcon = L.divIcon({
            className: "custom-map-icon",
            html: `<div class="w-3.5 h-3.5 rounded-full border-2 border-white ${colorClass} transition-all duration-500"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          const m = L.marker([marker.lat, marker.lng], { icon: customIcon })
            .bindPopup(`<span class="text-[10px] font-mono text-zinc-900">${marker.label}</span>`)
            .addTo(markersGroup.current);

          if (marker.type === "victim") {
            m.openPopup();
          }
        });
      }

      // 4. Render Route Path
      if (routeLine.current) {
        leafletMap.current.removeLayer(routeLine.current);
      }

      if (routeCoordinates && routeCoordinates.length > 0) {
        routeLine.current = L.polyline(routeCoordinates, {
          color: lineColor,
          weight: 3.5,
          opacity: 0.85,
          lineJoin: "round",
        }).addTo(leafletMap.current);
      }
    };

    // 5. Load Leaflet script dynamically
    if (!(window as any).L) {
      if (!document.getElementById("leaflet-js-script")) {
        const script = document.createElement("script");
        script.id = "leaflet-js-script";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.body.appendChild(script);
      }
    } else {
      initMap();
    }
  }, [lat, lng, zoom, markers, routeCoordinates, lineColor]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/5 bg-zinc-950">
      <div ref={mapRef} className="w-full h-full z-10" />
      {/* Decorative HUD scanning overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl z-20 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
