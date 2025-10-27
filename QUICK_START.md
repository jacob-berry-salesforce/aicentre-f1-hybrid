# Quick Start Guide

Get your F1 Racing Simulator system up and running in minutes.

## Prerequisites

- Node.js 18+ installed on all PCs
- F1 25 game installed on PC 1 & 2
- All PCs connected to same local network
- Chrome browser installed
- (Optional) Elgato Stream Deck

## Step 1: Install Dependencies

On all three PCs:

```bash
cd /path/to/f1-racing-simulator
npm install
```

This installs dependencies for all components.

## Step 2: Configure PC 3 (Server)

1. Find PC 3's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.1.100`

2. Create environment file:
```bash
cd server
cp .env.example .env
```

3. Edit `server/.env` (minimal config):
```env
PORT=3000
UDP_PORT=20777
HEROKU_APP_URL=https://your-app.herokuapp.com
```

## Step 3: Configure PC 1 (Rig 1)

1. Create config files:
```bash
cd rig-client
cp .env.example .env
cp config.json.example config.json
```

2. Edit `rig-client/config.json`:
```json
{
  "rigId": "rig-1",
  "serverUrl": "http://192.168.1.100:3000",
  "herokuAppUrl": "https://your-app.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

**Important:** Replace `192.168.1.100` with PC 3's actual IP address!

## Step 4: Configure PC 2 (Rig 2)

Same as PC 1, but change `rigId` to `"rig-2"`:

```json
{
  "rigId": "rig-2",
  "serverUrl": "http://192.168.1.100:3000",
  ...
}
```

## Step 5: Configure F1 25 (on PC 1 & 2)

1. Launch F1 25
2. Go to: Settings → Telemetry Settings
3. Configure:
   - UDP Telemetry: **ON**
   - UDP IP Address: `192.168.1.100` (PC 3's IP)
   - UDP Port: `20777`
   - UDP Send Rate: `60Hz`
4. Save and exit

## Step 6: Start the System

### On PC 3 (Server + Dashboard):

```bash
npm run start:server
```

Open dashboard: http://localhost:3000

### On PC 1 (Rig 1):

```bash
npm run start:rig
```

Browser should open in kiosk mode showing attract screen.

### On PC 2 (Rig 2):

```bash
npm run start:rig
```

## Step 7: Setup Stream Deck (Optional)

1. Open Stream Deck software
2. Create 3 buttons with "Website" actions:

**Button 1 - Start Race:**
- URL: `http://192.168.1.100:3000/api/start-race`

**Button 2 - End Race:**
- URL: `http://192.168.1.100:3000/api/end-race`

**Button 3 - Reset:**
- URL: `http://192.168.1.100:3000/api/reset`

## Step 8: Test the System

### Test Registration:

1. Scan QR code on Rig 1 screen with your phone
2. Enter your name on mobile
3. Submit form
4. Rig 1 screen should update to "Ready to Race"
5. Dashboard should show your name under Rig 1

### Test Race Flow:

1. Ensure F1 25 is running on both rigs
2. Register at least one player (via QR code)
3. Press "Start Race" on Stream Deck (or call API)
4. Rigs should switch to F1 game
5. Dashboard should show live telemetry
6. Drive some laps
7. Press "End Race" on Stream Deck
8. Rigs should switch to results screen
9. Dashboard should show final results
10. Press "Reset" to return to attract screen

## Troubleshooting Quick Fixes

### Rigs can't connect to server:
```bash
# On PC 3, check if server is running
curl http://localhost:3000/api/health

# Test from rig PC
curl http://192.168.1.100:3000/api/health
```

### No telemetry data:
- Verify F1 25 is running and in a session
- Check UDP settings in game
- Confirm firewall allows UDP 20777

### Window switching doesn't work:
- Run rig client as Administrator
- Verify F1 game is actually running
- Check window title matches config

### Browser not loading pages:
- Check Heroku app URL is correct
- Verify internet connection
- Try navigating manually first

## Production Setup (Auto-Start)

Once tested, install as Windows services:

### On PC 1 & 2:
```bash
cd rig-client
npm run build
npm run install-service
```

Service will start automatically on boot.

## Common API Calls (Alternative to Stream Deck)

```bash
# Start race
curl -X POST http://192.168.1.100:3000/api/start-race

# End race
curl -X POST http://192.168.1.100:3000/api/end-race

# Reset
curl -X POST http://192.168.1.100:3000/api/reset

# Check status
curl http://192.168.1.100:3000/api/status
```

## Network Checklist

- [ ] All PCs on same network
- [ ] PC 3 has static IP (recommended)
- [ ] Firewall allows TCP 3000 on PC 3
- [ ] Firewall allows UDP 20777 on PC 3
- [ ] Can ping PC 3 from PC 1
- [ ] Can ping PC 3 from PC 2
- [ ] Internet access available (for Heroku app)

## File Structure Checklist

- [ ] `server/.env` created and configured
- [ ] `rig-client/config.json` created (PC 1 with rig-1)
- [ ] `rig-client/config.json` created (PC 2 with rig-2)
- [ ] All dependencies installed (`npm install`)
- [ ] All components built for production (`npm run build`)

## Next Steps

1. **Deploy Heroku App** - See `heroku-app/README.md`
2. **Configure Stream Deck** - See `stream-deck/README.md`
3. **Setup Salesforce Integration** - Configure webhook endpoint
4. **Customize Branding** - Update colors, logos, text
5. **Production Hardening** - Add authentication, monitoring, backups

## Support

For detailed documentation:
- Main README: `README.md`
- Server: `server/README.md`
- Rig Client: `rig-client/README.md`
- Heroku App: `heroku-app/README.md`
- Stream Deck: `stream-deck/README.md`

## System Status Indicators

**Dashboard Connection Indicators:**
- 🟢 Green dot = Connected
- 🔴 Red dot = Disconnected

**Dashboard System States:**
- `ATTRACT` = Waiting for players
- `RACING` = Race in progress
- `RESULTS` = Showing race results

**Expected Behavior:**
1. Start: All systems in ATTRACT state
2. Registration: Player name appears on dashboard
3. Race Start: State changes to RACING, game visible on rigs
4. Race End: State changes to RESULTS, results visible on rigs
5. Reset: State returns to ATTRACT, screens clear

Enjoy your F1 Racing Simulator! 🏎️🏁
