/**
 * F1 25 UDP Telemetry Types
 * Based on F1 2024/2025 UDP specification
 */

export interface PacketHeader {
  packetFormat: number;
  gameYear: number;
  gameMajorVersion: number;
  gameMinorVersion: number;
  packetVersion: number;
  packetId: number;
  sessionUID: bigint;
  sessionTime: number;
  frameIdentifier: number;
  overallFrameIdentifier: number;
  playerCarIndex: number;
  secondaryPlayerCarIndex: number;
}

export interface LapData {
  lastLapTimeInMS: number;
  currentLapTimeInMS: number;
  sector1TimeInMS: number;
  sector1TimeMinutes: number;
  sector2TimeInMS: number;
  sector2TimeMinutes: number;
  deltaToCarInFrontInMS: number;
  deltaToRaceLeaderInMS: number;
  lapDistance: number;
  totalDistance: number;
  safetyCarDelta: number;
  carPosition: number;
  currentLapNum: number;
  pitStatus: number;
  numPitStops: number;
  sector: number;
  currentLapInvalid: number;
  penalties: number;
  totalWarnings: number;
  cornerCuttingWarnings: number;
  numUnservedDriveThroughPens: number;
  numUnservedStopGoPens: number;
  gridPosition: number;
  driverStatus: number;
  resultStatus: number;
  pitLaneTimerActive: number;
  pitLaneTimeInLaneInMS: number;
  pitStopTimerInMS: number;
  pitStopShouldServePen: number;
}

export interface PacketLapData {
  header: PacketHeader;
  lapData: LapData[];
  timeTrialPBCarIdx: number;
  timeTrialRivalCarIdx: number;
}

export interface CarTelemetryData {
  speed: number;
  throttle: number;
  steer: number;
  brake: number;
  clutch: number;
  gear: number;
  engineRPM: number;
  drs: number;
  revLightsPercent: number;
  revLightsBitValue: number;
  brakesTemperature: number[];
  tyresSurfaceTemperature: number[];
  tyresInnerTemperature: number[];
  engineTemperature: number;
  tyresPressure: number[];
  surfaceType: number[];
}

export interface PacketCarTelemetryData {
  header: PacketHeader;
  carTelemetryData: CarTelemetryData[];
  mfdPanelIndex: number;
  mfdPanelIndexSecondaryPlayer: number;
  suggestedGear: number;
}

export interface ParticipantData {
  aiControlled: number;
  driverId: number;
  networkId: number;
  teamId: number;
  myTeam: number;
  raceNumber: number;
  nationality: number;
  name: string;
  yourTelemetry: number;
  showOnlineNames: number;
  platform: number;
}

export interface PacketParticipantsData {
  header: PacketHeader;
  numActiveCars: number;
  participants: ParticipantData[];
}

export interface PacketSessionData {
  header: PacketHeader;
  weather: number;
  trackTemperature: number;
  airTemperature: number;
  totalLaps: number;
  trackLength: number;
  sessionType: number;
  trackId: number;
  formula: number;
  sessionTimeLeft: number;
  sessionDuration: number;
  pitSpeedLimit: number;
  gamePaused: number;
  isSpectating: number;
  spectatorCarIndex: number;
  sliProNativeSupport: number;
  numMarshalZones: number;
  safetyCarStatus: number;
  networkGame: number;
  numWeatherForecastSamples: number;
  forecastAccuracy: number;
  aiDifficulty: number;
  seasonLinkIdentifier: number;
  weekendLinkIdentifier: number;
  sessionLinkIdentifier: number;
  pitStopWindowIdealLap: number;
  pitStopWindowLatestLap: number;
  pitStopRejoinPosition: number;
  steeringAssist: number;
  brakingAssist: number;
  gearboxAssist: number;
  pitAssist: number;
  pitReleaseAssist: number;
  ERSAssist: number;
  DRSAssist: number;
  dynamicRacingLine: number;
  dynamicRacingLineType: number;
  gameMode: number;
  ruleSet: number;
  timeOfDay: number;
  sessionLength: number;
  speedUnitsLeadPlayer: number;
  temperatureUnitsLeadPlayer: number;
  speedUnitsSecondaryPlayer: number;
  temperatureUnitsSecondaryPlayer: number;
  numSafetyCarPeriods: number;
  numVirtualSafetyCarPeriods: number;
  numRedFlagPeriods: number;
}

export enum PacketType {
  Motion = 0,
  Session = 1,
  LapData = 2,
  Event = 3,
  Participants = 4,
  CarSetups = 5,
  CarTelemetry = 6,
  CarStatus = 7,
  FinalClassification = 8,
  LobbyInfo = 9,
  CarDamage = 10,
  SessionHistory = 11,
  TyreSets = 12,
  MotionEx = 13
}
