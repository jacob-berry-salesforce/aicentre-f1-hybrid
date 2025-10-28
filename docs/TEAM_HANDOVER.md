# F1 Hybrid System - Team Handover Guide

Quick reference for new team members taking over the F1 Racing Simulator project.

---

## Project Overview

**What is it?**
- F1 racing simulator system with 2 Windows rigs
- MacBook Pro server for coordination
- Heroku mobile app for player registration
- Real-time telemetry from F1 25 game
- QR code registration flow

**Architecture:**
- **server/** - MacBook Pro server (Node.js/TypeScript)
- **heroku-app/** - Mobile registration app (React + Express)
- **rig-client/** - Windows rig background service (Node.js/TypeScript)
- **stream-deck/** - Stream Deck profiles for race control

---

## Quick Start (5 Minutes)

### 1. Clone Repository

```bash
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
cd aicentre-f1-hybrid
```

### 2. Install Doppler CLI

```bash
brew install dopplerhq/cli/doppler
doppler login
```

### 3. Start MacBook Server

```bash
cd server
npm install
doppler setup --project aicentre-f1-hybrid --config dev
doppler run -- npm start
```

Server starts on: http://10.104.88.20:3000

### 4. Access Dashboard

Open: http://10.104.88.20:3000

You'll see:
- Rig 1 and Rig 2 status (RED = offline, GREEN = connected)
- Live telemetry when racing
- System state (ATTRACT, WAITING, RACING, RESULTS)

---

## Key Resources

### Documentation
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DOPPLER_SETUP.md](DOPPLER_SETUP.md) - Secrets management
- [WINDOWS_RIG_SETUP.md](WINDOWS_RIG_SETUP.md) - Windows rig setup guide
- [GITHUB_DESKTOP_WORKFLOW.md](GITHUB_DESKTOP_WORKFLOW.md) - GitHub Desktop workflow

### URLs
- **Dashboard:** http://10.104.88.20:3000
- **Heroku App:** https://aicentre-f1-26277ba32ef3.herokuapp.com
- **Doppler Dashboard:** https://dashboard.doppler.com/workplace/projects/aicentre-f1-hybrid
- **GitHub Repo:** https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid

### Credentials
All stored in Doppler! See [DOPPLER_SETUP.md](DOPPLER_SETUP.md)

---

## System Components

### 1. MacBook Pro Server (server/)

**Purpose:** Central coordinator for entire system

**Responsibilities:**
- Receives UDP telemetry from F1 game on both rigs
- Routes telemetry to correct rig
- Manages WebSocket connections to rig clients
- Serves dashboard UI
- Stores session data
- Provides REST API for race control

**Tech Stack:**
- Node.js + TypeScript
- Express.js
- Socket.io
- UDP server for F1 telemetry
- Winston logger

**Environment:**
```bash
PORT=3000
UDP_PORT=20777
HEROKU_APP_URL=https://aicentre-f1-26277ba32ef3.herokuapp.com
```

**Start:**
```bash
cd server
doppler run -- npm start
```

---

### 2. Heroku Mobile App (heroku-app/)

**Purpose:** Mobile registration interface

**Responsibilities:**
- Player registration via QR code
- Ready/waiting screen
- Race results display
- Communicates with MacBook server via ngrok tunnel

**Tech Stack:**
- React (client/)
- Express.js (server/)
- Deployed on Heroku
- Auto-deploys via GitHub Actions

**URLs:**
- Production: https://aicentre-f1-26277ba32ef3.herokuapp.com
- Registration: https://aicentre-f1-26277ba32ef3.herokuapp.com/register?rig=1

**Deploy:**
- Push to `main` branch → GitHub Actions auto-deploys
- See [GITHUB_DESKTOP_WORKFLOW.md](GITHUB_DESKTOP_WORKFLOW.md)

---

### 3. Windows Rig Clients (rig-client/)

**Purpose:** Background service running on each Windows rig

**Responsibilities:**
- Opens Chrome in kiosk mode
- Shows attract screen with QR code
- Switches between browser and F1 game
- Connects to MacBook server via WebSocket
- Reports rig status

**Tech Stack:**
- Node.js + TypeScript
- Puppeteer (browser automation)
- node-window-manager (window switching)
- Socket.io-client

**Configuration:**
- Rig 1: `rigId: "rig-1"`
- Rig 2: `rigId: "rig-2"`
- Server URL: http://10.104.88.20:3000

**Setup:**
See [WINDOWS_RIG_SETUP.md](WINDOWS_RIG_SETUP.md)

---

## Network Configuration

### IP Addresses
- **MacBook Server:** 10.104.88.20
- **Windows Rig 1:** (receives telemetry)
- **Windows Rig 2:** (receives telemetry)

### Ports
- **Server HTTP:** 3000
- **Server UDP (Telemetry):** 20777
- **Heroku App:** 5000 (internal)

### Tunnels
- **ngrok:** https://supertemporal-cordelia-noncontending.ngrok-free.app
  - Tunnels MacBook server to Heroku app
  - Allows Heroku to send registration data back to MacBook

---

## Common Tasks

### Start Everything

**1. Start MacBook Server:**
```bash
cd server
doppler run -- npm start
```

**2. Start ngrok (separate terminal):**
```bash
ngrok http 3000
# Update NGROK_URL in Doppler if URL changes
```

**3. Start Windows Rigs:**
On each Windows PC:
```cmd
cd C:\aicentre-f1-hybrid\rig-client
npm start
```

**4. Verify:**
- Dashboard shows both rigs GREEN
- Rig screens show attract screens with QR codes
- Scan QR code → Registration page loads

---

### Deploy Heroku App

**Option 1: GitHub Desktop (Recommended)**
1. Make changes in `heroku-app/`
2. Open GitHub Desktop
3. Write commit message
4. Click "Commit to main"
5. Click "Push origin"
6. GitHub Actions auto-deploys (~2 minutes)

See: [GITHUB_DESKTOP_WORKFLOW.md](GITHUB_DESKTOP_WORKFLOW.md)

**Option 2: Command Line**
```bash
git add .
git commit -m "Update message"
git push origin main
```

---

### Update Configuration

**Never edit .env files directly!** Use Doppler instead:

```bash
# View all secrets
doppler secrets --project aicentre-f1-hybrid --config dev

# Update a value
doppler secrets set PORT=3001 --project aicentre-f1-hybrid --config dev

# Restart services to pick up changes
```

---

### Run a Race (Manual Testing)

**1. Register Player:**
- Scan QR code on rig screen
- Enter name → Submit
- Rig screen shows "Ready to Race"

**2. Start Race:**
```bash
curl -X POST http://10.104.88.20:3000/api/start-race
```
- Rig switches to F1 game
- Start driving in Time Trial mode

**3. Monitor:**
- Dashboard shows live telemetry
- Speed, position, lap times update in real-time

**4. End Race:**
```bash
curl -X POST http://10.104.88.20:3000/api/end-race
```
- Rig switches back to results screen
- Shows lap times and stats

**5. Reset:**
```bash
curl -X POST http://10.104.88.20:3000/api/reset
```
- Returns to attract screen

---

## F1 Game Configuration

**IMPORTANT:** F1 25 game must send telemetry to MacBook server.

**In F1 25:**
1. Settings → Game Options → Telemetry Settings
2. Configure:
   - UDP Telemetry: ON
   - UDP IP Address: 10.104.88.20
   - UDP Port: 20777
   - UDP Send Rate: 60Hz
   - UDP Format: 2025

**Both rigs use SAME port (20777)** - Server routes by source IP.

See: [UDP_TELEMETRY_EXPLANATION.md](UDP_TELEMETRY_EXPLANATION.md)

---

## Troubleshooting

### Rigs Show Red Dot

**Problem:** Rig not connecting to server

**Check:**
1. Is server running? `curl http://10.104.88.20:3000/api/health`
2. Is rig client running? Check Command Prompt
3. Firewall blocking? Test: `ping 10.104.88.20`
4. Check rig client logs: `C:\aicentre-f1-hybrid\rig-client\logs\rig-client.log`

**Fix:**
```bash
# Restart server
cd server
doppler run -- npm start

# Restart rig client
cd C:\aicentre-f1-hybrid\rig-client
npm start
```

---

### No Telemetry

**Problem:** Dashboard shows no speed/lap times during race

**Check:**
1. F1 game UDP settings correct?
2. Server receiving UDP packets? Check server logs
3. Race started? `curl -X POST http://10.104.88.20:3000/api/start-race`

**Fix:**
1. Verify F1 game UDP IP: 10.104.88.20
2. Verify F1 game UDP Port: 20777
3. Restart F1 game (reload UDP settings)

---

### Heroku App Not Loading

**Problem:** QR code scan shows error

**Check:**
1. Heroku app running? `heroku ps --app aicentre-f1`
2. Recent deployment failed? Check GitHub Actions
3. ngrok tunnel working? `curl $NGROK_URL`

**Fix:**
```bash
# Check Heroku logs
heroku logs --tail --app aicentre-f1

# Restart Heroku app
heroku restart --app aicentre-f1

# Redeploy
git push origin main
```

---

## Development Workflow

### Making Changes

1. **Create feature branch** (optional):
```bash
git checkout -b feature/my-feature
```

2. **Make changes** in VS Code or preferred editor

3. **Test locally:**
```bash
cd server
doppler run -- npm run dev
```

4. **Commit:**
```bash
git add .
git commit -m "Description of changes"
```

5. **Push:**
```bash
git push origin main
# Or: git push origin feature/my-feature
```

6. **Verify:**
- GitHub Actions deploys Heroku app (if heroku-app changed)
- Test on rigs

---

### Testing Changes

**Server Changes:**
```bash
cd server
npm run dev  # Hot reload with tsx
```

**Heroku App Changes:**
```bash
cd heroku-app/client
npm start  # React dev server

# In another terminal:
cd heroku-app/server
npm run dev  # Express dev server
```

**Rig Client Changes:**
```bash
cd rig-client
npm run dev  # Hot reload with tsx
```

---

## Important Files

### Configuration
- `server/.env` - Server config (backup - use Doppler instead)
- `heroku-app/.env` - Heroku app config (backup - use Doppler instead)
- `rig-client/config.json` - Rig client config (created during Windows setup)

### Code
- `server/src/index.ts` - Main server logic
- `heroku-app/client/src/` - React mobile app
- `heroku-app/server/src/index.ts` - Heroku backend
- `rig-client/src/index.ts` - Rig client logic
- `rig-client/src/browser-controller.ts` - Browser automation

### Documentation
- `PROJECT_SUMMARY.md` - Project overview
- `ARCHITECTURE.md` - System architecture
- `DOPPLER_SETUP.md` - Secrets management
- `WINDOWS_RIG_SETUP.md` - Windows setup
- `GITHUB_DESKTOP_WORKFLOW.md` - Deployment workflow
- `TEAM_HANDOVER.md` - This file

---

## Secrets and Credentials

**ALL secrets stored in Doppler!**

View: https://dashboard.doppler.com/workplace/projects/aicentre-f1-hybrid

**Key Secrets:**
- `HEROKU_API_KEY` - For GitHub Actions deployment
- `PC3_SERVER_URL` - ngrok tunnel URL
- `HEROKU_APP_URL` - Heroku app URL
- All server/rig client config

See: [DOPPLER_SETUP.md](DOPPLER_SETUP.md) for complete guide.

---

## Getting Help

### Documentation
1. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
2. Check [ARCHITECTURE.md](ARCHITECTURE.md)
3. See specific guides (DOPPLER_SETUP.md, etc.)

### Logs
- **Server:** Terminal output or Winston logs
- **Heroku:** `heroku logs --tail --app aicentre-f1`
- **Rig Client:** `C:\aicentre-f1-hybrid\rig-client\logs\rig-client.log`

### Support
- **GitHub Issues:** https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid/issues
- **Original Developer:** jacob.berry@salesforce.com

---

## Next Steps for New Team

### Immediate (Day 1)
- [ ] Clone repository
- [ ] Install Doppler CLI and login
- [ ] Start MacBook server
- [ ] Access dashboard
- [ ] Read PROJECT_SUMMARY.md and ARCHITECTURE.md

### Week 1
- [ ] Setup Windows rigs following WINDOWS_RIG_SETUP.md
- [ ] Test full race flow (register → race → results)
- [ ] Deploy a small change to Heroku
- [ ] Familiarize with codebase

### Week 2
- [ ] Add new feature or fix bug
- [ ] Update documentation
- [ ] Optimize performance
- [ ] Add tests (currently minimal)

---

## Project Status

### ✅ Complete
- MacBook server running and tested
- Heroku app deployed and working
- QR code registration flow working
- UDP telemetry receiving from both rigs
- Dashboard showing live data
- GitHub Actions auto-deployment
- Doppler secrets management
- Comprehensive documentation

### 🚧 In Progress
- Windows Rig 2 setup (hardware available, needs software installation)
- Stream Deck integration (profiles created, needs testing)

### 📋 Future Enhancements
- Lap record tracking and leaderboard
- Player statistics and history
- Race replay/highlights
- Multi-player race support
- Advanced telemetry visualization

---

## Summary

**You now have:**
- ✅ Complete codebase
- ✅ All secrets in Doppler
- ✅ Comprehensive documentation
- ✅ Working MacBook server
- ✅ Deployed Heroku app
- ✅ Automated deployment via GitHub Actions
- ✅ Windows deployment package ready

**To get started:**
1. Clone repo
2. Install Doppler CLI
3. Run `doppler run -- npm start` in server/
4. Access http://10.104.88.20:3000
5. Start building!

**Questions?**
- Read the docs
- Check Doppler for secrets
- Review code comments
- Contact jacob.berry@salesforce.com

**Welcome to the team! 🏎️**
