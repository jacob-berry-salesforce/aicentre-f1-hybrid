# F1 Lap Records Feature

## Overview

The sim attract screens now display **real F1 driver lap times** from the latest qualifying or race session using the OpenF1 API. This allows customers to compare their simulator lap times against professional F1 drivers on the same track.

## Display Layout

### Right Column - Track Information (2x2 Grid)

**Top Section:**
- Track name with country flag
- Circuit official name

**Bottom Section (Side-by-side):**
- **Left:** Track Facts (5 interesting facts)
- **Right:** F1 Lap Times (Top 5 drivers with real times)

```
┌─────────────────────────────────────┐
│  🇲🇽 Mexico City                    │
│  Autódromo Hermanos Rodríguez       │
├──────────────────┬──────────────────┤
│ 🏁 Track Facts   │ ⏱️ F1 Times      │
│                  │ QUALIFYING       │
│ 📍 Highest alt   │ 1. VER 1:17.774  │
│ 📏 4.304 km      │ 2. HAM 1:18.012  │
│ ⏱️ Thin air     │ 3. SAI 1:18.156  │
│ 🏆 Peraltada     │ 4. LEC 1:18.289  │
│ 🌍 Since 1963    │ 5. PER 1:18.421  │
└──────────────────┴──────────────────┘
```

## Data Source

### OpenF1 API Endpoints Used:

1. **`/meetings`** - Get current/upcoming Grand Prix
2. **`/sessions`** - Get latest session (qualifying/race)
3. **`/session_result`** - Get final times from session
4. **`/drivers`** - Get driver names and team info

### Data Flow:

```
1. Get Latest Meeting → Mexico City Grand Prix
2. Get Latest Session → Qualifying (session_key: 9165)
3. Get Session Results → Top 5 positions with lap times
4. Get Driver Info → Names, teams, colors
5. Format & Display → VER 1:17.774 (Red Bull Racing)
```

## Lap Record Structure

```typescript
interface LapRecord {
  driverName: string;      // "Max VERSTAPPEN"
  driverAcronym: string;   // "VER"
  teamName: string;        // "Red Bull Racing"
  teamColor: string;       // "3671C6" (hex color)
  lapTime: string;         // "1:17.774"
  position: number;        // 1
}
```

## Display Features

### Visual Elements:

- **Position Number** - 1-5, gold for P1
- **Driver Acronym** - 3-letter code (VER, HAM, etc.)
- **Team Name** - In team color
- **Lap Time** - M:SS.mmm format
- **Gold Border** - P1 highlighted with gold left border
- **Staggered Animation** - Records fade in sequentially

### Comparison Value:

Customers can see:
- **Fastest F1 time:** 1:17.774 (Verstappen)
- **Their sim time:** 1:23.456
- **Gap to F1:** +5.682 seconds

This provides context for how they compare to professional drivers!

## Session Types Displayed

The system shows lap times from:
- ✅ **Qualifying** - Best lap times (Q3 preferred)
- ✅ **Race** - Fastest race laps
- ❌ **Practice** - Not shown (less reliable)

The session type is displayed above the times: "QUALIFYING" or "RACE"

## Time Formatting

Lap times are formatted from seconds to F1 standard format:

```javascript
91.743 seconds → "1:31.743"
77.774 seconds → "1:17.774"
```

Format: `M:SS.mmm`
- M = minutes
- SS = seconds (padded)
- mmm = milliseconds (3 digits)

## Caching Strategy

- **15-minute cache** on OpenF1 API calls (sessions don't change frequently)
- Auto-refresh every 15 minutes on sim screens
- **Stale cache fallback** - If rate limited (429), uses cached data even if stale
- Reduces API load while staying current
- Graceful degradation on API errors

## Error Handling

If lap records aren't available:
- Section is hidden (display: none)
- Only track facts are shown
- No error displayed to user
- Logs warning in server console

## Architecture Benefits

### Service Layer (`openf1.ts`):

```typescript
class OpenF1Service {
  // Get top 5 session results
  async getSessionResults(sessionKey, limit = 5)

  // Get driver information
  async getSessionDrivers(sessionKey)

  // Format seconds to M:SS.mmm
  private formatLapTime(seconds)

  // Combine results + drivers
  async getLapRecords(sessionKey, limit = 5)
}
```

### Well-Architected:
- ✅ Single Responsibility - Each method has one job
- ✅ Type Safety - Full TypeScript interfaces
- ✅ Error Handling - Graceful degradation
- ✅ Caching - Performance optimization
- ✅ Separation of Concerns - Service → API → UI

## Future Enhancements

Potential additions:

1. **Customer Comparison**
   - Show customer's best time
   - Calculate gap to F1 leader
   - Display percentile ranking

2. **Sector Times**
   - Break down sector-by-sector
   - Show where time is lost
   - Highlight improvement areas

3. **Speed Traps**
   - Top speeds through speed trap
   - Compare customer max speed
   - Display km/h values

4. **Historical Records**
   - All-time track record
   - Previous race winners
   - Lap record progression

5. **Live Updates**
   - Real-time during sessions
   - Live timing during quali/race
   - WebSocket updates (requires paid API)

## API Response Example

**GET `/api/track-info`**

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
    "4.304 km with Peraltada corner",
    "Passionate Mexican F1 fans",
    "Racing here since 1963"
  ],
  "lapRecords": [
    {
      "driverName": "Max VERSTAPPEN",
      "driverAcronym": "VER",
      "teamName": "Red Bull Racing",
      "teamColor": "3671C6",
      "lapTime": "1:17.774",
      "position": 1
    },
    {
      "driverName": "Lewis HAMILTON",
      "driverAcronym": "HAM",
      "teamName": "Mercedes",
      "teamColor": "27F4D2",
      "lapTime": "1:18.012",
      "position": 2
    }
  ],
  "sessionType": "Qualifying"
}
```

## Testing

1. **Start server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test API:**
   ```bash
   curl http://localhost:3000/api/track-info | jq
   ```

3. **View on sim screen:**
   ```
   http://localhost:3000/sim-attract.html?rig=1&preview=true
   ```

4. **Check console:**
   - Server: "Found 5 lap records for Qualifying"
   - Browser: "Displaying lap records: [...]"

## Credits

- **OpenF1 API** - Real-time F1 data
- **br-g** - OpenF1 creator
- Formula 1® - Official timing data source

---

**Note:** OpenF1 is unofficial and not associated with Formula 1 companies. F1®, FORMULA 1®, and related marks are trademarks of Formula One Licensing B.V.
