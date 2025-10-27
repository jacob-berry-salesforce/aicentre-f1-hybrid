# F1 Hybrid System - Complete Setup Summary

## Your Answers to Key Questions

### ✅ UDP Ports
**Q: Don't the two sims need to be set to different UDP ports?**

**A: NO!** Both sims send to the **SAME port (20777)** on the MacBook. This works because:
- UDP is connectionless - server receives from multiple sources
- Operating system queues packets from different sources
- Server identifies which rig by **source IP address**
- When rig connects via WebSocket, server maps: `IP address → rigId`
- UDP packets include source IP in metadata: `rinfo.address`
- Server routes: `sourceIp → rigId → telemetry data`

**How it works:**
1. Rig 1 connects via WebSocket → Server learns: `192.168.x.x = rig-1`
2. Rig 2 connects via WebSocket → Server learns: `192.168.y.y = rig-2`
3. UDP packet arrives from `192.168.x.x` → Routes to `rig-1`
4. UDP packet arrives from `192.168.y.y` → Routes to `rig-2`

**Configuration:**
- Rig 1: UDP IP = `10.104.88.20`, UDP Port = `20777`
- Rig 2: UDP IP = `10.104.88.20`, UDP Port = `20777` (SAME!)

**📖 Full explanation:** See [UDP_TELEMETRY_EXPLANATION.md](UDP_TELEMETRY_EXPLANATION.md)

### ✅ Heroku App Purpose
**Q: What's the Heroku app for? Just the registration page?**

**A: YES!** The Heroku app provides:
1. **Mobile registration interface** - Accessible from any phone via QR code
2. **Ready screen** - Shows after player registers
3. **Results screen** - Shows race results
4. **Public internet access** - So phones outside local network can register

**Flow:**
```
Phone scans QR → Heroku app (registration form) → POST to MacBook server → Player registered
```

**Heroku needs ngrok** to reach your MacBook (local network → internet tunnel)

### ✅ Heroku App Status
**Q: Has the Heroku app been created?**

**A: Code exists, NOT deployed yet.**
- ✅ Heroku app code is in `/heroku-app` directory
- ✅ Already built and ready to deploy
- ❌ Not deployed to Heroku yet (need to run `heroku create`)
- ✅ Real QR codes are now enabled
- ✅ Heroku URL is configurable via environment variable

### ✅ GitHub Repository
**Q: Does the repo need to be public?**

**A: NO, but it's easier if it is.**

**Your repo:** `https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git`

**If PRIVATE (current):**
- Windows PCs need authentication to clone
- Use personal access token or SSH key
- More secure for corporate use

**If PUBLIC:**
- Anyone can clone without auth
- Easier for Windows PCs
- ⚠️ Don't commit `.env` files with secrets!

**Clone commands for Windows:**
```cmd
# Private (with token):
git clone https://YOUR_TOKEN@github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git

# Public (no auth):
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
```

### ✅ Firewall Issue (Managed Mac)
**Q: Can't modify firewall from command line**

**A: Your Mac is managed by IT.**

**Solutions:**
1. **System Preferences GUI** - Try: System Prefs → Security → Firewall → Options
2. **Test first** - Firewall might already allow connections
3. **Different network** - Use unmanaged router or mobile hotspot
4. **Ask IT** - Request ports 3000 and 20777 be allowed

**Test if it's blocking:**
```bash
# On Windows PC:
curl http://10.104.88.20:3000/api/health

# If this works, firewall is NOT blocking!
```

## System Architecture

```
┌────────────────────── INTERNET ──────────────────────────┐
│                                                           │
│  Heroku App (https://aicentre-f1-racing.herokuapp.com)  │
│  ├─ Registration: /register?rig=1                        │
│  ├─ Ready screen: /ready?name=X                          │
│  └─ Results: /results                                    │
│                        ▲                                  │
│                        │ Scan QR code                     │
│                     [Phone]                               │
│                                                           │
│  ngrok Tunnel (https://abc123.ngrok.io)                 │
│  └─ Forwards to local MacBook                            │
│                        ▲                                  │
└────────────────────────┼──────────────────────────────────┘
                         │
                         │ POST /api/register
                         │
┌────────────────── LOCAL NETWORK (10.104.x.x) ────────────┐
│                        │                                  │
│  MacBook (10.104.88.20) - HOST/SERVER                   │
│  ├─ HTTP/WebSocket Server (Port 3000)                   │
│  ├─ UDP Telemetry Listener (Port 20777) ◄───┐          │
│  ├─ Dashboard UI (55" TV)                    │          │
│  └─ State Management                         │          │
│          │                                    │          │
│          │ WebSocket                     UDP telemetry   │
│          │ Commands                          │          │
│          ▼                                    │          │
│  ┌──────────────────┐              ┌─────────┴──────┐  │
│  │  Rig 1 (PC 1)    │              │  Rig 2 (PC 2)  │  │
│  │  ├─ Rig Client   │              │  ├─ Rig Client │  │
│  │  ├─ Chrome (QR)  │              │  ├─ Chrome (QR)│  │
│  │  └─ F1 25 Game ──┼──────────────┼──└─ F1 25 Game│  │
│  └──────────────────┘              └────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Network Configuration

### Your Current Setup
- **MacBook IP:** `10.104.88.20`
- **Network:** Local (10.104.x.x subnet)
- **Firewall:** Enabled, managed by IT

### Required Ports
| Device | Port | Protocol | Purpose | Status |
|--------|------|----------|---------|--------|
| MacBook | 3000 | TCP | HTTP/WebSocket | ⚠️ Check firewall |
| MacBook | 20777 | UDP | F1 telemetry | ⚠️ Check firewall |

### Firewall Test
```bash
# On MacBook:
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server
npm start

# On Windows PC:
curl http://10.104.88.20:3000/api/health

# If response received → Firewall OK!
# If timeout → Firewall blocking
```

## File Transfer Options

### Option 1: GitHub (Recommended)
✅ Best for version control
✅ Easy to update
❌ Requires auth for private repos

```bash
# On Windows PC:
cd C:\
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
cd aicentre-f1-hybrid\rig-client
npm install
```

### Option 2: Cloud Storage (Easiest)
✅ No auth needed
✅ Works with managed networks
❌ Manual updates

```bash
# On MacBook (create zip):
cd /Users/jacob.berry/Developer
zip -r f1-project.zip aicentre-f1-hybrid \
  -x "*/node_modules/*" -x "*/dist/*" -x "*/.git/*"

# Upload to: Google Drive, Dropbox, OneDrive, WeTransfer
# Download on Windows, extract to C:\f1-racing-simulator\
```

### Option 3: HTTP Server
✅ Fast for local network
❌ Requires MacBook to be running

```bash
# On MacBook:
cd /Users/jacob.berry/Developer
python3 -m http.server 8000

# On Windows browser: http://10.104.88.20:8000
# Download files manually
```

## Quick Start Checklist

### Phase 1: MacBook Setup (10 min)
- [ ] Clone/pull latest code
- [ ] Create `server/.env` file (already done!)
- [ ] Install dependencies: `npm install`
- [ ] Build server: `cd server && npm run build`
- [ ] Start server: `npm start`
- [ ] Test dashboard: http://10.104.88.20:3000
- [ ] Test API: `curl http://10.104.88.20:3000/api/health`

### Phase 2: Heroku Deployment (20 min)
- [ ] Install Heroku CLI: `brew install heroku`
- [ ] Login: `heroku login`
- [ ] Create app: `heroku create aicentre-f1-racing`
- [ ] Install ngrok: `brew install ngrok`
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Configure Heroku: `heroku config:set PC3_SERVER_URL=https://XXX.ngrok.io`
- [ ] Deploy: `git push heroku main`
- [ ] Test: `heroku open`

**Detailed guide:** [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

### Phase 3: Rig 1 Setup (15 min per rig)
- [ ] Transfer code to PC (GitHub/cloud/HTTP)
- [ ] Install Node.js 18+
- [ ] Install dependencies: `npm install`
- [ ] Create `rig-client/config.json`:
  ```json
  {
    "rigId": "rig-1",
    "serverUrl": "http://10.104.88.20:3000",
    "herokuAppUrl": "https://aicentre-f1-racing.herokuapp.com",
    "f1GameWindowTitle": "F1",
    "reconnectInterval": 5000,
    "heartbeatInterval": 30000
  }
  ```
- [ ] Build client: `npm run build`
- [ ] Configure F1 25:
  - UDP Telemetry: **ON**
  - UDP IP: `10.104.88.20`
  - UDP Port: `20777`
  - UDP Send Rate: `60Hz`
- [ ] Start client: `npm start`
- [ ] Verify connection (dashboard shows green)

### Phase 4: Rig 2 Setup (15 min)
- [ ] Same as Rig 1, but change `rigId` to `"rig-2"` in config

### Phase 5: Testing (10 min)
- [ ] All systems running
- [ ] Both rigs show green on dashboard
- [ ] QR codes are real (not fake SVG)
- [ ] Scan QR → register player
- [ ] Start race via API: `curl -X POST http://10.104.88.20:3000/api/start-race`
- [ ] Drive in F1 game
- [ ] Verify telemetry on dashboard
- [ ] End race via API: `curl -X POST http://10.104.88.20:3000/api/end-race`
- [ ] Check results

**Total setup time: ~70 minutes**

## Important Files Locations

### MacBook
```
/Users/jacob.berry/Developer/aicentre-f1-hybrid/
├── server/
│   ├── .env                    ← Server config (created!)
│   ├── src/index.ts            ← Main server
│   └── public/
│       ├── index.html          ← Dashboard (TV)
│       ├── sim-attract.html    ← Rig attract screens
│       └── sim-attract.js      ← QR code generation (updated!)
├── rig-client/
│   ├── config.json.example     ← Template for Windows
│   └── src/index.ts            ← Rig client
├── heroku-app/                 ← Mobile registration app
├── HEROKU_DEPLOYMENT.md        ← Deployment guide (NEW!)
├── DEPLOYMENT_CHECKLIST.md     ← Full checklist
└── QUICK_START.md              ← Quick reference
```

### Windows PCs
```
C:\f1-racing-simulator\
└── rig-client\
    ├── config.json             ← Create this! (rig-1 or rig-2)
    ├── .env                    ← Optional
    └── dist\                   ← After build
```

## Configuration Values

### Server (.env)
```env
PORT=3000
UDP_PORT=20777
LOG_LEVEL=info
CORS_ORIGIN=*
HEROKU_APP_URL=https://aicentre-f1-racing.herokuapp.com
```

### Rig 1 (config.json)
```json
{
  "rigId": "rig-1",
  "serverUrl": "http://10.104.88.20:3000",
  "herokuAppUrl": "https://aicentre-f1-racing.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

### Rig 2 (config.json)
```json
{
  "rigId": "rig-2",
  "serverUrl": "http://10.104.88.20:3000",
  "herokuAppUrl": "https://aicentre-f1-racing.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

### F1 Game Settings (Both Rigs)
- UDP Telemetry: **ON**
- UDP IP Address: `10.104.88.20`
- UDP Port: `20777`
- UDP Send Rate: `60Hz`
- UDP Format: `2025` or latest

## API Commands

### Race Control
```bash
# Register player (for testing without mobile)
curl -X POST http://10.104.88.20:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"rigId":"rig-1","name":"Driver 1"}'

# Start race
curl -X POST http://10.104.88.20:3000/api/start-race

# End race
curl -X POST http://10.104.88.20:3000/api/end-race

# Reset system
curl -X POST http://10.104.88.20:3000/api/reset

# Get status
curl http://10.104.88.20:3000/api/status

# Get config (for QR codes)
curl http://10.104.88.20:3000/api/config
```

## Troubleshooting Quick Fixes

### Rigs can't connect
```bash
# Test from Windows PC:
ping 10.104.88.20
curl http://10.104.88.20:3000/api/health
```

### No telemetry
1. Check F1 game UDP settings
2. Ensure game is in active session (driving)
3. Check server logs for UDP packets
4. Verify firewall allows UDP 20777

### QR code still fake
1. Check browser console for errors
2. Test: `curl http://10.104.88.20:3000/api/config`
3. Rebuild server: `cd server && npm run build && npm start`
4. Clear browser cache (Cmd+Shift+R)

### Registration fails
1. Check ngrok is running
2. Test ngrok URL: `curl https://YOUR-NGROK-URL.ngrok.io/api/health`
3. Check Heroku logs: `heroku logs --tail`
4. Verify HEROKU_APP_URL in server/.env

## What's Changed/Fixed

✅ **Real QR codes enabled**
- Replaced fake SVG with actual QR code generation
- Uses qrcode.js library
- Fetches Heroku URL from server config

✅ **Heroku URL is configurable**
- Server reads `HEROKU_APP_URL` from .env
- New endpoint: `/api/config` returns Heroku URL
- QR codes dynamically generated with correct URL

✅ **Server .env file created**
- Located at: `server/.env`
- Contains Heroku app URL for QR generation

✅ **Comprehensive documentation**
- [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md) - Complete deployment guide
- [SETUP_SUMMARY.md](SETUP_SUMMARY.md) - This file!
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Detailed checklist

## Next Steps

1. **Test MacBook firewall**
   ```bash
   cd server && npm start
   # From Windows PC: curl http://10.104.88.20:3000/api/health
   ```

2. **Deploy to Heroku** (if firewall OK)
   - Follow: [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)

3. **Transfer code to Windows PCs**
   - Use GitHub, cloud storage, or HTTP server

4. **Setup rigs**
   - Install Node.js
   - Configure config.json
   - Configure F1 game UDP

5. **Test complete system**
   - Registration flow
   - Race start/stop
   - Telemetry display
   - Results

## Support Documentation

- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Heroku Deployment**: [HEROKU_DEPLOYMENT.md](HEROKU_DEPLOYMENT.md)
- **Full Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Main README**: [README.md](README.md)

## Summary

- ✅ UDP: Both rigs use **same port 20777**
- ✅ Heroku: For **mobile registration** only
- ✅ QR codes: Now **real and configurable**
- ✅ Repository: Can be **private or public**
- ✅ Firewall: **Test first**, may not block
- ✅ Code transfer: **GitHub recommended**
- ⏳ Heroku: **Not deployed yet** (ready to deploy)
- ⏳ Windows PCs: **Not setup yet** (ready for setup)

**Ready to proceed with deployment!** 🏎️🏁
