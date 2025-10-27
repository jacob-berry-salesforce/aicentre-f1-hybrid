# OpenF1 API Integration

This project integrates with the [OpenF1 API](https://openf1.org/) to provide real-time Formula 1 track information and facts on the simulator attract screens.

## Architecture

### Service Layer (`/server/src/services/openf1.ts`)

The OpenF1 service is built with the following architectural principles:

1. **Singleton Pattern** - Single instance manages all API calls
2. **Caching Layer** - 5-minute cache to reduce API load
3. **Type Safety** - Full TypeScript interfaces for all data structures
4. **Error Handling** - Graceful fallbacks when API is unavailable
5. **Separation of Concerns** - Service layer decoupled from API endpoints

#### Key Components:

```typescript
// Main service class
class OpenF1Service {
  - fetch<T>()           // Generic HTTP client with caching
  - getLatestMeeting()   // Fetch current/upcoming Grand Prix
  - getLatestSession()   // Fetch current session
  - getTrackInfo()       // Get track details with facts
  - clearCache()         // Manual cache invalidation
}

// Public interface
export const openf1Service: OpenF1Service
export async function getLatestMeeting(): Promise<Meeting | null>
export async function getTrackInfo(): Promise<TrackInfo | null>
```

### API Endpoint (`/server/src/index.ts`)

**GET `/api/track-info`**

Returns current track information with interesting facts.

**Response:**
```json
{
  "name": "Mexico City",
  "location": "Mexico City",
  "country": "Mexico",
  "countryCode": "MEX",
  "flag": "🇲🇽",
  "circuit": "Autódromo Hermanos Rodríguez",
  "facts": [
    "Highest altitude circuit (2,200m)",
    "Thin air affects performance",
    "Autódromo Hermanos Rodríguez",
    "4.304 km with Peraltada corner",
    "Passionate Mexican F1 fans"
  ]
}
```

### Frontend Integration (`/server/public/sim-attract.js`)

The sim attract screen fetches track data on load and refreshes every 5 minutes:

```javascript
async function loadTrackInfo() {
  const response = await fetch('/api/track-info');
  const trackInfo = await response.json();

  // Update UI with track details and facts
  updateTrackHeader(trackInfo);
  updateTrackFacts(trackInfo.facts);
}

// Load on page load
loadTrackInfo();

// Refresh every 5 minutes
setInterval(loadTrackInfo, 5 * 60 * 1000);
```

## Data Flow

```
┌─────────────────┐
│   OpenF1 API    │
│  openf1.org/v1  │
└────────┬────────┘
         │
         │ HTTP GET
         │ (with 5min cache)
         ▼
┌─────────────────────┐
│  OpenF1Service      │
│  /services/openf1   │
│  - Caching          │
│  - Type conversion  │
│  - Error handling   │
└────────┬────────────┘
         │
         │ getTrackInfo()
         ▼
┌─────────────────────┐
│  Express API        │
│  GET /api/track-info│
└────────┬────────────┘
         │
         │ HTTP JSON
         ▼
┌─────────────────────┐
│  Sim Attract Screen │
│  sim-attract.html   │
│  - Display facts    │
│  - Auto-refresh     │
└─────────────────────┘
```

## Track Facts Database

The service includes a comprehensive database of track facts for all circuits:

- **Bahrain** - First GP 2004, night race, desert location
- **Jeddah** - Newest street circuit, second-fastest
- **Melbourne** - Albert Park, unpredictable weather
- **Suzuka** - Figure-8 layout, legendary 130R
- **Shanghai** - Unique snail shape, longest straight
- **Miami** - Hard Rock Stadium, debuted 2022
- **Imola** - Named after Senna, Tamburello corner
- **Monaco** - Most prestigious, tightest circuit
- **Barcelona** - Primary testing venue
- **Montreal** - Wall of Champions, Safety Car drama
- **Spielberg** - Shortest circuit, Austrian Alps
- **Silverstone** - Home of British GP, first F1 race
- **Hungaroring** - Monaco without walls
- **Spa-Francorchamps** - Legendary Eau Rouge, longest circuit
- **Zandvoort** - Banked corners, Max Verstappen home
- **Monza** - Temple of Speed, fastest circuit
- **Baku** - Longest straight (2.2km)
- **Singapore** - First night race, most demanding
- **Austin** - COTA, Turn 1 uphill challenge
- **Mexico City** - Highest altitude, thin air
- **São Paulo** - Interlagos, iconic Senna S
- **Las Vegas** - Strip racing, neon-lit spectacle
- **Lusail** - Qatar desert, night race
- **Yas Marina** - Season finale, sunset to night

## API Features Used

### Meetings Endpoint
```
GET https://api.openf1.org/v1/meetings?meeting_key=latest
```

Returns information about the current or upcoming Grand Prix weekend.

### Sessions Endpoint
```
GET https://api.openf1.org/v1/sessions?session_key=latest
```

Returns information about the current session (Practice, Qualifying, Race).

## Error Handling

The service implements multiple layers of error handling:

1. **API Errors** - Logs error, returns null or stale cached data
2. **Rate Limiting (429)** - Automatically uses stale cache and extends cache duration
3. **Network Errors** - Falls back to cached data (even if stale) or defaults
4. **Invalid Data** - Type checking ensures data integrity
5. **Missing Data** - Default Mexico City facts as fallback

### Rate Limit Handling

When the OpenF1 API returns a 429 (Too Many Requests) error:
- The service checks if there's any cached data available (even if expired)
- If cached data exists, it's returned and the cache timestamp is updated
- This prevents repeated API calls while rate limited
- Logs a warning with the age of the stale cache being used
- Ensures the sim attract screens continue showing data even during rate limits

## Performance Optimizations

1. **Response Caching** - 15-minute TTL reduces API calls
2. **Stale Cache Fallback** - Returns old data on rate limits or errors
3. **Singleton Pattern** - Single service instance
4. **Async/Await** - Non-blocking API calls
5. **Frontend Refresh** - 15-minute intervals, not per-frame
6. **Lightweight Payload** - Only essential data fetched

## Future Enhancements

Potential expansions using other OpenF1 endpoints:

- **Weather Data** - Display current track conditions
- **Driver Information** - Show current session participants
- **Lap Records** - Display fastest laps for the circuit
- **Session Timing** - Countdown to next session
- **Historical Data** - Previous race results at venue
- **Live Telemetry** - Real-time race data during sessions

## Testing

To test the integration:

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test the API endpoint:**
   ```bash
   curl http://localhost:3000/api/track-info
   ```

3. **View in browser:**
   ```
   http://localhost:3000/sim-attract.html?rig=1&preview=true
   ```

4. **Check console logs:**
   - Server logs show OpenF1 API calls
   - Browser console shows track data received
   - Track facts appear in right column

## Credits

Special thanks to:
- **OpenF1** - Free, open-source F1 data API
- **br-g** - Creator of OpenF1
- **FastF1** - Python package that inspired OpenF1

## License Compliance

⚠️ OpenF1 is an unofficial project not associated with Formula 1 companies. F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.

This project uses OpenF1 for educational and display purposes only.
