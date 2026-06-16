"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";

interface PoliceCommandMapProps {
  isEmergency: boolean;
  simStep: number;
  layers: {
    victimRoute: boolean;
    deviceRoute: boolean;
    guardianRoutes: boolean;
    policeRoutes: boolean;
    safeZones: boolean;
    hospitals: boolean;
    cctv: boolean;
    hotspots: boolean;
    traffic: boolean;
  };
  victimPos: [number, number];
  devicePos: [number, number];
  policePos: [number, number];
  guardianPos: [number, number];
}

export default function PoliceCommandMap({
  isEmergency,
  simStep,
  layers,
  victimPos,
  devicePos,
  policePos,
  guardianPos,
}: PoliceCommandMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const layersGroup = useRef<Record<string, any>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Load Leaflet CSS if not already present
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

      if (!leafletMap.current) {
        leafletMap.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([28.6273, 77.3725], 14);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 20,
          subdomains: "abcd",
        }).addTo(leafletMap.current);

        L.control.zoom({ position: "bottomright" }).addTo(leafletMap.current);

        // Initialize layer groups
        const groupKeys = [
          "routes",
          "guardians",
          "police",
          "safezones",
          "hospitals",
          "cctv",
          "hotspots",
          "traffic",
        ];
        groupKeys.forEach((key) => {
          layersGroup.current[key] = L.layerGroup().addTo(leafletMap.current);
        });
      }

      const L_inst = L;
      const map = leafletMap.current;
      const groups = layersGroup.current;

      // Clear all layer groups before drawing the new tick state
      Object.values(groups).forEach((g: any) => g.clearLayers());

      // 1. Draw CCTV Coverage (cyan radar-like circles)
      if (layers.cctv) {
        const cctvCoords = [
          [28.6290, 77.3710],
          [28.6320, 77.3760],
          [28.6250, 77.3680],
          [28.6340, 77.3820]
        ];
        cctvCoords.forEach((coord, i) => {
          L_inst.circle(coord, {
            radius: 180,
            color: "#22d3ee",
            weight: 1,
            fillColor: "#22d3ee",
            fillOpacity: 0.08,
            dashArray: "3, 3"
          }).bindPopup(`<span class="text-[8px] font-mono text-zinc-900">CCTV Node #${100 + i} Status: Online</span>`)
            .addTo(groups.cctv);
        });
      }

      // 2. Draw Crime Hotspots (warning orange/red heat circles)
      if (layers.hotspots) {
        const hotspotsCoords = [
          { loc: [28.6310, 77.3780], val: "High Snatch Probability (91%)" },
          { loc: [28.6260, 77.3820], val: "Poorly Lit Area Index" }
        ];
        hotspotsCoords.forEach((spot) => {
          L_inst.circle(spot.loc, {
            radius: 250,
            color: "#f97316",
            weight: 1.5,
            fillColor: "#ef4444",
            fillOpacity: 0.15
          }).bindPopup(`<span class="text-[8px] font-mono text-zinc-900">Warning: ${spot.val}</span>`)
            .addTo(groups.hotspots);
        });
      }

      // 3. Draw Safe Zones & Hospitals
      if (layers.safeZones) {
        L_inst.circle([28.6240, 77.3700], {
          radius: 120,
          color: "#10b981",
          weight: 1,
          fillColor: "#10b981",
          fillOpacity: 0.1
        }).addTo(groups.safezones);

        const hubIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="w-3.5 h-3.5 rounded-full border border-white bg-emerald-500 shadow-[0_0_10px_#10b981] flex items-center justify-center text-[7px] text-white font-extrabold font-mono">H</div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        L_inst.marker([28.6240, 77.3700], { icon: hubIcon })
          .bindPopup(`<span class="text-[8px] font-mono text-zinc-900">TravelSafe Guard Hub #03</span>`)
          .addTo(groups.safezones);
      }

      if (layers.hospitals) {
        const hospIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="w-3.5 h-3.5 rounded-full border border-white bg-pink-500 shadow-[0_0_10px_#ec4899] flex items-center justify-center text-[7px] text-white font-extrabold font-mono">M</div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        L_inst.marker([28.6270, 77.3640], { icon: hospIcon })
          .bindPopup(`<span class="text-[8px] font-mono text-zinc-900">Noida Metro Hospital</span>`)
          .addTo(groups.hospitals);
      }

      // 4. Draw Traffic Density (thick orange overlays)
      if (layers.traffic) {
        L_inst.polyline([
          [28.6273, 77.3725],
          [28.6320, 77.3760],
          [28.6340, 77.3820]
        ], {
          color: "#eab308",
          weight: 6,
          opacity: 0.35
        }).addTo(groups.traffic);
      }

      // 5. Draw Routes
      // Victim/commuter route
      if (layers.victimRoute) {
        // Normal travel (green)
        L_inst.polyline([
          [28.6273, 77.3725],
          [28.6285, 77.3715],
          [28.6295, 77.3705],
          [28.6300, 77.3695],
          [28.5747, 77.3560]
        ], {
          color: isEmergency ? "#ef4444" : "#10b981",
          weight: 3.5,
          opacity: 0.8
        }).addTo(groups.routes);
      }

      // Stolen device route (red)
      if (layers.deviceRoute && isEmergency && simStep >= 2) {
        L_inst.polyline([
          [28.6310, 77.3780],
          [28.6340, 77.3750],
          [28.6360, 77.3720],
          [28.6380, 77.3700]
        ], {
          color: "#ef4444",
          weight: 3.5,
          opacity: 0.9,
          dashArray: "5, 5"
        }).addTo(groups.routes);
      }

      // Police unit path (blue)
      if (layers.policeRoutes && isEmergency && simStep >= 2) {
        L_inst.polyline([
          [28.6300, 77.3650],
          [28.6320, 77.3670],
          [28.6350, 77.3690],
          [28.6360, 77.3720],
          devicePos
        ], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.85
        }).addTo(groups.routes);
      }

      // Guardian responder path (yellow)
      if (layers.guardianRoutes && isEmergency && simStep >= 2) {
        L_inst.polyline([
          [28.6225, 77.3660],
          [28.6250, 77.3700],
          [28.6280, 77.3740],
          devicePos
        ], {
          color: "#eab308",
          weight: 3,
          opacity: 0.85
        }).addTo(groups.routes);
      }

      // 6. Draw Markers for Moving entities
      // Start & Destination markers
      const startIcon = L_inst.divIcon({
        className: "custom-map-icon",
        html: `<div class="w-3.5 h-3.5 rounded-full border border-white bg-zinc-400 flex items-center justify-center text-[7px] text-zinc-950 font-bold font-mono">S</div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      L_inst.marker([28.6273, 77.3725], { icon: startIcon }).addTo(groups.routes);

      const destIcon = L_inst.divIcon({
        className: "custom-map-icon",
        html: `<div class="w-3.5 h-3.5 rounded-full border border-white bg-zinc-900 flex items-center justify-center text-[7px] text-emerald-400 font-bold font-mono">D</div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      L_inst.marker([28.5747, 77.3560], { icon: destIcon }).addTo(groups.routes);

      // Moving victim marker
      if (layers.victimRoute) {
        const colorClass = isEmergency ? "bg-red-500 shadow-[0_0_12px_#ef4444]" : "bg-emerald-400 shadow-[0_0_12px_#10b981]";
        const victimIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 rounded-full border border-cyan-400/30 animate-ping"></div>
            <div class="w-4.5 h-4.5 rounded-full border-2 border-white ${colorClass} flex items-center justify-center text-[7px] text-white font-extrabold">P</div>
          </div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        L_inst.marker(victimPos, { icon: victimIcon })
          .bindPopup(`<span class="text-[9px] font-mono text-zinc-900">Victim: Priya Sharma<br/>Status: ${isEmergency ? "🚨 Distressed" : "🟢 Travelling"}</span>`)
          .addTo(groups.routes);
      }

      // Moving stolen device target
      if (layers.deviceRoute && isEmergency && simStep >= 2) {
        const deviceIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full border border-red-500/50 animate-ping"></div>
            <div class="w-4 h-4 rounded-full border-2 border-white bg-red-600 shadow-[0_0_10px_#ef4444] flex items-center justify-center text-[7px] text-white font-extrabold font-mono">🚨</div>
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L_inst.marker(devicePos, { icon: deviceIcon })
          .bindPopup(`<span class="text-[9px] font-mono text-zinc-900">🚨 Stolen Device Beacon<br/>Speed: 52 km/h</span>`)
          .addTo(groups.routes);
      }

      // Moving Police marker
      if (layers.policeRoutes && isEmergency && simStep >= 2) {
        const policeIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="w-4 h-4 rounded-full border border-white bg-blue-600 shadow-[0_0_10px_#3b82f6] flex items-center justify-center text-[8px] text-white font-extrabold font-mono">P14</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L_inst.marker(policePos, { icon: policeIcon })
          .bindPopup(`<span class="text-[9px] font-mono text-zinc-900">PCR Unit P-14<br/>Status: Intercepting</span>`)
          .addTo(groups.routes);
      }

      // Moving Guardian marker
      if (layers.guardianRoutes && isEmergency && simStep >= 2) {
        const guardianIcon = L_inst.divIcon({
          className: "custom-map-icon",
          html: `<div class="w-4 h-4 rounded-full border border-white bg-yellow-500 shadow-[0_0_10px_#f59e0b] flex items-center justify-center text-[8px] text-zinc-900 font-extrabold font-mono">G</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        L_inst.marker(guardianPos, { icon: guardianIcon })
          .bindPopup(`<span class="text-[9px] font-mono text-zinc-900">Guardian Rahul Singh<br/>Status: Responding</span>`)
          .addTo(groups.routes);
      }

      // Dynamic view positioning: zoom into incident area if emergency triggers
      if (isEmergency) {
        if (simStep === 1) {
          map.setView([28.6310, 77.3780], 16); // Zoom into Noida Sec 63 (incident area)
        } else if (simStep >= 2) {
          // Fit bounds of victim pos, device pos, and police pos
          const bounds = L_inst.latLngBounds([victimPos, devicePos, policePos, guardianPos]);
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      } else {
        map.setView([28.6273, 77.3725], 14); // Back to default CP overview
      }
    };

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
  }, [
    isEmergency,
    simStep,
    layers,
    victimPos,
    devicePos,
    policePos,
    guardianPos,
  ]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/5 bg-zinc-950">
      <div ref={mapRef} className="w-full h-full z-10" />
      {/* HUD scanning overlay */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-xl z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.85)]" />
      {/* Map Scanning Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,18,24,0)_97%,rgba(34,211,238,0.02)_97%),linear-gradient(90deg,rgba(18,18,24,0)_97%,rgba(34,211,238,0.02)_97%)] bg-[size:30px_30px] z-15" />
    </div>
  );
}
