import type { EmergencyPacket } from "@/types";

const emergencyMessages = [
  "GRAB-SENSE: Motion anomaly detected — confidence 96.2%",
  "GUARDIAN MESH: 3 nodes responding within 500m radius",
  "SHADOW WITNESS: Evidence chunk #4 locked to blockchain",
  "LUMINAMAPS: Rerouting to safer alternate — ETA +4 min",
  "PEERSAFE: Co-commuter Priya S. notified — journey sync active",
  "SYSTEM: Auto-FIR generation initiated — Delhi Police API",
  "GUARDIAN BROADCAST: Alert propagated to 847 verified guardians",
  "GRAB-SENSE: Biometric lock engaged — device secured",
  "SHADOW WITNESS: Audio packet SHA-256 verified",
  "GUARDIAN MESH: Response team ETA 1.8 minutes",
  "SYSTEM: Interception radius expanded to 500m",
  "PUBLIC SYNC: 4 nearby trusted users alerted",
  "LUMINAMAPS: Red zone detected — avoiding sector 7-G",
  "GRAB-SENSE: Threat probability elevated to 78.4%",
  "SYSTEM: Court-admissible evidence chain complete",
];

export function generateEmergencyPacket(): EmergencyPacket {
  const message = emergencyMessages[Math.floor(Math.random() * emergencyMessages.length)];
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;

  return {
    id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    message,
    timestamp,
    priority: Math.random() > 0.7 ? "critical" : Math.random() > 0.4 ? "high" : "medium",
  };
}

export function generateWaveform(length: number = 60): number[] {
  return Array.from({ length }, (_, i) => {
    const base = Math.sin(i * 0.3) * 25;
    const noise = (Math.random() - 0.5) * 15;
    const spike = Math.random() > 0.95 ? Math.random() * 40 : 0;
    return base + noise + spike;
  });
}

export function generateAcceleration(length: number = 20): number[] {
  return Array.from({ length }, () => Math.random() * 3 + (Math.random() > 0.9 ? 5 : 0));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

export function getModeColor(mode: string): string {
  switch (mode) {
    case "SAFE": return "#10b981";
    case "ALERT": return "#f97316";
    case "ESCALATION": return "#dc2626";
    case "SOS": return "#dc2626";
    case "RESPONSE": return "#06b6d4";
    default: return "#10b981";
  }
}

export function getModeGlow(mode: string): string {
  switch (mode) {
    case "SAFE": return "rgba(16, 185, 129, 0.3)";
    case "ALERT": return "rgba(249, 115, 22, 0.3)";
    case "ESCALATION": return "rgba(220, 38, 38, 0.4)";
    case "SOS": return "rgba(220, 38, 38, 0.5)";
    case "RESPONSE": return "rgba(6, 182, 212, 0.3)";
    default: return "rgba(16, 185, 129, 0.3)";
  }
}
