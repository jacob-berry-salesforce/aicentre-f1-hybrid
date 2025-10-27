/**
 * F1 25 UDP Telemetry Parser
 * Parses binary UDP packets from F1 25 game
 */

import {
  PacketHeader,
  PacketLapData,
  PacketCarTelemetryData,
  PacketParticipantsData,
  PacketSessionData,
  PacketType,
  LapData,
  CarTelemetryData,
  ParticipantData
} from './types';

export class F1TelemetryParser {
  parseHeader(buffer: Buffer, offset: number = 0): PacketHeader {
    return {
      packetFormat: buffer.readUInt16LE(offset),
      gameYear: buffer.readUInt8(offset + 2),
      gameMajorVersion: buffer.readUInt8(offset + 3),
      gameMinorVersion: buffer.readUInt8(offset + 4),
      packetVersion: buffer.readUInt8(offset + 5),
      packetId: buffer.readUInt8(offset + 6),
      sessionUID: buffer.readBigUInt64LE(offset + 7),
      sessionTime: buffer.readFloatLE(offset + 15),
      frameIdentifier: buffer.readUInt32LE(offset + 19),
      overallFrameIdentifier: buffer.readUInt32LE(offset + 23),
      playerCarIndex: buffer.readUInt8(offset + 27),
      secondaryPlayerCarIndex: buffer.readUInt8(offset + 28)
    };
  }

  parseLapData(buffer: Buffer): PacketLapData | null {
    try {
      const header = this.parseHeader(buffer);
      const lapData: LapData[] = [];
      let offset = 29; // Header size

      // Parse lap data for up to 22 cars
      for (let i = 0; i < 22; i++) {
        lapData.push({
          lastLapTimeInMS: buffer.readUInt32LE(offset),
          currentLapTimeInMS: buffer.readUInt32LE(offset + 4),
          sector1TimeInMS: buffer.readUInt16LE(offset + 8),
          sector1TimeMinutes: buffer.readUInt8(offset + 10),
          sector2TimeInMS: buffer.readUInt16LE(offset + 11),
          sector2TimeMinutes: buffer.readUInt8(offset + 13),
          deltaToCarInFrontInMS: buffer.readUInt16LE(offset + 14),
          deltaToRaceLeaderInMS: buffer.readUInt16LE(offset + 16),
          lapDistance: buffer.readFloatLE(offset + 18),
          totalDistance: buffer.readFloatLE(offset + 22),
          safetyCarDelta: buffer.readFloatLE(offset + 26),
          carPosition: buffer.readUInt8(offset + 30),
          currentLapNum: buffer.readUInt8(offset + 31),
          pitStatus: buffer.readUInt8(offset + 32),
          numPitStops: buffer.readUInt8(offset + 33),
          sector: buffer.readUInt8(offset + 34),
          currentLapInvalid: buffer.readUInt8(offset + 35),
          penalties: buffer.readUInt8(offset + 36),
          totalWarnings: buffer.readUInt8(offset + 37),
          cornerCuttingWarnings: buffer.readUInt8(offset + 38),
          numUnservedDriveThroughPens: buffer.readUInt8(offset + 39),
          numUnservedStopGoPens: buffer.readUInt8(offset + 40),
          gridPosition: buffer.readUInt8(offset + 41),
          driverStatus: buffer.readUInt8(offset + 42),
          resultStatus: buffer.readUInt8(offset + 43),
          pitLaneTimerActive: buffer.readUInt8(offset + 44),
          pitLaneTimeInLaneInMS: buffer.readUInt16LE(offset + 45),
          pitStopTimerInMS: buffer.readUInt16LE(offset + 47),
          pitStopShouldServePen: buffer.readUInt8(offset + 49)
        });
        offset += 50; // Size of LapData structure
      }

      return {
        header,
        lapData,
        timeTrialPBCarIdx: buffer.readUInt8(offset),
        timeTrialRivalCarIdx: buffer.readUInt8(offset + 1)
      };
    } catch (error) {
      console.error('Error parsing lap data:', error);
      return null;
    }
  }

  parseCarTelemetry(buffer: Buffer): PacketCarTelemetryData | null {
    try {
      const header = this.parseHeader(buffer);
      const carTelemetryData: CarTelemetryData[] = [];
      let offset = 29; // Header size

      // Parse telemetry for up to 22 cars
      for (let i = 0; i < 22; i++) {
        const brakesTemp = [
          buffer.readUInt16LE(offset + 10),
          buffer.readUInt16LE(offset + 12),
          buffer.readUInt16LE(offset + 14),
          buffer.readUInt16LE(offset + 16)
        ];

        const tyresSurfaceTemp = [
          buffer.readUInt8(offset + 18),
          buffer.readUInt8(offset + 19),
          buffer.readUInt8(offset + 20),
          buffer.readUInt8(offset + 21)
        ];

        const tyresInnerTemp = [
          buffer.readUInt8(offset + 22),
          buffer.readUInt8(offset + 23),
          buffer.readUInt8(offset + 24),
          buffer.readUInt8(offset + 25)
        ];

        const tyresPressure = [
          buffer.readFloatLE(offset + 28),
          buffer.readFloatLE(offset + 32),
          buffer.readFloatLE(offset + 36),
          buffer.readFloatLE(offset + 40)
        ];

        const surfaceType = [
          buffer.readUInt8(offset + 44),
          buffer.readUInt8(offset + 45),
          buffer.readUInt8(offset + 46),
          buffer.readUInt8(offset + 47)
        ];

        carTelemetryData.push({
          speed: buffer.readUInt16LE(offset),
          throttle: buffer.readFloatLE(offset + 2),
          steer: buffer.readFloatLE(offset + 6),
          brake: buffer.readFloatLE(offset + 10),
          clutch: buffer.readUInt8(offset + 14),
          gear: buffer.readInt8(offset + 15),
          engineRPM: buffer.readUInt16LE(offset + 16),
          drs: buffer.readUInt8(offset + 18),
          revLightsPercent: buffer.readUInt8(offset + 19),
          revLightsBitValue: buffer.readUInt16LE(offset + 20),
          brakesTemperature: brakesTemp,
          tyresSurfaceTemperature: tyresSurfaceTemp,
          tyresInnerTemperature: tyresInnerTemp,
          engineTemperature: buffer.readUInt16LE(offset + 26),
          tyresPressure: tyresPressure,
          surfaceType: surfaceType
        });
        offset += 60; // Size of CarTelemetryData structure
      }

      return {
        header,
        carTelemetryData,
        mfdPanelIndex: buffer.readUInt8(offset),
        mfdPanelIndexSecondaryPlayer: buffer.readUInt8(offset + 1),
        suggestedGear: buffer.readInt8(offset + 2)
      };
    } catch (error) {
      console.error('Error parsing car telemetry:', error);
      return null;
    }
  }

  parseParticipants(buffer: Buffer): PacketParticipantsData | null {
    try {
      const header = this.parseHeader(buffer);
      const numActiveCars = buffer.readUInt8(29);
      const participants: ParticipantData[] = [];
      let offset = 30;

      for (let i = 0; i < 22; i++) {
        const nameBytes = buffer.slice(offset + 7, offset + 55);
        const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();

        participants.push({
          aiControlled: buffer.readUInt8(offset),
          driverId: buffer.readUInt8(offset + 1),
          networkId: buffer.readUInt8(offset + 2),
          teamId: buffer.readUInt8(offset + 3),
          myTeam: buffer.readUInt8(offset + 4),
          raceNumber: buffer.readUInt8(offset + 5),
          nationality: buffer.readUInt8(offset + 6),
          name: name,
          yourTelemetry: buffer.readUInt8(offset + 55),
          showOnlineNames: buffer.readUInt8(offset + 56),
          platform: buffer.readUInt8(offset + 57)
        });
        offset += 58; // Size of ParticipantData structure
      }

      return {
        header,
        numActiveCars,
        participants
      };
    } catch (error) {
      console.error('Error parsing participants:', error);
      return null;
    }
  }

  parseSessionData(buffer: Buffer): PacketSessionData | null {
    try {
      const header = this.parseHeader(buffer);
      let offset = 29;

      return {
        header,
        weather: buffer.readUInt8(offset),
        trackTemperature: buffer.readInt8(offset + 1),
        airTemperature: buffer.readInt8(offset + 2),
        totalLaps: buffer.readUInt8(offset + 3),
        trackLength: buffer.readUInt16LE(offset + 4),
        sessionType: buffer.readUInt8(offset + 6),
        trackId: buffer.readInt8(offset + 7),
        formula: buffer.readUInt8(offset + 8),
        sessionTimeLeft: buffer.readUInt16LE(offset + 9),
        sessionDuration: buffer.readUInt16LE(offset + 11),
        pitSpeedLimit: buffer.readUInt8(offset + 13),
        gamePaused: buffer.readUInt8(offset + 14),
        isSpectating: buffer.readUInt8(offset + 15),
        spectatorCarIndex: buffer.readUInt8(offset + 16),
        sliProNativeSupport: buffer.readUInt8(offset + 17),
        numMarshalZones: buffer.readUInt8(offset + 18),
        safetyCarStatus: buffer.readUInt8(offset + 19),
        networkGame: buffer.readUInt8(offset + 20),
        numWeatherForecastSamples: buffer.readUInt8(offset + 21),
        forecastAccuracy: buffer.readUInt8(offset + 22),
        aiDifficulty: buffer.readUInt8(offset + 23),
        seasonLinkIdentifier: buffer.readUInt32LE(offset + 24),
        weekendLinkIdentifier: buffer.readUInt32LE(offset + 28),
        sessionLinkIdentifier: buffer.readUInt32LE(offset + 32),
        pitStopWindowIdealLap: buffer.readUInt8(offset + 36),
        pitStopWindowLatestLap: buffer.readUInt8(offset + 37),
        pitStopRejoinPosition: buffer.readUInt8(offset + 38),
        steeringAssist: buffer.readUInt8(offset + 39),
        brakingAssist: buffer.readUInt8(offset + 40),
        gearboxAssist: buffer.readUInt8(offset + 41),
        pitAssist: buffer.readUInt8(offset + 42),
        pitReleaseAssist: buffer.readUInt8(offset + 43),
        ERSAssist: buffer.readUInt8(offset + 44),
        DRSAssist: buffer.readUInt8(offset + 45),
        dynamicRacingLine: buffer.readUInt8(offset + 46),
        dynamicRacingLineType: buffer.readUInt8(offset + 47),
        gameMode: buffer.readUInt8(offset + 48),
        ruleSet: buffer.readUInt8(offset + 49),
        timeOfDay: buffer.readUInt32LE(offset + 50),
        sessionLength: buffer.readUInt8(offset + 54),
        speedUnitsLeadPlayer: buffer.readUInt8(offset + 55),
        temperatureUnitsLeadPlayer: buffer.readUInt8(offset + 56),
        speedUnitsSecondaryPlayer: buffer.readUInt8(offset + 57),
        temperatureUnitsSecondaryPlayer: buffer.readUInt8(offset + 58),
        numSafetyCarPeriods: buffer.readUInt8(offset + 59),
        numVirtualSafetyCarPeriods: buffer.readUInt8(offset + 60),
        numRedFlagPeriods: buffer.readUInt8(offset + 61)
      };
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }

  parse(buffer: Buffer): any {
    const header = this.parseHeader(buffer);

    switch (header.packetId) {
      case PacketType.Session:
        return this.parseSessionData(buffer);
      case PacketType.LapData:
        return this.parseLapData(buffer);
      case PacketType.Participants:
        return this.parseParticipants(buffer);
      case PacketType.CarTelemetry:
        return this.parseCarTelemetry(buffer);
      default:
        return { header, raw: true };
    }
  }
}
