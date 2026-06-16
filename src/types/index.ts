export type SystemMode = "SAFE" | "ALERT" | "ESCALATION" | "RESPONSE" | "SOS";

export type TimelineStage = "T-10" | "T-0" | "+5" | "+15";

export interface GuardianNode {
  id: string;
  name: string;
  distance: number;
  status: "active" | "standby" | "responding";
  lat: number;
  lng: number;
}

export interface RouteData {
  id: string;
  name: string;
  safetyScore: number;
  lightingDensity: number;
  crowdDensity: number;
  incidentProbability: number;
  duration: string;
  distance: string;
  coordinates: [number, number][];
  isActive: boolean;
}

export interface EvidenceChunk {
  id: string;
  type: "video" | "audio";
  hash: string;
  timestamp: string;
  size: string;
  verified: boolean;
}

export interface PeerUser {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "journey" | "guardian";
  route: string;
  safetyScore: number;
}

export interface TimelineEvent {
  stage: TimelineStage;
  title: string;
  threatScore: number;
  aiConfidence: number;
  action: string;
  timestamp: string;
  active: boolean;
  completed: boolean;
}

export interface GrabSenseData {
  detectionConfidence: number;
  threatProbability: number;
  modelStatus: "online" | "processing" | "alert";
  biometricLock: boolean;
  inferenceLatency: number;
  waveform: number[];
  acceleration: number[];
  orientation: { x: number; y: number; z: number };
}

export interface SafetyMetrics {
  luminaScore: number;
  guardianCount: number;
  nearbyResponders: number;
  responseTime: string;
  activeThreats: number;
  verifiedUsers: number;
}

export interface EmergencyPacket {
  id: string;
  message: string;
  timestamp: string;
  priority: "critical" | "high" | "medium";
}
