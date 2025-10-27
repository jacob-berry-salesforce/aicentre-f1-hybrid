export enum SystemState {
  ATTRACT = 'ATTRACT',
  RACING = 'RACING',
  RESULTS = 'RESULTS'
}

export interface RigConnection {
  rigId: string;
  connected: boolean;
  lastSeen: Date;
  playerName?: string;
}

export interface RaceData {
  sessionId: string;
  timestamp: Date;
  players: PlayerRaceData[];
  winner?: string;
  raceCompleted: boolean;
}

export interface PlayerRaceData {
  rigId: string;
  name: string;
  finalPosition?: number;
  fastestLap?: number;
  totalTime?: number;
  lapTimes: number[];
}

export interface LiveTelemetry {
  rigId: string;
  position: number;
  currentLap: number;
  lastLapTime?: number;
  speed: number;
  gap?: number;
  deltaToLeader?: number;
}

export interface RegistrationData {
  rig: string;
  name: string;
}
