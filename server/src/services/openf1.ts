// OpenF1 API Service
// Provides access to real-time and historical Formula 1 data

import { logger } from '../logger';

const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

export interface Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface LapTime {
  date_start: string;
  driver_number: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  is_pit_out_lap: boolean;
  lap_duration: number;
  lap_number: number;
  meeting_key: number;
  session_key: number;
  st_speed: number;
}

export interface SessionResult {
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  driver_number: number;
  duration: number;
  gap_to_leader: number;
  number_of_laps: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface LapRecord {
  driverName: string;
  driverAcronym: string;
  teamName: string;
  teamColor: string;
  lapTime: string;
  position: number;
}

export interface TrackInfo {
  name: string;
  location: string;
  country: string;
  countryCode: string;
  flag: string;
  circuit: string;
  facts: string[];
  lapRecords?: LapRecord[];
  sessionType?: string;
}

// Mapping of country codes to emoji flags
const countryFlags: Record<string, string> = {
  'BHR': '🇧🇭', 'SAU': '🇸🇦', 'AUS': '🇦🇺', 'JPN': '🇯🇵', 'CHN': '🇨🇳',
  'USA': '🇺🇸', 'ITA': '🇮🇹', 'MCO': '🇲🇨', 'ESP': '🇪🇸', 'CAN': '🇨🇦',
  'AUT': '🇦🇹', 'GBR': '🇬🇧', 'HUN': '🇭🇺', 'BEL': '🇧🇪', 'NLD': '🇳🇱',
  'AZE': '🇦🇿', 'SGP': '🇸🇬', 'MEX': '🇲🇽', 'BRA': '🇧🇷', 'QAT': '🇶🇦',
  'UAE': '🇦🇪', 'FRA': '🇫🇷', 'PRT': '🇵🇹', 'DEU': '🇩🇪', 'TUR': '🇹🇷'
};

// Track facts database - interesting information about each circuit
const trackFacts: Record<string, string[]> = {
  'Bahrain': [
    'First Grand Prix held in 2004',
    'Night race under floodlights',
    'Located in the Sakhir desert',
    '5.412 km track length',
    '15 corners on the circuit'
  ],
  'Jeddah': [
    'Newest street circuit on calendar',
    'Second-fastest track in F1',
    'Night race along the Red Sea',
    '6.174 km track length',
    '27 corners with high-speed nature'
  ],
  'Melbourne': [
    'Australian GP since 1996',
    'Albert Park street circuit',
    'Starts at 5.278 km length',
    'Known for unpredictable weather',
    '14 corners around the lake'
  ],
  'Suzuka': [
    'Figure-8 layout, only one in F1',
    'Home of Honda and Toyota',
    'Legendary 130R corner',
    '5.807 km technical circuit',
    'First GP held in 1987'
  ],
  'Shanghai': [
    'Opened in 2004 for Chinese GP',
    'Unique snail-shell shape',
    'World\'s longest straight (1.17km)',
    '5.451 km track length',
    '16 corners including hairpin'
  ],
  'Miami': [
    'Newest US Grand Prix venue',
    'Hard Rock Stadium complex',
    'High-speed street circuit',
    '5.412 km with 19 corners',
    'Debuted in 2022 season'
  ],
  'Imola': [
    'Named after Ayrton Senna',
    'Historic Autodromo Enzo e Dino Ferrari',
    'Iconic Tamburello corner',
    '4.909 km challenging layout',
    'Hosted F1 since 1980'
  ],
  'Monaco': [
    'Most prestigious race in F1',
    'Slowest but most demanding',
    'No room for error on streets',
    '3.337 km tight street circuit',
    'Racing here since 1929'
  ],
  'Barcelona': [
    'Circuit de Barcelona-Catalunya',
    'Primary F1 testing venue',
    'Technical and challenging',
    '4.675 km with 16 corners',
    'Demanding on tyres and brakes'
  ],
  'Montreal': [
    'Circuit Gilles Villeneuve',
    'Island circuit on Île Notre-Dame',
    'Wall of Champions at Turn 13/14',
    '4.361 km semi-street circuit',
    'Known for Safety Car drama'
  ],
  'Spielberg': [
    'Shortest circuit on calendar',
    'Stunning Austrian Alps setting',
    'High-altitude challenges',
    '4.318 km with only 10 corners',
    'Red Bull Racing home race'
  ],
  'Silverstone': [
    'Home of British Grand Prix',
    'First ever F1 World Championship race',
    'High-speed corners like Copse',
    '5.891 km former airfield',
    'Legendary Maggots-Becketts complex'
  ],
  'Hungaroring': [
    'First F1 race behind Iron Curtain',
    'Tight and twisty layout',
    'Difficult to overtake',
    '4.381 km with 14 corners',
    'Often called Monaco without walls'
  ],
  'Spa-Francorchamps': [
    'Legendary Eau Rouge corner',
    'Longest circuit on calendar',
    'Unpredictable Ardennes weather',
    '7.004 km through forests',
    'Drivers\' favorite circuit'
  ],
  'Zandvoort': [
    'Banked corners unique in F1',
    'Dutch Grand Prix returns 2021',
    'Coastal North Sea location',
    '4.259 km challenging layout',
    'Max Verstappen home race'
  ],
  'Monza': [
    'Temple of Speed since 1922',
    'Fastest circuit in Formula 1',
    'Historic Italian passion',
    '5.793 km low-downforce track',
    'Legendary Parabolica corner'
  ],
  'Baku': [
    'Longest straight in F1 (2.2km)',
    'Tight castle section contrast',
    'Street circuit by Caspian Sea',
    '6.003 km mixed-speed layout',
    'Known for dramatic races'
  ],
  'Singapore': [
    'First ever F1 night race',
    'Most demanding street circuit',
    'Marina Bay spectacular setting',
    '4.940 km bumpy streets',
    '23 corners with humidity challenge'
  ],
  'Austin': [
    'Circuit of the Americas (COTA)',
    'Turn 1 steep uphill challenge',
    '5.513 km purpose-built facility',
    'Combines elements of famous circuits',
    'US Grand Prix since 2012'
  ],
  'Mexico City': [
    'Highest altitude circuit (2,200m)',
    'Thin air affects performance',
    'Autódromo Hermanos Rodríguez',
    '4.304 km with Peraltada corner',
    'Passionate Mexican F1 fans'
  ],
  'São Paulo': [
    'Interlagos, meaning "between lakes"',
    'Anti-clockwise direction',
    'Iconic Senna S turns',
    '4.309 km elevation changes',
    'Brazilian GP legendary atmosphere'
  ],
  'Las Vegas': [
    'Night race on Las Vegas Strip',
    'Newest addition to calendar',
    'High-speed street circuit',
    '6.120 km with 17 corners',
    'Spectacular neon-lit racing'
  ],
  'Lusail': [
    'Purpose-built Qatar circuit',
    'Night race under floodlights',
    '5.380 km with 16 corners',
    'Opened in 2021',
    'Desert location challenges'
  ],
  'Yas Marina': [
    'Season finale Abu Dhabi GP',
    'Unique pit lane exit tunnel',
    'Sunset to night transition',
    '5.281 km with Marina backdrop',
    'State-of-the-art facilities'
  ]
};

export class OpenF1Service {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 15 * 60 * 1000; // 15 minutes cache (sessions don't change frequently)
  private rateLimitCacheDuration = 60 * 60 * 1000; // 1 hour cache on rate limit

  /**
   * Fetch data from OpenF1 API with caching
   */
  private async fetch<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    const queryString = params
      ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';

    const url = `${OPENF1_BASE_URL}${endpoint}${queryString}`;
    const cacheKey = url;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      logger.debug(`Cache hit for ${endpoint}`);
      return cached.data;
    }

    // If we have stale cached data and get rate limited, return stale data
    const staleCached = this.cache.get(cacheKey);

    try {
      logger.info(`Fetching from OpenF1: ${endpoint}`);
      const response = await fetch(url);

      if (!response.ok) {
        // If rate limited and we have stale data, return stale data
        if (response.status === 429 && staleCached) {
          logger.warn(`Rate limited on ${endpoint}, using stale cache (age: ${Math.floor((Date.now() - staleCached.timestamp) / 1000)}s)`);
          // Extend the cache duration to avoid hammering the API
          this.cache.set(cacheKey, { data: staleCached.data, timestamp: Date.now() });
          return staleCached.data as T;
        }
        throw new Error(`OpenF1 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update cache
      this.cache.set(cacheKey, { data, timestamp: Date.now() });

      return data as T;
    } catch (error) {
      // If we have any cached data (even stale), return it on error
      if (staleCached) {
        logger.warn(`API error on ${endpoint}, using stale cache (age: ${Math.floor((Date.now() - staleCached.timestamp) / 1000)}s)`);
        // Extend the cache duration to avoid hammering the API
        this.cache.set(cacheKey, { data: staleCached.data, timestamp: Date.now() });
        return staleCached.data as T;
      }
      logger.error('OpenF1 API fetch error:', error);
      throw error;
    }
  }

  /**
   * Get the latest meeting (current or upcoming Grand Prix)
   */
  async getLatestMeeting(): Promise<Meeting | null> {
    try {
      const meetings = await this.fetch<Meeting[]>('/meetings', {
        meeting_key: 'latest'
      });
      return meetings.length > 0 ? meetings[0] : null;
    } catch (error) {
      logger.error('Error fetching latest meeting:', error);
      return null;
    }
  }

  /**
   * Get current/latest session
   */
  async getLatestSession(): Promise<Session | null> {
    try {
      const sessions = await this.fetch<Session[]>('/sessions', {
        session_key: 'latest'
      });
      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      logger.error('Error fetching latest session:', error);
      return null;
    }
  }

  /**
   * Get drivers from a session
   */
  async getSessionDrivers(sessionKey: number): Promise<Driver[]> {
    try {
      const drivers = await this.fetch<Driver[]>('/drivers', {
        session_key: sessionKey
      });
      return drivers;
    } catch (error) {
      logger.error('Error fetching drivers:', error);
      return [];
    }
  }

  /**
   * Get session results (qualifying or race)
   */
  async getSessionResults(sessionKey: number, limit: number = 5): Promise<SessionResult[]> {
    try {
      const results = await this.fetch<SessionResult[]>('/session_result', {
        session_key: sessionKey
      });

      // Sort by position and limit
      return results
        .filter(r => !r.dns && !r.dsq) // Filter out DNS/DSQ
        .sort((a, b) => a.position - b.position)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error fetching session results:', error);
      return [];
    }
  }

  /**
   * Get fastest laps from a session
   */
  async getFastestLaps(sessionKey: number, limit: number = 5): Promise<LapTime[]> {
    try {
      const laps = await this.fetch<LapTime[]>('/laps', {
        session_key: sessionKey
      });

      // Filter out pit laps and invalid laps, sort by lap_duration
      return laps
        .filter(lap => !lap.is_pit_out_lap && lap.lap_duration > 0)
        .sort((a, b) => a.lap_duration - b.lap_duration)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error fetching fastest laps:', error);
      return [];
    }
  }

  /**
   * Format lap time from seconds to M:SS.mmm
   */
  private formatLapTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const secs = Math.floor(remainingSeconds);
    const millis = Math.floor((remainingSeconds - secs) * 1000);

    return `${minutes}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }

  /**
   * Get lap records with driver information
   */
  async getLapRecords(sessionKey: number, limit: number = 5): Promise<LapRecord[]> {
    try {
      // Get fastest laps from the session
      const fastestLaps = await this.getFastestLaps(sessionKey, limit);
      const drivers = await this.getSessionDrivers(sessionKey);

      // Create a driver map for quick lookup
      const driverMap = new Map(drivers.map(d => [d.driver_number, d]));

      // Convert laps to lap records with position based on speed
      const lapRecords: LapRecord[] = fastestLaps.map((lap, index) => {
        const driver = driverMap.get(lap.driver_number);

        return {
          driverName: driver?.full_name || `Driver ${lap.driver_number}`,
          driverAcronym: driver?.name_acronym || '???',
          teamName: driver?.team_name || 'Unknown',
          teamColor: driver?.team_colour || '000000',
          lapTime: this.formatLapTime(lap.lap_duration),
          position: index + 1 // Position based on fastest lap order
        };
      });

      return lapRecords;
    } catch (error) {
      logger.error('Error getting lap records:', error);
      return [];
    }
  }

  /**
   * Get track information with interesting facts and lap records
   */
  async getTrackInfo(): Promise<TrackInfo | null> {
    try {
      const meeting = await getLatestMeeting();

      if (!meeting) {
        // Return default Mexico track info if no meeting found
        return {
          name: 'Mexico City',
          location: 'Mexico City',
          country: 'Mexico',
          countryCode: 'MEX',
          flag: '🇲🇽',
          circuit: 'Autódromo Hermanos Rodríguez',
          facts: trackFacts['Mexico City'] || [
            'Check back for track information',
            'OpenF1 API will provide details',
            'Track facts coming soon'
          ],
          lapRecords: [],
          sessionType: 'Unknown'
        };
      }

      const circuitName = meeting.circuit_short_name;
      const flag = countryFlags[meeting.country_code] || '🏁';
      const facts = trackFacts[circuitName] || [
        `${meeting.location} circuit`,
        `Part of ${meeting.meeting_name}`,
        'Racing at this historic venue'
      ];

      // Try to get lap records from latest qualifying or race session
      let lapRecords: LapRecord[] = [];
      let sessionType = 'Unknown';

      try {
        const session = await this.getLatestSession();
        if (session) {
          sessionType = session.session_name;

          // Get lap records if session has results
          // Prioritize qualifying and race sessions
          if (session.session_type === 'Qualifying' || session.session_type === 'Race') {
            lapRecords = await this.getLapRecords(session.session_key, 5);
            logger.info(`Found ${lapRecords.length} lap records for ${session.session_name}`);
          }
        }
      } catch (error) {
        logger.warn('Could not fetch lap records:', error);
        // Continue without lap records
      }

      return {
        name: meeting.location,
        location: meeting.location,
        country: meeting.country_name,
        countryCode: meeting.country_code,
        flag,
        circuit: meeting.circuit_short_name,
        facts,
        lapRecords,
        sessionType
      };
    } catch (error) {
      logger.error('Error getting track info:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('OpenF1 cache cleared');
  }
}

// Singleton instance
export const openf1Service = new OpenF1Service();

// Export function for getting latest meeting
export async function getLatestMeeting(): Promise<Meeting | null> {
  return openf1Service.getLatestMeeting();
}

// Export function for getting track info
export async function getTrackInfo(): Promise<TrackInfo | null> {
  return openf1Service.getTrackInfo();
}
