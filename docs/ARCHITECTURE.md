# System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER JOURNEY                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Customer scans QR code on rig screen                            │
│  2. Opens registration page on mobile                               │
│  3. Submits name → Heroku → PC 3 → Rig updates to "Ready"          │
│  4. Operator presses Stream Deck → Race starts                      │
│  5. F1 game sends telemetry → PC 3 → Dashboard                      │
│  6. Race ends → Results displayed                                   │
│  7. System reset → Back to QR codes                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        NETWORK ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   INTERNET       │
                         └────────┬─────────┘
                                  │
                                  │ HTTPS
                                  │
                    ┌─────────────▼──────────────┐
                    │   HEROKU WEB APP           │
                    │   (Public Access)          │
                    │                            │
                    │   • /attract (QR codes)    │
                    │   • /register (form)       │
                    │   • /ready (waiting)       │
                    │   • /results (leaderboard) │
                    └─────────────┬──────────────┘
                                  │
                                  │ WebSocket/HTTP
                                  │ (via ngrok/port forward)
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                       LOCAL NETWORK (192.168.1.x)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PC 3 (HOST/SERVER) - 192.168.1.100                         │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  Node.js Server (Port 3000)                            │ │  │
│  │  │  • Express REST API                                    │ │  │
│  │  │  • WebSocket Server (Socket.io)                        │ │  │
│  │  │  • UDP Telemetry Listener (Port 20777)                 │ │  │
│  │  │  • Race Data Manager                                   │ │  │
│  │  │  • State Machine (ATTRACT/RACING/RESULTS)              │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  Dashboard (Browser)                                   │ │  │
│  │  │  • Real-time leaderboard                               │ │  │
│  │  │  • Live telemetry display                              │ │  │
│  │  │  • Connection status                                   │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                  ▲ WebSocket                ▲ UDP Telemetry        │
│                  │                          │                       │
│         ┌────────┴──────────┬──────────────┴────────┐             │
│         │                   │                        │             │
│  ┌──────▼─────────┐  ┌──────▼─────────┐             │             │
│  │  PC 1 (RIG 1)  │  │  PC 2 (RIG 2)  │             │             │
│  ├────────────────┤  ├────────────────┤             │             │
│  │ Rig Client     │  │ Rig Client     │             │             │
│  │ • WebSocket    │  │ • WebSocket    │             │             │
│  │ • Window Mgr   │  │ • Window Mgr   │             │             │
│  │ • Browser Ctrl │  │ • Browser Ctrl │             │             │
│  ├────────────────┤  ├────────────────┤             │             │
│  │ Chrome Kiosk   │  │ Chrome Kiosk   │             │             │
│  │ (Fullscreen)   │  │ (Fullscreen)   │             │             │
│  ├────────────────┤  ├────────────────┤             │             │
│  │ F1 25 Game     │  │ F1 25 Game     │             │             │
│  │ (UDP→PC3)      │  │ (UDP→PC3)      │◄────────────┘             │
│  └────────────────┘  └────────────────┘                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Stream Deck (Optional)                                      │ │
│  │  • Button 1: POST /api/start-race                            │ │
│  │  • Button 2: POST /api/end-race                              │ │
│  │  • Button 3: POST /api/reset                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Communication Flow

### 1. Player Registration

```
Mobile Phone → Heroku App → PC 3 Server → Rig Client → Browser Update

[Mobile]  Scan QR Code
    ↓
[Mobile]  POST /api/register {rig: 1, name: "John"}
    ↓
[Heroku]  Forward to PC 3 server
    ↓
[PC 3]    Store player data
    ↓
[PC 3]    WebSocket: player:registered
    ↓
[Rig 1]   Receive event
    ↓
[Rig 1]   Navigate browser to /ready?name=John
```

### 2. Race Start

```
Stream Deck → PC 3 Server → All Rig Clients → Window Switch

[Stream]  POST http://PC3:3000/api/start-race
    ↓
[PC 3]    Validate players registered
    ↓
[PC 3]    Initialize race data
    ↓
[PC 3]    WebSocket: command:start_race
    ↓
[Rig 1]   Receive command
[Rig 2]   Receive command
    ↓
[Rig 1]   Focus F1 game window
[Rig 2]   Focus F1 game window
    ↓
[PC 3]    Update state to RACING
    ↓
[Dashboard] Display live telemetry
```

### 3. Live Telemetry During Race

```
F1 Game → UDP → PC 3 Server → WebSocket → Dashboard

[F1 Game] Send UDP packets (60 Hz)
    ↓
[PC 3]    Parse telemetry (lap times, speed, position)
    ↓
[PC 3]    Update live telemetry map
    ↓
[PC 3]    WebSocket: telemetry:update
    ↓
[Dashboard] Update leaderboard and stats
```

### 4. Race End

```
Stream Deck → PC 3 Server → Finalize Results → Rig Clients → Results Page

[Stream]  POST http://PC3:3000/api/end-race
    ↓
[PC 3]    Calculate final positions
    ↓
[PC 3]    Determine winner
    ↓
[PC 3]    Save to race history
    ↓
[PC 3]    WebSocket: command:end_race
    ↓
[Rig 1]   Navigate browser to /results
[Rig 2]   Navigate browser to /results
    ↓
[Rig 1]   Focus browser window
[Rig 2]   Focus browser window
    ↓
[PC 3]    Update state to RESULTS
    ↓
[Dashboard] Display final results
[Heroku]   Display results page
```

### 5. System Reset

```
Stream Deck → PC 3 Server → Clear State → Rig Clients → Attract Screen

[Stream]  POST http://PC3:3000/api/reset
    ↓
[PC 3]    Clear all player data
    ↓
[PC 3]    Reset race data
    ↓
[PC 3]    WebSocket: command:reset
    ↓
[Rig 1]   Navigate browser to /attract
[Rig 2]   Navigate browser to /attract
    ↓
[Rig 1]   Focus browser window (show QR code)
[Rig 2]   Focus browser window (show QR code)
    ↓
[PC 3]    Update state to ATTRACT
    ↓
[Dashboard] Clear current race
```

## State Machine

```
╔═══════════╗
║  ATTRACT  ║  ← Initial state, showing QR codes
╚═════╤═════╝
      │
      │ POST /api/register (player registers)
      │ (can register multiple players)
      │
      ▼
╔═══════════╗
║  ATTRACT  ║  ← Still in ATTRACT, but with registered players
╚═════╤═════╝
      │
      │ POST /api/start-race (Stream Deck)
      │ Requirement: At least 1 player registered
      │
      ▼
╔═══════════╗
║  RACING   ║  ← Game active, telemetry flowing
╚═════╤═════╝
      │
      │ POST /api/end-race (Stream Deck)
      │
      ▼
╔═══════════╗
║  RESULTS  ║  ← Showing race results
╚═════╤═════╝
      │
      │ POST /api/reset (Stream Deck)
      │
      └──────────► Back to ATTRACT
```

## Data Flow

### Race Data Structure

```typescript
interface RaceData {
  sessionId: string;              // Unique session identifier
  timestamp: Date;                // Race start time
  players: PlayerRaceData[];      // Array of players
  winner?: string;                // Winner name
  raceCompleted: boolean;         // Race finished flag
}

interface PlayerRaceData {
  rigId: string;                  // "rig-1" or "rig-2"
  name: string;                   // Player name
  finalPosition?: number;         // Final race position
  fastestLap?: number;            // Fastest lap time (ms)
  totalTime?: number;             // Total race time (ms)
  lapTimes: number[];             // Array of lap times
}

interface LiveTelemetry {
  rigId: string;                  // "rig-1" or "rig-2"
  position: number;               // Current position
  currentLap: number;             // Current lap number
  lastLapTime?: number;           // Last lap time (ms)
  speed: number;                  // Speed (km/h)
  gap?: number;                   // Gap to car in front (ms)
  deltaToLeader?: number;         // Gap to leader (ms)
}
```

### WebSocket Events Summary

**Server → Clients:**
- `state:change` - System state changed
- `rig:status` - Rig connection status
- `telemetry:update` - Live telemetry data
- `race:completed` - Race finished
- `race:data` - Full race data
- `player:registered` - Player registered
- `command:start_race` - Start race command
- `command:end_race` - End race command
- `command:reset` - Reset command

**Clients → Server:**
- `rig:register` - Rig registers with server
- `dashboard:register` - Dashboard registers
- `heartbeat` - Keep-alive ping
- `request:race_results` - Request results

### API Endpoints Summary

**Race Control:**
- `POST /api/start-race` - Start race
- `POST /api/end-race` - End race
- `POST /api/reset` - Reset system

**Data:**
- `POST /api/register` - Register player
- `GET /api/status` - System status
- `GET /api/race-results` - Latest results
- `GET /api/race-history` - All races
- `GET /api/health` - Health check

**Integration:**
- `POST /api/salesforce-webhook` - Salesforce data export

## Technology Stack

### Server (PC 3)
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **WebSocket:** Socket.io
- **Language:** TypeScript
- **Logging:** Winston
- **Telemetry:** Custom UDP parser

### Rig Client (PC 1 & 2)
- **Runtime:** Node.js 18+
- **WebSocket:** Socket.io-client
- **Window Management:** node-window-manager
- **Browser Control:** Puppeteer
- **Language:** TypeScript
- **Service:** node-windows (Windows) or PM2

### Heroku App
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **QR Codes:** qrcode.react
- **Backend:** Express.js
- **WebSocket:** Socket.io + Socket.io-client

### Dashboard
- **Stack:** HTML5 + CSS3 + JavaScript
- **WebSocket:** Socket.io-client
- **UI:** Vanilla JS (no framework)

## Network Ports

| Port  | Protocol | Direction | Purpose                    |
|-------|----------|-----------|----------------------------|
| 3000  | TCP      | Inbound   | HTTP/WebSocket Server      |
| 20777 | UDP      | Inbound   | F1 Telemetry               |
| 5000  | TCP      | Outbound  | Heroku app (development)   |
| 443   | TCP      | Outbound  | Heroku HTTPS               |

## Security Considerations

1. **Server (PC 3):**
   - Runs on local network only
   - No authentication by default
   - CORS configured for Heroku origin
   - No sensitive data stored

2. **Rig Clients:**
   - Connect to known server only
   - No external connections except Heroku
   - Browser runs in kiosk mode (restricted)

3. **Heroku App:**
   - Public-facing (registration only)
   - Input sanitization for player names
   - No user accounts or authentication
   - HTTPS enforced

4. **Recommendations:**
   - Use VPN for PC 3 internet access
   - Firewall rules to restrict access
   - Monitor logs for suspicious activity
   - Regular security updates

## Scaling Considerations

### Current Design (2 Rigs):
- In-memory storage
- Direct WebSocket connections
- Single server instance

### Future Scaling (4+ Rigs):
- **Database:** Add Redis or PostgreSQL for race data
- **Message Queue:** Add Redis Pub/Sub for WebSocket scaling
- **Load Balancing:** Multiple server instances behind load balancer
- **Session Management:** Sticky sessions or shared session store
- **Monitoring:** Add Prometheus/Grafana for metrics

## Deployment Topology

### Development:
```
PC 3: npm run dev:server
PC 1: npm run dev:rig
PC 2: npm run dev:rig
Heroku: npm run dev:heroku (local)
```

### Production:
```
PC 3: PM2 or systemd service
PC 1: Windows Service (node-windows)
PC 2: Windows Service (node-windows)
Heroku: Auto-deployed via git push
```

## Monitoring & Logging

### Server Logs:
- `server/logs/combined.log` - All logs
- `server/logs/error.log` - Errors only

### Rig Client Logs:
- `rig-client/logs/rig-client.log` - All rig activity

### Heroku Logs:
- `heroku logs --tail` - View live logs

### Key Metrics to Monitor:
- WebSocket connection count
- Telemetry packet rate
- Race completion rate
- Error rate
- Response times

## Disaster Recovery

### Server Crash:
- Restart server
- Rig clients auto-reconnect
- Race data lost if in-memory (add persistence)

### Rig Client Crash:
- Windows service auto-restarts
- Re-registers with server
- Browser relaunches

### Network Outage:
- Rig clients buffer and reconnect
- Dashboard shows disconnected state
- Resume when network restored

### Heroku Downtime:
- Registration unavailable
- Racing continues unaffected
- Results available on local dashboard
