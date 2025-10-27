# F1 Racing Simulator Management System

A complete multi-PC racing simulator management system for F1 25, featuring real-time telemetry, player registration via QR codes, live leaderboards, and Stream Deck integration.

## System Architecture

### Hardware Setup
- **PC 3 (Host):** Runs local Node.js server + displays dashboard in browser
- **PC 1 & 2 (Sim Rigs):** Run F1 25 game + background service + browser in kiosk mode
- **Network:** All PCs connected on same local network
- **Optional:** Elgato Stream Deck for race control

### Software Components

```
f1-racing-simulator/
├── server/           # Local Node.js server (PC 3)
├── rig-client/       # Background service (PC 1 & 2)
├── heroku-app/       # Web app for public access
└── stream-deck/      # Stream Deck configuration docs
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (server, rig-client, heroku-app).

### 2. Configure Environment Variables

**Server (PC 3):**
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

**Rig Client (PC 1 & 2):**
```bash
cd rig-client
cp .env.example .env
cp config.json.example config.json
# Edit .env and config.json with your configuration
# IMPORTANT: Set RIG_ID to "rig-1" on PC 1 and "rig-2" on PC 2
```

**Heroku App:**
```bash
cd heroku-app
cp .env.example .env
# Edit .env with PC 3 server IP address
```

### 3. Build All Components

```bash
npm run build
```

### 4. Start the System

**On PC 3 (Server):**
```bash
npm run start:server
```
Access dashboard at: http://localhost:3000

**On PC 1 & 2 (Rig Clients):**
```bash
npm run start:rig
```

## System Flow

### 1. Attract Mode
- Rigs display QR codes in browser (kiosk mode)
- Customers scan QR code with their phone
- System state: `ATTRACT`

### 2. Registration
- Customer opens registration page on mobile
- Enters name and submits
- Rig browser updates to "Ready to Race" screen
- Dashboard shows registered players

### 3. Race Start
- Operator presses "Start Race" on Stream Deck
- Server validates at least one player registered
- Rigs switch from browser to F1 25 game window
- System state: `RACING`
- Dashboard shows live telemetry

### 4. Race In Progress
- F1 25 sends UDP telemetry to PC 3 (port 20777)
- Server parses telemetry and broadcasts to dashboard
- Dashboard displays:
  - Live leaderboard
  - Current positions
  - Lap times
  - Speed, gap between drivers
  - Race duration

### 5. Race End
- Operator presses "End Race" on Stream Deck
- Server finalizes race data
- Calculates positions, fastest lap, winner
- Rigs switch from game to results browser page
- System state: `RESULTS`
- Results displayed on rigs and dashboard

### 6. Reset
- Operator presses "Reset" on Stream Deck
- System clears all registrations
- Returns to attract mode
- System state: `ATTRACT`

## Development

### Run in Development Mode

**Server:**
```bash
npm run dev:server
```

**Rig Client:**
```bash
npm run dev:rig
```

**Heroku App:**
```bash
npm run dev:heroku
```

**Run all in parallel:**
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:rig

# Terminal 3
npm run dev:heroku
```

## F1 25 Configuration

### Enable UDP Telemetry

1. Launch F1 25
2. Go to Settings > Telemetry Settings
3. Enable UDP Telemetry
4. Set UDP IP Address to PC 3's local IP (e.g., 192.168.1.100)
5. Set UDP Port to 20777
6. Set UDP Send Rate to 60Hz (recommended)
7. Save settings

### Supported Data

The system captures and displays:
- Lap times and positions
- Speed, throttle, brake
- Tire temperatures and pressures
- Sector times
- Gap to car in front / race leader
- Pit stops and penalties

## Deployment

### PC 3 Server (Local)

The server runs locally on PC 3 and is not deployed externally.

```bash
npm run build:server
npm run start:server
```

### Rig Clients (Windows Service)

To run rig clients as Windows services:

1. Build the client:
```bash
cd rig-client
npm run build
```

2. Install as Windows service (requires admin):
```bash
npm run install-service
```

3. The service will start automatically on boot

4. To uninstall:
```bash
npm run uninstall-service
```

**Alternative: PM2 (Cross-platform)**
```bash
npm install -g pm2
pm2 start dist/index.js --name "rig-client-1"
pm2 save
pm2 startup
```

### Heroku App

1. Create Heroku app:
```bash
heroku create my-racing-app
```

2. Set environment variables:
```bash
heroku config:set PC3_SERVER_URL=http://YOUR-PC3-PUBLIC-IP:3000
heroku config:set NODE_ENV=production
```

3. Deploy:
```bash
npm run deploy:heroku
```

**Note:** PC 3 server must be accessible from the internet for Heroku app integration. Consider using ngrok or port forwarding for testing.

## Stream Deck Setup

See [stream-deck/README.md](stream-deck/README.md) for detailed Stream Deck configuration.

**Quick Setup:**
1. Install Stream Deck software
2. Create three buttons with "Website" actions:
   - Start Race: `http://localhost:3000/api/start-race`
   - End Race: `http://localhost:3000/api/end-race`
   - Reset: `http://localhost:3000/api/reset`

## API Documentation

### Server Endpoints (PC 3)

**Race Control:**
- `POST /api/start-race` - Start race (Stream Deck)
- `POST /api/end-race` - End race (Stream Deck)
- `POST /api/reset` - Reset system (Stream Deck)

**Player Management:**
- `POST /api/register` - Register player (called by Heroku app)

**Data Access:**
- `GET /api/status` - Get system status
- `GET /api/race-results` - Get latest race results
- `GET /api/race-history` - Get all race history
- `GET /api/health` - Health check

**Integration:**
- `POST /api/salesforce-webhook` - Salesforce data export

### WebSocket Events

**Server → Clients:**
- `state:change` - System state changed
- `rig:status` - Rig connection status update
- `telemetry:update` - Live telemetry data
- `race:completed` - Race finished
- `player:registered` - Player registered

**Clients → Server:**
- `rig:register` - Rig client registration
- `dashboard:register` - Dashboard registration
- `heartbeat` - Keep-alive ping

## Troubleshooting

### Rigs not connecting to server
- Check network connectivity
- Verify SERVER_URL in rig-client config.json
- Check firewall settings on PC 3 (allow port 3000)
- Review rig-client logs: `rig-client/logs/rig-client.log`

### No telemetry data
- Verify F1 25 UDP telemetry is enabled
- Check UDP IP address matches PC 3
- Confirm UDP port is 20777
- Ensure game is running during race
- Check server logs: `server/logs/combined.log`

### QR codes not working
- Verify Heroku app is deployed and accessible
- Check HEROKU_APP_URL in server .env
- Test QR URL manually on phone
- Ensure devices are on same network (or Heroku app is public)

### Window switching not working
- Verify F1 25 game is running
- Check F1_GAME_WINDOW setting in rig config
- Test window manager manually
- May need to run rig client with elevated privileges

### Browser not opening in kiosk mode
- Check Chrome is installed
- Verify Puppeteer installation
- Check browser controller logs
- Try running manually first (npm run dev:rig)

## Network Configuration

### Local Network Setup

All PCs must be on the same local network:

**PC 3 (Server):**
- Static IP recommended: 192.168.1.100
- Open ports: 3000 (HTTP/WebSocket), 20777 (UDP)

**PC 1 (Rig 1):**
- Dynamic IP acceptable
- Update config.json with PC 3 IP

**PC 2 (Rig 2):**
- Dynamic IP acceptable
- Update config.json with PC 3 IP

### Firewall Rules

**PC 3:**
- Allow incoming TCP 3000 (server)
- Allow incoming UDP 20777 (F1 telemetry)

**PC 1 & 2:**
- Allow outgoing TCP 3000 (to PC 3)

## Performance Optimization

### Server
- Adjust telemetry broadcast rate if needed
- Monitor memory usage for long sessions
- Consider Redis for race data storage at scale

### Rig Clients
- Close unnecessary background applications
- Ensure adequate RAM for F1 25 + browser
- Use SSD for faster window switching

### Network
- Use wired Ethernet connections (recommended)
- Ensure adequate bandwidth for telemetry streaming
- Consider dedicated network switch for isolation

## Security Considerations

- Server runs on local network only (not exposed to internet)
- Heroku app can be public (registration only)
- No sensitive data stored
- Consider adding authentication for production use
- Use HTTPS for Heroku app
- Sanitize user inputs (names)

## License

MIT

## Support

For issues, questions, or contributions:
1. Check troubleshooting section
2. Review component-specific READMEs
3. Check server/rig logs
4. Open an issue on GitHub

## Credits

Built with:
- Node.js & TypeScript
- Express.js & Socket.io
- React & Vite
- Puppeteer
- F1 2025 UDP Telemetry API
