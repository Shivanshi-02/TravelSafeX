"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Layers,
  Activity,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Bell,
  User,
  Compass,
  Database,
  Edit,
  ShieldCheck,
  Sliders,
  AlertTriangle,
  Volume2,
  Lock,
  Smartphone,
  Camera,
  CheckCircle2
} from "lucide-react";
import { useTravelSafeStore } from "@/store/useTravelSafeStore";
import { useMockStreams } from "@/hooks/useMockStreams";
import dynamic from "next/dynamic";

const CrimeChart = dynamic(() => import("@/components/police/CrimeChart"), {
  ssr: false,
});

const PoliceCommandMap = dynamic(() => import("@/components/police/PoliceCommandMap"), {
  ssr: false,
});

interface TimelineLog {
  time: string;
  msg: string;
  type: "info" | "alert" | "dispatch" | "success";
}

// Linear interpolation between two coordinates
function interpolate(p1: [number, number], p2: [number, number], frac: number): [number, number] {
  return [
    p1[0] + (p2[0] - p1[0]) * frac,
    p1[1] + (p2[1] - p1[1]) * frac
  ];
}

// Interpolate position along a full path of coordinates based on progress t (0 to 1)
function interpolateRoute(route: [number, number][], t: number): [number, number] {
  if (route.length === 0) return [0, 0];
  if (route.length === 1) return route[0];
  if (t <= 0) return route[0];
  if (t >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const rawIdx = t * totalSegments;
  const idx = Math.floor(rawIdx);
  const frac = rawIdx - idx;

  return interpolate(route[idx], route[idx + 1], frac);
}

// Coordinates Noida Sector 62 -> Noida City Centre
const greenRoute: [number, number][] = [
  [28.6273, 77.3725], // Sector 62 Start
  [28.6285, 77.3715],
  [28.6295, 77.3705],
  [28.6300, 77.3695],
  [28.6310, 77.3780]  // Sector 63 Junction (Snatch)
];

const redRoute: [number, number][] = [
  [28.6310, 77.3780], // Snatch Point
  [28.6340, 77.3750],
  [28.6360, 77.3720],
  [28.6380, 77.3700]  // Escape End Point
];

const blueRoute: [number, number][] = [
  [28.6300, 77.3650], // Police Station
  [28.6320, 77.3670],
  [28.6350, 77.3690],
  [28.6380, 77.3700]  // Intercept End Point
];

const yellowRoute: [number, number][] = [
  [28.6225, 77.3660], // Guardian start
  [28.6250, 77.3700],
  [28.6280, 77.3740],
  [28.6310, 77.3780]  // Guardian meets victim
];

export default function PolicePage() {
  useMockStreams(); // Start global mock streams

  // Zustand global states and actions
  const isAuthenticated = useTravelSafeStore((s) => s.isAuthenticated);
  const userPersona = useTravelSafeStore((s) => s.userPersona);
  const isSimulating = useTravelSafeStore((s) => s.isSimulating);
  const systemMode = useTravelSafeStore((s) => s.systemMode);
  const startThreatSimulation = useTravelSafeStore((s) => s.startThreatSimulation);
  const stopThreatSimulation = useTravelSafeStore((s) => s.stopThreatSimulation);
  const globalAadhaar = useTravelSafeStore((s) => s.aadhaarNumber);
  const setAuthStatus = useTravelSafeStore((s) => s.setAuthStatus);
  const setUserPersona = useTravelSafeStore((s) => s.setUserPersona);

  // Local authentication wizard states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginStep, setLoginStep] = useState<"ID" | "AADHAAR" | "OTP" | "FACE" | "SUCCESS">("ID");
  const [policeId, setPoliceId] = useState("IPS-2026-9041");
  const [aadhaarInput, setAadhaarInput] = useState("5874 9632 1014");
  const [otpInput, setOtpInput] = useState("1234");
  const [faceScanProgress, setFaceScanProgress] = useState(0);

  // Sync local login with global Zustand store if logged in elsewhere
  useEffect(() => {
    if (isAuthenticated && userPersona === "POLICE") {
      setIsLoggedIn(true);
    }
  }, [isAuthenticated, userPersona]);

  // Simulation progression ticks
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (!isSimulating) {
      setTicks(0);
      return;
    }
    const interval = setInterval(() => {
      setTicks((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Live coordinates based on simulation progression ticks and active mode
  const [positions, setPositions] = useState({
    victim: [28.6273, 77.3725] as [number, number],
    device: [28.6273, 77.3725] as [number, number],
    police: [28.6300, 77.3650] as [number, number],
    guardian: [28.6225, 77.3660] as [number, number]
  });

  const [metrics, setMetrics] = useState({
    speed: 15,
    covered: 0.8,
    remaining: 4.3,
    direction: "SW",
    eta: "12 Minutes"
  });

  // Officer Profile Information
  const officerInfo = {
    name: "ACP Vikram Rathore",
    badge: policeId || "IPS-2024-8742",
    station: "Noida Sector 62 Head Command",
    role: "Chief Emergency Dispatcher"
  };

  // Layer Toggles
  const [layers, setLayers] = useState({
    victimRoute: true,
    deviceRoute: true,
    guardianRoutes: true,
    policeRoutes: true,
    safeZones: true,
    hospitals: true,
    cctv: true,
    hotspots: true,
    traffic: false
  });

  const [timelineLogs, setTimelineLogs] = useState<TimelineLog[]>([
    { time: "22:45 PM", msg: "Police Command Terminal online & listening.", type: "info" }
  ]);

  const addLog = useCallback((time: string, msg: string, type: "info" | "alert" | "dispatch" | "success") => {
    setTimelineLogs((prev) => [{ time, msg, type }, ...prev]);
  }, []);

  // Dispatchable Police Units
  const [policeUnits, setPoliceUnits] = useState([
    { id: "p14", name: "PCR Van P-14", officer: "Sub-SI A. Kumar", status: "STANDBY" as "STANDBY" | "EN_ROUTE" | "RESOLVED", distance: "1.7 KM", eta: "5 Min" },
    { id: "p08", name: "Interceptor P-08", officer: "SI M. Pathak", status: "STANDBY" as "STANDBY" | "EN_ROUTE" | "RESOLVED", distance: "2.4 KM", eta: "7 Min" },
    { id: "p21", name: "QRT Team-3", officer: "Sgt. Devendra Singh", status: "STANDBY" as "STANDBY" | "EN_ROUTE" | "RESOLVED", distance: "3.1 KM", eta: "9 Min" }
  ]);

  // Guardians Coordinator Status
  const [guardiansList, setGuardiansList] = useState([
    { name: "Rahul Singh", distance: "300m", eta: "4 Min", status: "STANDBY", accepted: false, trust: "98%" },
    { name: "Dr. Aarti Rao", distance: "1.2 KM", eta: "9 Min", status: "STANDBY", accepted: false, trust: "95%" }
  ]);

  // Auto FIR State
  const [firDraft, setFirDraft] = useState({
    firNo: "BNS-303-2026-062",
    complainant: "Priya Sharma",
    aadhaar: globalAadhaar || "5874 9632 1014",
    offense: "Section 303(2) BNS (Theft & Snatching)",
    summary: "Complainant was travelling Noida Sector 62 when suspect snatched device. Waveform voice distress and kinematic grab trigger verified near Sector 63 Junction.",
    locationTimeline: "Sector 62 Noida [22:47 PM] -> Sector 63 Junction [22:52 PM]",
    evidenceSummary: "Vocal Waveform 4s, GPS Telemetry Log, Cryptographic IPFS Hash",
    evidenceHash: "sha256:8f4a1c3f8c...merkle",
    timestamp: "2026-06-20 22:52 PM",
    isApproved: false,
    isSubmitted: false
  });

  const [isEditingFir, setIsEditingFir] = useState(false);

  // Evidence Vault Waveform Player simulation
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>(Array.from({ length: 40 }, () => 15 + Math.random() * 40));
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Crime trends data
  const crimeTrends = [
    { hour: "00:00", crimeIndex: 45 },
    { hour: "04:00", crimeIndex: 30 },
    { hour: "08:00", crimeIndex: 15 },
    { hour: "12:00", crimeIndex: 20 },
    { hour: "16:00", crimeIndex: 35 },
    { hour: "20:00", crimeIndex: 78 },
    { hour: "23:59", crimeIndex: 90 },
  ];

  // GPS logs
  const gpsTrackingLogs = [
    { time: "22:47:10 PM", lat: 28.6273, lng: 77.3725, speed: "12 km/h", status: "VERIFIED" },
    { time: "22:49:15 PM", lat: 28.6285, lng: 77.3715, speed: "15 km/h", status: "VERIFIED" },
    { time: "22:51:30 PM", lat: 28.6295, lng: 77.3705, speed: "18 km/h", status: "VERIFIED" },
    { time: "22:52:05 PM", lat: 28.6310, lng: 77.3780, speed: "0 km/h", status: "🚨 SNATCH EVENT" }
  ];

  // Audio waveform animation
  useEffect(() => {
    if (isAudioPlaying) {
      audioIntervalRef.current = setInterval(() => {
        setWaveformHeights(Array.from({ length: 40 }, () => 10 + Math.random() * 50));
      }, 150);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isAudioPlaying]);

  // Coordinate movement simulator syncing with state ticks
  useEffect(() => {
    if (!isSimulating) {
      setPositions({
        victim: [28.6273, 77.3725],
        device: [28.6273, 77.3725],
        police: [28.6300, 77.3650],
        guardian: [28.6225, 77.3660]
      });
      setPoliceUnits(prev => prev.map(u => ({ ...u, status: "STANDBY" })));
      setGuardiansList(prev => prev.map(g => ({ ...g, status: "STANDBY", accepted: false })));
      setFirDraft(prev => ({ ...prev, isApproved: false, isSubmitted: false }));
      return;
    }

    if (systemMode === "ALERT") {
      const t = Math.min(1, ticks / 30);
      const pos = interpolateRoute(greenRoute, t);
      setPositions({
        victim: pos,
        device: pos,
        police: [28.6300, 77.3650],
        guardian: [28.6225, 77.3660]
      });
      // Update logs at the start of travel
      if (ticks === 1) {
        addLog("22:47 PM", "Priya Sharma started active journey (Sector 62 Noida → Noida City Centre).", "info");
      }
    } else if (systemMode === "ESCALATION") {
      const t = Math.min(1, (ticks - 30) / 20);
      const victimPos: [number, number] = [28.6310, 77.3780];
      const devicePos = interpolateRoute(redRoute, t * 0.35);
      setPositions({
        victim: victimPos,
        device: devicePos,
        police: [28.6300, 77.3650],
        guardian: [28.6225, 77.3660]
      });
      if (ticks === 31) {
        addLog("22:52 PM", "🚨 PHONE SNATCH DETECTED: Kinematic grab anomaly (Sector 63 road, 98% Threat Score).", "alert");
        addLog("22:53 PM", "🎙️ VoiceShield: Audio distress screamed. FRONT CAMERA ACTIVATED.", "alert");
        addLog("22:53 PM", "🔐 Shadow Witness: Evidence recording cryptographically locked.", "info");
      }
    } else if (systemMode === "SOS") {
      const t = Math.min(1, (ticks - 50) / 40);
      const victimPos: [number, number] = [28.6310, 77.3780];
      const devicePos = interpolateRoute(redRoute, 0.35 + t * 0.45);
      const guardianPos = interpolateRoute(yellowRoute, t);

      // Police unit responds as soon as SOS starts
      const p14Dispatched = policeUnits.find(u => u.id === "p14")?.status === "EN_ROUTE";
      const policePos = p14Dispatched 
        ? interpolateRoute(blueRoute, t)
        : [28.6300, 77.3650] as [number, number];

      setPositions({
        victim: victimPos,
        device: devicePos,
        police: policePos,
        guardian: guardianPos
      });

      setGuardiansList(prev => prev.map((g, idx) => idx === 0 ? { ...g, status: t < 1 ? "EN_ROUTE" : "ARRIVED", accepted: true } : g));

      if (ticks === 51) {
        addLog("22:54 PM", "Aadhaar Guardian Rahul Singh ACCEPTED alert. Rerouting intercept path.", "dispatch");
        // Auto-dispatch PCR P-14 for high simulation realism
        setPoliceUnits(prev => prev.map(u => u.id === "p14" ? { ...u, status: "EN_ROUTE" } : u));
        addLog("22:55 PM", "Police Assigned: Unit PCR P-14 coordinates dispatched.", "dispatch");
      }
    } else if (systemMode === "RESPONSE") {
      const t = Math.min(1, (ticks - 90) / 30);
      const victimPos: [number, number] = [28.6310, 77.3780];
      const devicePos = interpolateRoute(redRoute, 0.8 + t * 0.2);
      const policePos = interpolateRoute(blueRoute, 0.5 + t * 0.5);
      const guardianPos: [number, number] = [28.6310, 77.3780];

      setPositions({
        victim: victimPos,
        device: devicePos,
        police: policePos,
        guardian: guardianPos
      });

      if (t >= 1) {
        setPoliceUnits(prev => prev.map(u => u.id === "p14" ? { ...u, status: "RESOLVED" } : u));
        setGuardiansList(prev => prev.map((g, idx) => idx === 0 ? { ...g, status: "COMPLETED" } : g));
      }

      if (ticks === 91) {
        addLog("23:01 PM", "✓ SUCCESS: Stolen device recovered. Suspect apprehended by PCR P-14.", "success");
        addLog("23:02 PM", "✓ Auto-FIR Draft compilation finalized. Awaiting review.", "success");
      }
    }
  }, [ticks, systemMode, isSimulating, addLog, policeUnits]);

  // Metrics update loop
  useEffect(() => {
    if (!isSimulating) {
      setMetrics({
        speed: 15,
        covered: 0.8,
        remaining: 4.3,
        direction: "SW",
        eta: "12 Minutes"
      });
      return;
    }

    if (systemMode === "ALERT") {
      const p = ticks / 30;
      setMetrics({
        speed: 22,
        covered: parseFloat((0.2 + p * 0.8).toFixed(1)),
        remaining: parseFloat((1.2 - p * 0.8).toFixed(1)),
        direction: "NE",
        eta: `${Math.max(1, Math.round(5 - p * 4))} Min`
      });
    } else if (systemMode === "ESCALATION") {
      setMetrics({
        speed: 0,
        covered: 1.0,
        remaining: 1.8,
        direction: "--",
        eta: "--"
      });
    } else if (systemMode === "SOS") {
      const p = (ticks - 50) / 40;
      setMetrics({
        speed: 54,
        covered: parseFloat((1.0 + p * 0.4).toFixed(1)),
        remaining: parseFloat((1.8 - p * 0.4).toFixed(1)),
        direction: "N-NE",
        eta: `${Math.max(1, Math.round(3 - p * 2))} Min`
      });
    } else if (systemMode === "RESPONSE") {
      const p = Math.min(1, (ticks - 90) / 30);
      const remainingDist = Math.max(0, 0.6 - p * 0.6);
      setMetrics({
        speed: remainingDist > 0 ? 62 : 0,
        covered: parseFloat((1.4 + p * 0.6).toFixed(1)),
        remaining: parseFloat(remainingDist.toFixed(1)),
        direction: remainingDist > 0 ? "N-NW" : "STOPPED",
        eta: remainingDist > 0 ? "1 Min" : "0 Min"
      });
    }
  }, [ticks, systemMode, isSimulating]);

  // Derive simStep for Leaflet
  const simStep = !isSimulating 
    ? 0 
    : systemMode === "ALERT" 
      ? 1 
      : systemMode === "ESCALATION" 
        ? 2 
        : systemMode === "SOS" 
          ? 3 
          : 4;

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Dispatch Unit Actions
  const handleDispatchUnit = (id: string) => {
    setPoliceUnits(prev => prev.map(u => {
      if (u.id === id) {
        addLog("22:55 PM", `PCR Unit ${u.name} manually dispatched by Chief Console. Officer: ${u.officer}.`, "dispatch");
        return { ...u, status: "EN_ROUTE" };
      }
      return u;
    }));
  };

  // Auto FIR edits
  const handleApproveFir = () => {
    setFirDraft(prev => ({ ...prev, isApproved: true }));
    addLog("23:03 PM", `✓ FIR Draft Approved for submission by Officer ${officerInfo.badge}.`, "success");
  };

  const handleSubmitFir = () => {
    setFirDraft(prev => ({ ...prev, isSubmitted: true }));
    addLog("23:04 PM", `✓ FIR Filed legally to State Judicial Registry. Lock Hash: BNS-303-MERKLE.`, "success");
  };

  const handleSaveFirText = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFirDraft(prev => ({
      ...prev,
      complainant: formData.get("complainant") as string,
      offense: formData.get("offense") as string,
      summary: formData.get("summary") as string
    }));
    setIsEditingFir(false);
    addLog("23:03 PM", "FIR details updated manually in active ledger.", "info");
  };

  const handleTriggerStartSim = () => {
    startThreatSimulation();
  };

  const handleTriggerResetSim = () => {
    stopThreatSimulation();
  };

  const isEmergencyActive = systemMode !== "SAFE";

  // Login handler
  const handlePoliceLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginStep === "ID") {
      if (!policeId.trim()) return alert("Enter Police ID.");
      setLoginStep("AADHAAR");
    } else if (loginStep === "AADHAAR") {
      if (aadhaarInput.replace(/\s/g, "").length !== 12) return alert("Aadhaar must be 12 digits.");
      setLoginStep("OTP");
    } else if (loginStep === "OTP") {
      if (!otpInput) return alert("Enter OTP.");
      setLoginStep("FACE");
      // Run scanning animation ticks
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setFaceScanProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setLoginStep("SUCCESS");
        }
      }, 200);
    }
  };

  const handleSuccessLoginRedirect = () => {
    setAuthStatus(true);
    setUserPersona("POLICE");
    setIsLoggedIn(true);
  };

  const handleLockConsole = () => {
    setAuthStatus(false);
    setUserPersona(null);
    setIsLoggedIn(false);
    setLoginStep("ID");
  };

  // Main Rendering Layout
  return (
    <div className={`min-h-screen relative overflow-hidden ${isEmergencyActive ? "grid-bg-emergency bg-[#0d0404]" : "grid-bg bg-[#050508]"} transition-colors duration-1000 text-white font-sans`}>
      
      {/* Top HUD Navigation with Officer Profile */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3.5 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center ${isEmergencyActive ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
              <ShieldCheck size={16} className={isEmergencyActive ? "text-red-400" : "text-emerald-400"} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider font-display text-white">
                TRAVELSAFE X <span className="text-white/40">·</span> <span className={isEmergencyActive ? "text-red-400" : "text-emerald-400"}>POLICE COMMAND CENTER</span>
              </span>
              <div className="flex gap-2 items-center text-[8px] text-white/40 mt-0.5">
                <span>SECTOR: DELHI-NCR SYSTEM</span>
                <span>•</span>
                <span className="text-emerald-400">GPS SYNC OPTIMAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Information Display */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-mono">
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-emerald-400" />
              <span className="text-white/40">Officer:</span>
              <span className="text-white font-bold">{officerInfo.name}</span>
            </div>
            <span className="text-white/10">|</span>
            <div>
              <span className="text-white/40">Badge:</span>
              <span className="text-cyan-400 font-bold">{officerInfo.badge}</span>
            </div>
            <span className="text-white/10">|</span>
            <div>
              <span className="text-white/40">Station:</span>
              <span className="text-white">{officerInfo.station}</span>
            </div>
            <span className="text-white/10">|</span>
            <div>
              <span className="text-white/40">Role:</span>
              <span className="text-white">{officerInfo.role}</span>
            </div>
          </div>
        )}

        {/* Live Clock / Network Node */}
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button 
              onClick={handleLockConsole}
              className="text-[9px] px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-mono font-bold transition-all"
            >
              LOCK TERMINAL
            </button>
          )}
          <span className={`w-2.5 h-2.5 rounded-full ${isEmergencyActive ? "bg-red-500 animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
        </div>
      </nav>

      {/* RENDER LOCKED LOGIN SCREEN */}
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen pt-20 pb-10 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md p-6 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Holographic matrix line scanning overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                <Lock className="text-purple-400 animate-pulse" size={20} />
              </div>
              <h2 className="text-base font-extrabold tracking-wider font-display">COMMAND TERMINAL LOCKED</h2>
              <p className="text-[9px] text-white/40 font-mono uppercase tracking-widest">TravelSafe X Law Enforcement Portal</p>
            </div>

            {/* Login steps container */}
            <form onSubmit={handlePoliceLoginSubmit} className="space-y-4">
              {loginStep === "ID" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest text-white/45 font-mono block">POLICE ID / BADGE NUMBER</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/40 border border-white/5">
                      <ShieldCheck size={14} className="text-white/20" />
                      <input 
                        type="text" 
                        value={policeId}
                        onChange={(e) => setPoliceId(e.target.value)}
                        placeholder="e.g. IPS-2026-9041"
                        required
                        className="bg-transparent text-xs text-white outline-none w-full font-mono"
                      />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 text-[9px] font-mono text-white/40 space-y-1">
                    <div className="flex justify-between"><span>Name:</span><span className="text-white">{officerInfo.name}</span></div>
                    <div className="flex justify-between"><span>Station:</span><span className="text-white">{officerInfo.station}</span></div>
                    <div className="flex justify-between"><span>Authority:</span><span className="text-cyan-400">{officerInfo.role}</span></div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-mono text-xs font-bold uppercase transition-all"
                  >
                    Authenticate Badge ID
                  </button>
                </div>
              )}

              {loginStep === "AADHAAR" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest text-white/45 font-mono block">AADHAAR CARD NUMBER</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/40 border border-white/5">
                      <User size={14} className="text-white/20" />
                      <input 
                        type="text" 
                        value={aadhaarInput}
                        onChange={(e) => setAadhaarInput(e.target.value)}
                        placeholder="5874 9632 1014"
                        required
                        className="bg-transparent text-xs text-white outline-none w-full font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[8.5px] text-white/40 leading-normal font-mono">Requires secure sync with the UIDAI national database.</p>
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold uppercase transition-all"
                  >
                    Verify Aadhaar
                  </button>
                </div>
              )}

              {loginStep === "OTP" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase tracking-widest text-white/45 font-mono block">OTP VERIFICATION CODE</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/40 border border-white/5">
                      <Smartphone size={14} className="text-white/20" />
                      <input 
                        type="text" 
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Enter 4-Digit OTP"
                        required
                        className="bg-transparent text-xs text-white outline-none w-full font-mono text-center tracking-widest font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[8.5px] text-white/40 leading-normal font-mono">OTP dispatch triggered to registered police terminal line.</p>
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-mono text-xs font-bold uppercase transition-all"
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {loginStep === "FACE" && (
                <div className="flex flex-col items-center justify-center space-y-4 py-3">
                  <div className="relative w-28 h-28 flex items-center justify-center rounded-2xl bg-black border border-white/10">
                    <Camera className="text-white/20 absolute" size={32} />
                    <div className="absolute inset-0 rounded-2xl border border-purple-500/35 animate-spin" style={{ animationDuration: "10s" }} />
                    <div className="absolute top-0 bottom-0 left-0 right-0 border-t border-purple-400 animate-pulse scan-horizontal z-10" />
                    <div className="text-[8px] font-mono text-purple-400 absolute bottom-2">CAMERA SCANNING</div>
                  </div>
                  <div className="w-full space-y-1 font-mono text-[8.5px]">
                    <div className="flex justify-between text-white/40 uppercase">
                      <span>Face Mesh points mapping</span>
                      <span>{faceScanProgress}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full" style={{ width: `${faceScanProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {loginStep === "SUCCESS" && (
                <div className="text-center py-4 space-y-4 font-mono">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Verification Authorized</h4>
                    <p className="text-[8px] text-white/40 mt-1 uppercase">
                      Officer credentials verified against UIDAI & IPS registers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSuccessLoginRedirect}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-xs font-bold uppercase tracking-wider hover:from-emerald-500 hover:to-emerald-600 transition-all"
                  >
                    Launch Command Console
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        /* RENDER FUTURISTIC COMMAND CENTER DASHBOARD */
        <div className="max-w-[1600px] mx-auto pt-20 px-4 pb-6 space-y-4">
          
          {/* DASHBOARD COUNTERS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Active Emergencies", count: isEmergencyActive ? "01" : "00", color: isEmergencyActive ? "text-red-400 text-glow-crimson" : "text-white/30" },
              { label: "Open Cases", count: isEmergencyActive ? "25" : "24", color: "text-white" },
              { label: "Resolved Cases", count: isSimulating && systemMode === "RESPONSE" && ticks >= 120 ? "143" : "142", color: "text-emerald-400 text-glow-emerald" },
              { label: "Available Patrol Units", count: policeUnits.filter(u => u.status === "STANDBY").length.toString().padStart(2, "0"), color: "text-cyan-400 text-glow-cyan" },
              { label: "Active Guardians", count: "847", color: "text-yellow-400" },
            ].map((stat, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md flex flex-col justify-between">
                <span className="text-[8px] font-mono uppercase tracking-widest text-white/40 block leading-tight">{stat.label}</span>
                <span className={`text-xl font-bold font-mono mt-2 ${stat.color}`}>{stat.count}</span>
              </div>
            ))}
          </div>

          {/* Major 3-Column Layout Grid */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* COLUMN A: Simulator, Layers, Heatmap & AI Insights */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              
              {/* Simulation controls */}
              <div className="rounded-2xl border border-white/10 bg-[#0a0a0f]/90 p-4 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-[size:10px_10px]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Sliders size={14} className="text-emerald-400" /> Incident Controls
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={handleTriggerStartSim}
                    disabled={isSimulating}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                      isSimulating
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-purple-600 border-red-500/20 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                    }`}
                  >
                    <Play size={10} /> Simulate Incident
                  </button>
                  
                  <button
                    onClick={handleTriggerResetSim}
                    className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-bold"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>

                {/* Live tracking calculations */}
                <div className="p-3 rounded-lg bg-black/40 border border-border-white/5 space-y-2 font-mono text-[9px]">
                  <div className="flex justify-between border-b border-white/5 pb-1.5">
                    <span className="text-white/40">Tracking State:</span>
                    <span className={`font-bold uppercase ${
                      systemMode === "ESCALATION"
                        ? "text-red-400 animate-pulse"
                        : systemMode === "SOS"
                          ? "text-yellow-400 animate-pulse"
                          : systemMode === "RESPONSE"
                            ? "text-cyan-400 animate-pulse"
                            : "text-white/40"
                    }`}>
                      {systemMode === "SAFE" ? "MONITORING ACTIVE" : `STAGE: ${systemMode}`}
                    </span>
                  </div>

                  <div className="space-y-1 text-white/60">
                    <div className="flex justify-between">
                      <span>Telemetry Speed:</span>
                      <span className="text-white font-bold">{metrics.speed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interception Vector:</span>
                      <span className="text-white font-bold">{metrics.direction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Intercept ETA:</span>
                      <span className="text-cyan-400 font-bold">{metrics.eta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance Covered:</span>
                      <span className="text-white font-bold">{metrics.covered} KM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Layers Toggles */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Layers size={14} className="text-cyan-400" /> Command GIS Layers
                </h3>

                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { key: "victimRoute" as const, label: "🟢 Victim Route (Green)", color: "border-emerald-500/20 text-emerald-400" },
                    { key: "deviceRoute" as const, label: "🔴 Stolen Device Route (Red)", color: "border-red-500/20 text-red-400" },
                    { key: "policeRoutes" as const, label: "🔵 Police Intercept Route (Blue)", color: "border-blue-500/20 text-blue-400" },
                    { key: "guardianRoutes" as const, label: "🟡 Guardian Route (Yellow)", color: "border-yellow-500/20 text-yellow-400" },
                    { key: "safeZones" as const, label: "TravelSafe Guard Hubs", color: "border-emerald-500/20 text-emerald-500" },
                    { key: "hospitals" as const, label: "Hospital Locations", color: "border-pink-500/20 text-pink-400" },
                    { key: "cctv" as const, label: "CCTV Camera Coverage", color: "border-cyan-500/20 text-cyan-400" },
                    { key: "hotspots" as const, label: "Crime Density Hotspots", color: "border-orange-500/20 text-orange-400" },
                    { key: "traffic" as const, label: "Traffic Index Overlay", color: "border-zinc-500/20 text-zinc-400" },
                  ].map((layer) => (
                    <button
                      key={layer.key}
                      onClick={() => toggleLayer(layer.key)}
                      className={`w-full p-2 rounded-lg border text-left text-[9px] font-semibold flex items-center justify-between transition-all ${
                        layers[layer.key]
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-transparent border-transparent text-white/30 hover:text-white/50"
                      }`}
                    >
                      <span>{layer.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${layers[layer.key] ? "bg-cyan-400" : "bg-transparent border border-white/20"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* AI INSIGHTS & HOTSPOT PREDICTIONS */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0f]/90 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-purple-400" /> AI Risk Insights & Predictions
                </h3>

                <div className="space-y-2 text-[9px] font-mono">
                  <div className="p-2 bg-purple-950/10 border border-purple-500/25 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-400">HIGH-RISK AREA</span>
                      <span className="bg-purple-500/20 text-purple-400 px-1 rounded font-bold">94% CONF</span>
                    </div>
                    <p className="text-white/60 mt-1 leading-normal">Sector 63 Noida Snatch Corridor</p>
                  </div>

                  <div className="p-2 bg-amber-950/10 border border-amber-500/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-400">REPEAT CRIME THREAT</span>
                      <span className="bg-amber-500/20 text-amber-400 px-1 rounded font-bold">81% RISK</span>
                    </div>
                    <p className="text-white/60 mt-1 leading-normal">2-Wheeler physical snatches heading towards NH-24 corridor.</p>
                  </div>

                  <div className="p-2 bg-pink-950/10 border border-pink-500/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-pink-400">UNSAFE TIME SLOT</span>
                      <span className="bg-pink-500/20 text-pink-400 px-1 rounded font-bold">88% CONF</span>
                    </div>
                    <p className="text-white/60 mt-1 leading-normal">Unsafe Window predicted: 22:00 PM - 02:00 AM.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN B: Live Command Map & Active Incident HUD */}
            <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
              
              {/* INCIDENT DETECTION RADAR WARNING */}
              <div className={`relative rounded-2xl border ${isEmergencyActive ? "border-red-500/30 bg-[#160606]/90 animate-pulse text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]" : "border-white/5 bg-[#0a0a0f]/90 text-white"} p-4 overflow-hidden flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isEmergencyActive ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/10 text-emerald-400"}`}>
                    {isEmergencyActive ? <AlertTriangle size={18} /> : <Activity size={18} />}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider font-display">
                      {isEmergencyActive ? "🚨 PHONE SNATCH DETECTED" : "Incident Monitoring Feed"}
                    </h2>
                    <p className="text-[9px] text-white/40 mt-0.5 leading-tight">
                      {isEmergencyActive 
                        ? `Location: Noida Sector 63 • Time: ${firDraft.timestamp} • Live Tracking Active`
                        : "Listening for sensor disturbances, kinematic anomalies, or voice screams."
                      }
                    </p>
                  </div>
                </div>

                {isEmergencyActive && (
                  <div className="text-right">
                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-red-500/25 border border-red-500/30 text-red-400 font-bold uppercase">
                      THREAT SCORE: 98.4%
                    </span>
                    <span className="block text-[7px] text-white/40 mt-1">EVIDENCE: LOCKED TO LEDGER</span>
                  </div>
                )}
              </div>

              {/* MAP VIEW */}
              <div className="relative rounded-3xl border border-white/10 bg-black/40 overflow-hidden h-[480px] shadow-2xl">
                <PoliceCommandMap
                  isEmergency={isEmergencyActive}
                  simStep={simStep}
                  layers={layers}
                  victimPos={positions.victim}
                  devicePos={positions.device}
                  policePos={positions.police}
                  guardianPos={positions.guardian}
                />

                {/* Map dynamic overlays */}
                <div className="absolute top-4 left-4 z-20 px-3.5 py-2.5 rounded-xl bg-black/90 border border-white/10 backdrop-blur-md space-y-1 font-mono text-[8px] text-white/50 max-w-[220px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white">GIS CORE CONNECTED</span>
                  </div>
                  <div className="text-[7px]">GRID LOC: NOIDA SECTOR 62/63</div>
                  <div className="text-cyan-400 font-bold uppercase text-[7px] border-t border-white/5 pt-1 mt-1">Command Route Legend:</div>
                  <div className="text-[7px]">🟢 Green = Priya Sharma Journey</div>
                  <div className="text-[7px]">🔴 Red = Stolen Device Route</div>
                  <div className="text-[7px]">🔵 Blue = Police Route</div>
                  <div className="text-[7px]">🟡 Yellow = Guardian Route</div>
                </div>

                {/* Real-time moving distance panel overlay */}
                {isEmergencyActive && (
                  <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-md max-w-[240px] space-y-2 text-[9px] font-mono">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span className="text-[8px] uppercase tracking-wider text-cyan-400 font-extrabold">LIVE TRACKING STATS</span>
                    </div>
                    <div className="text-white/60 space-y-0.5">
                      <div className="flex justify-between"><span>Victim:</span><span className="text-emerald-400 font-bold">Priya Sharma</span></div>
                      <div className="flex justify-between"><span>Fleeing Device Speed:</span><span className="text-red-400 font-bold">{metrics.speed} km/h</span></div>
                      <div className="flex justify-between"><span>Police Dispatch:</span><span className="text-blue-400">{policeUnits.find(u=>u.id==="p14")?.status}</span></div>
                      <div className="flex justify-between"><span>Closing Dist:</span><span className="text-cyan-400 font-extrabold animate-pulse">{metrics.remaining} KM</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sector trends charts */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0f]/90 p-4 space-y-2 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-cyan-400" /> Historic Sector Crime trends (Hourly Hotspots)
                </h3>
                <div className="h-28">
                  <CrimeChart data={crimeTrends} />
                </div>
              </div>

            </div>

            {/* COLUMN C: Timeline, Dispatch & Guardian */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              
              {/* INCIDENT TIMELINE */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0f]/90 p-4 space-y-3 flex flex-col justify-between min-h-[300px]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Bell size={14} className="text-emerald-400" /> Emergency Timeline
                </h3>

                <div className="flex-1 overflow-y-auto pr-1 my-1 space-y-3 font-mono text-[9px] max-h-[220px]">
                  {[
                    { time: "22:47 PM", msg: "Journey Started", active: simStep >= 1 },
                    { time: "22:52 PM", msg: "Grab Detected", active: simStep >= 2 },
                    { time: "22:53 PM", msg: "Voice Distress Detected", active: simStep >= 2 },
                    { time: "22:53 PM", msg: "Evidence Recording Started", active: simStep >= 2 },
                    { time: "22:54 PM", msg: "Guardian Accepted", active: simStep >= 3 },
                    { time: "22:55 PM", msg: "Police Assigned", active: simStep >= 3 },
                  ].map((step, i) => (
                    <div key={i} className={`flex gap-2 items-start border-l pl-3 py-0.5 transition-opacity duration-500 ${
                      step.active ? "border-emerald-500 opacity-100" : "border-white/10 opacity-30"
                    }`}>
                      <span className={`whitespace-nowrap font-bold ${step.active ? "text-emerald-400" : "text-white/20"}`}>{step.time}</span>
                      <p className={step.active ? "text-white/80 animate-pulse-light" : "text-white/30"}>{step.msg}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[7.5px] text-white/35 font-mono uppercase tracking-wider block mb-1">Live Intercept Logs</span>
                  <div className="space-y-1 max-h-[70px] overflow-y-auto pr-1 font-mono text-[8px] text-white/50">
                    {timelineLogs.map((log, i) => (
                      <div key={i} className="flex gap-1 items-start leading-tight">
                        <span className="text-cyan-400 font-bold whitespace-nowrap">{log.time}</span>
                        <span className={log.type === "alert" ? "text-red-400 font-semibold" : log.type === "success" ? "text-emerald-400" : "text-white/60"}>
                          {log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DISPATCH CENTER */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0f]/90 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <Compass size={14} className="text-cyan-400" /> Dispatch Center
                </h3>

                <div className="space-y-2.5">
                  {policeUnits.map((unit) => (
                    <div key={unit.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between gap-2">
                      <div className="flex justify-between items-start text-[9px] font-mono">
                        <div>
                          <span className="text-white font-bold block">{unit.name}</span>
                          <span className="text-white/40 block mt-0.5">Officer: {unit.officer}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[7px] ${
                          unit.status === "RESOLVED" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : unit.status === "EN_ROUTE" 
                              ? "bg-cyan-500/10 text-cyan-400 animate-pulse border border-cyan-500/25"
                              : "bg-white/5 text-white/40"
                        }`}>
                          {unit.status}
                        </span>
                      </div>

                      {unit.status === "STANDBY" && isEmergencyActive ? (
                        <button
                          onClick={() => handleDispatchUnit(unit.id)}
                          className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[8px] font-bold uppercase transition-all"
                        >
                          DISPATCH UNIT
                        </button>
                      ) : (
                        <div className="flex justify-between text-[8px] font-mono text-white/40 border-t border-white/5 pt-1.5">
                          <span>Distance: {unit.distance}</span>
                          <span>ETA: {unit.eta}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GUARDIAN COORDINATION */}
              <div className="rounded-2xl border border-white/5 bg-[#0a0a0f]/90 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                  <User size={14} className="text-yellow-400" /> Guardian Coordination
                </h3>

                <div className="space-y-2">
                  {guardiansList.map((guardian, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[9px] font-mono space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">{guardian.name}</span>
                        <span className={`px-1 rounded text-[7px] font-bold ${guardian.accepted || (simStep >= 2 && i === 0) ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/10" : "bg-white/5 text-white/30"}`}>
                          {guardian.accepted || (simStep >= 2 && i === 0) ? "ACCEPTED ALERT" : "STANDBY"}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/50 text-[8px]">
                        <span>Dist: {guardian.distance}</span>
                        <span>ETA: {guardian.eta}</span>
                        <span>Trust: {guardian.trust}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Full-Width Panels (Auto FIR & Evidence Vault) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* AUTO FIR SYSTEM */}
            <div className="col-span-12 md:col-span-6 rounded-2xl border border-white/5 bg-[#0a0a0f]/95 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <FileText size={15} className="text-cyan-400" /> BNS Auto-FIR Compiler (Section 303 IPC/BNS)
                </h3>
                <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                  firDraft.isSubmitted 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : firDraft.isApproved 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : isEmergencyActive 
                        ? "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/20"
                        : "bg-white/5 text-white/30"
                }`}>
                  {firDraft.isSubmitted ? "FILED TO COURT" : firDraft.isApproved ? "APPROVED DRAFT" : isEmergencyActive ? "COMPILING LEDGER" : "STANDBY"}
                </span>
              </div>

              {isSimulating ? (
                <div className="space-y-4">
                  {isEditingFir ? (
                    <form onSubmit={handleSaveFirText} className="space-y-3 font-mono text-[10px]">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-white/40 block mb-1">Complainant Name</label>
                          <input name="complainant" defaultValue={firDraft.complainant} className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white outline-none focus:border-cyan-500" />
                        </div>
                        <div>
                          <label className="text-white/40 block mb-1">BNS Offense Act</label>
                          <input name="offense" defaultValue={firDraft.offense} className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1 text-white outline-none focus:border-cyan-500" />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/40 block mb-1">Incident Summary Details</label>
                        <textarea name="summary" rows={3} defaultValue={firDraft.summary} className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-white outline-none focus:border-cyan-500" />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[8px] font-bold uppercase transition-all">Save Changes</button>
                        <button type="button" onClick={() => setIsEditingFir(false)} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 rounded text-[8px] uppercase transition-all">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-[9px] leading-relaxed text-white/60 space-y-2">
                      <div className="text-center font-bold text-white border-b border-white/10 pb-1.5 flex justify-between">
                        <span>FIRST INFORMATION REPORT</span>
                        <span className="text-cyan-400 font-bold">{firDraft.firNo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                        <div><span className="text-white/30">Complainant:</span> <span className="text-white font-bold">{firDraft.complainant}</span></div>
                        <div><span className="text-white/30">Aadhaar Sync ID:</span> <span className="text-white font-bold">{firDraft.aadhaar}</span></div>
                        <div className="col-span-2"><span className="text-white/30">Offense Act:</span> <span className="text-white font-bold">{firDraft.offense}</span></div>
                        <div><span className="text-white/30">Incident Date/Time:</span> <span className="text-white">{firDraft.timestamp}</span></div>
                        <div><span className="text-white/30">Evidence Hash:</span> <span className="text-cyan-400 font-bold">{firDraft.evidenceHash}</span></div>
                      </div>
                      <div className="border-t border-white/5 pt-1.5 mt-1.5 space-y-1">
                        <div><span className="text-white/30 font-bold">Location Timeline:</span> <span className="text-white">{firDraft.locationTimeline}</span></div>
                        <div><span className="text-white/30 font-bold">Evidence Summary:</span> <span className="text-white">{firDraft.evidenceSummary}</span></div>
                        <div className="border-t border-white/5 pt-1 mt-1">
                          <span className="text-white/30 block mb-0.5 font-bold">Details Summary:</span>
                          <p className="text-white/80">{firDraft.summary}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                    {!firDraft.isApproved ? (
                      <>
                        <button
                          onClick={() => setIsEditingFir(true)}
                          className="py-2 px-4 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-bold uppercase transition-all flex items-center gap-1"
                        >
                          <Edit size={10} /> Edit Details
                        </button>
                        <button
                          onClick={handleApproveFir}
                          className="py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold uppercase transition-all flex items-center gap-1"
                        >
                          Approve FIR Draft
                        </button>
                      </>
                    ) : !firDraft.isSubmitted ? (
                      <button
                        onClick={handleSubmitFir}
                        className="py-2 px-5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest transition-all glow-emerald w-full"
                      >
                        Submit FIR with Digital Signature ({officerInfo.badge})
                      </button>
                    ) : (
                      <div className="w-full text-center py-2 bg-emerald-950/10 border border-emerald-500/25 rounded text-emerald-400 text-[9px] font-bold uppercase">
                        ✓ FIR Legally Filed and Distributed to Judicial Court & Complainant Vault
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/20">
                  <FileText size={24} />
                  <p className="text-[10px] mt-1 font-mono">No active incident triggers. Awaiting dispatch.</p>
                </div>
              )}
            </div>

            {/* EVIDENCE VAULT */}
            <div className="col-span-12 md:col-span-6 rounded-2xl border border-white/5 bg-[#0a0a0f]/95 p-5 space-y-4 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                <Database size={15} className="text-purple-400" /> Cryptographic Evidence Vault
              </h3>

              {isSimulating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Playable Waveform visualizer */}
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-white/40">Distress Waveform:</span>
                      <span className="text-emerald-400 font-bold">VERIFIED SIGNAL</span>
                    </div>

                    <div className="h-14 bg-black/60 rounded-lg flex items-center justify-around px-2 overflow-hidden border border-white/5">
                      {waveformHeights.map((h, i) => (
                        <div
                          key={i}
                          className={`w-0.5 rounded-full transition-all duration-150 ${isAudioPlaying ? "bg-emerald-400" : "bg-emerald-800/40"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                        className="flex-1 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-[8px] font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                      >
                        {isAudioPlaying ? <Pause size={10} /> : <Volume2 size={10} />}
                        {isAudioPlaying ? "Pause Playback" : "Play Distress Audio"}
                      </button>
                      <span className="text-[8px] text-white/40 font-mono">0:04s RECORDED</span>
                    </div>
                  </div>

                  {/* Telemetry GPS Logs Chain */}
                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-white/40">Telemetry Chain GPS Logs:</span>
                      <span className="text-cyan-400 text-[8px]">ACTIVE SYNC</span>
                    </div>

                    <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                      {gpsTrackingLogs.map((log, i) => (
                        <div key={i} className="flex justify-between text-[8px] font-mono text-white/60 bg-white/[0.01] p-1 rounded border border-white/5">
                          <span>{log.time}</span>
                          <span className="text-white">({log.lat.toFixed(4)}, {log.lng.toFixed(4)})</span>
                          <span className="text-emerald-400 font-bold">{log.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blockchain custody signature */}
                  <div className="col-span-1 md:col-span-2 p-2 bg-purple-950/10 border border-purple-500/20 rounded-lg text-[8px] font-mono flex items-center justify-between text-white/45">
                    <span>IPFS BLOCK CUSTODY LEDGER LOCK ACTIVE</span>
                    <span className="text-purple-400">SHA-256: 0x8f4a1c3f8c...</span>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-white/20">
                  <Database size={24} />
                  <p className="text-[10px] mt-1 font-mono">No cryptographic evidence loaded in vault.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Futuristic footer HUD */}
      <footer className="border-t border-white/5 py-4 px-8 backdrop-blur-md bg-black/40 text-center flex flex-col md:flex-row items-center justify-between gap-3 text-[9px] text-white/25 select-none z-10">
        <span>TRAVELSAFE X INTEGRATIONS — DELIVERING PREDICTIVE URBAN MOBILITY SECURITY</span>
        <span>NATIONAL COMMAND MATRIX PLATFORM V1.9</span>
      </footer>

    </div>
  );
}
