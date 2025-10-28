# F1 Racing Simulator System

A professional multi-rig F1 racing simulator management system featuring real-time telemetry, mobile player registration, live dashboards, and race control automation.

## Overview

This system orchestrates a complete F1 racing experience across multiple computers:
- **MacBook Pro Server** - Central coordinator and race control
- **Windows Rig Clients** - Run F1 25 game and display attract screens
- **Heroku Mobile App** - QR code registration for players
- **Stream Deck Integration** - Physical race control buttons

## Quick Start

### For New Team Members

**See: [docs/TEAM_HANDOVER.md](docs/TEAM_HANDOVER.md)** for complete onboarding guide.

### Prerequisites

- Node.js 18+ and npm 8+
- Doppler CLI (for secrets management)
- Git

### 5-Minute Setup

```bash
# 1. Clone repository
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
cd aicentre-f1-hybrid

# 2. Install Doppler CLI
brew install dopplerhq/cli/doppler
doppler login

# 3. Start server
cd server
doppler setup --project aicentre-f1-hybrid --config dev
doppler run -- npm start
```

**Dashboard:** http://10.104.88.20:3000

## System Architecture

```
┌─────────────────┐
│  Mobile Device  │ ◄──── QR Code Registration
│  (Heroku App)   │
└────────┬────────┘
         │ HTTPS
         │ ngrok tunnel
         ▼
┌─────────────────────────────────────────┐
│       MacBook Pro Server (10.104.88.20) │
│  ┌─────────────────────────────────┐   │
│  │  Express + Socket.io + UDP      │   │
│  │  - Race coordination            │   │
│  │  - Telemetry processing         │   │
│  │  - Dashboard UI                 │   │
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────┬───┘
       │ WebSocket                    │ UDP :20777
       │                              │ (F1 Telemetry)
   ┌───▼───────┐              ┌──────▼────────┐
   │  Rig 1    │              │  Rig 2        │
   │  Windows  │              │  Windows      │
   │           │              │               │
   │  - F1 25  │              │  - F1 25      │
   │  - Chrome │              │  - Chrome     │
   │  - Client │              │  - Client     │
   └───────────┘              └───────────────┘
```

## Documentation

### Getting Started
- **[Team Handover](docs/TEAM_HANDOVER.md)** - New team member onboarding
- **[Quick Start](docs/QUICK_START.md)** - Fast setup guide
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Complete system overview

### Setup & Deployment
- **[Doppler Setup](docs/DOPPLER_SETUP.md)** - Secrets management (read this first!)
- **[Windows Rig Setup](docs/WINDOWS_RIG_SETUP.md)** - Configure Windows rigs
- **[Heroku Deployment](docs/HEROKU_DEPLOYMENT.md)** - Deploy mobile app
- **[GitHub Workflow](docs/GITHUB_DESKTOP_WORKFLOW.md)** - Using GitHub Desktop
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checks

### Technical Details
- **[Architecture](docs/ARCHITECTURE.md)** - System design and components
- **[UDP Telemetry](docs/UDP_TELEMETRY_EXPLANATION.md)** - How telemetry routing works
- **[Setup Summary](docs/SETUP_SUMMARY.md)** - Detailed configuration guide

### Future Features
- **[Lap Records](docs/LAP_RECORDS_FEATURE.md)** - Leaderboard implementation plan
- **[OpenF1 Integration](docs/OPENF1_INTEGRATION.md)** - Real F1 data integration
- **[Preview Guide](docs/PREVIEW_GUIDE.md)** - Upcoming features

## Project Structure

```
aicentre-f1-hybrid/
├── server/              # MacBook Pro server (Node.js/TypeScript)
│   ├── src/            # Source code
│   ├── public/         # Dashboard UI and attract screens
│   └── package.json
├── rig-client/         # Windows rig background service
│   ├── src/           # Client logic and browser automation
│   └── package.json
├── heroku-app/        # Mobile registration app
│   ├── client/        # React frontend
│   ├── server/        # Express backend
│   └── package.json
├── stream-deck/       # Stream Deck profiles
├── assets/           # Videos and images
├── docs/            # All documentation
└── package.json     # Monorepo workspace config
```

## Key Features

### Race Flow
1. **Attract Mode** - QR codes displayed on rig screens
2. **Registration** - Players scan QR code and register on mobile
3. **Race Start** - Rigs switch to F1 game automatically
4. **Live Telemetry** - Real-time lap times, speeds, positions
5. **Results** - Automatic results display after race
6. **Reset** - Return to attract mode for next session

### Technology Stack
- **Backend:** Node.js, TypeScript, Express, Socket.io
- **Frontend:** React, Vite, HTML5
- **Automation:** Puppeteer (browser control)
- **Deployment:** Heroku, GitHub Actions
- **Secrets:** Doppler
- **Telemetry:** UDP (F1 25 game data)

## Common Commands

### Development

```bash
# Start server (development)
npm run dev:server

# Start rig client (development)
npm run dev:rig

# Start Heroku app (development)
npm run dev:heroku

# Build all components
npm run build

# Clean all builds
npm run clean
```

### Production

```bash
# Start server with Doppler secrets
cd server
doppler run -- npm start

# Start rig client on Windows
cd rig-client
npm start
```

### Doppler Secrets

```bash
# View all secrets
doppler secrets --project aicentre-f1-hybrid --config dev

# Update a secret
doppler secrets set KEY=value --project aicentre-f1-hybrid --config dev

# Run with secrets injected
doppler run -- npm start
```

## Configuration

**All secrets stored in Doppler!** See [docs/DOPPLER_SETUP.md](docs/DOPPLER_SETUP.md)

### Environment Variables

**Server (MacBook):**
- `PORT` - Server HTTP port (3000)
- `UDP_PORT` - F1 telemetry port (20777)
- `HEROKU_APP_URL` - Mobile app URL

**Heroku App:**
- `PC3_SERVER_URL` - ngrok tunnel to MacBook
- `NODE_ENV` - Environment (production)

**Rig Client (Windows):**
- `RIG_SERVER_URL` - MacBook server URL
- `F1_GAME_WINDOW_TITLE` - F1 window name

### F1 25 Game Settings

**In F1 25 Telemetry Settings:**
- UDP Telemetry: **ON**
- UDP IP Address: **10.104.88.20** (MacBook IP)
- UDP Port: **20777**
- UDP Send Rate: **60Hz**
- UDP Format: **2025**

**Both rigs use the same port!** Server routes by source IP.

## URLs & Access

- **Dashboard:** http://10.104.88.20:3000
- **Heroku App:** https://aicentre-f1-26277ba32ef3.herokuapp.com
- **Doppler:** https://dashboard.doppler.com/workplace/projects/aicentre-f1-hybrid
- **GitHub:** https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid

## Troubleshooting

### Rigs Offline (Red Status)
1. Check server is running: `curl http://10.104.88.20:3000/api/health`
2. Check rig client is running on Windows
3. Check network connectivity: `ping 10.104.88.20`
4. Review logs: `C:\aicentre-f1-hybrid\rig-client\logs\`

### No Telemetry
1. Verify F1 25 UDP settings match above
2. Restart F1 game to reload telemetry settings
3. Check server logs for UDP packets
4. Ensure race is started: `curl -X POST http://10.104.88.20:3000/api/start-race`

### Heroku App Issues
```bash
# Check Heroku status
heroku ps --app aicentre-f1

# View logs
heroku logs --tail --app aicentre-f1

# Restart app
heroku restart --app aicentre-f1
```

## Development Workflow

### Making Changes

1. Create feature branch (optional)
2. Make changes and test locally
3. Commit with GitHub Desktop or CLI
4. Push to main branch
5. GitHub Actions auto-deploys Heroku app

See: [docs/GITHUB_DESKTOP_WORKFLOW.md](docs/GITHUB_DESKTOP_WORKFLOW.md)

### Testing

```bash
# Test server locally
cd server
npm run dev

# Test full race flow
curl -X POST http://10.104.88.20:3000/api/start-race
# Drive in F1 25
curl -X POST http://10.104.88.20:3000/api/end-race
curl -X POST http://10.104.88.20:3000/api/reset
```

## Team Collaboration

### Inviting New Team Members

1. **Add to Doppler:**
   - Go to: https://dashboard.doppler.com/workplace/team
   - Invite with Developer role

2. **Share Documentation:**
   - Send [docs/TEAM_HANDOVER.md](docs/TEAM_HANDOVER.md)
   - Ensure they have GitHub access

3. **Onboarding:**
   - Install Doppler CLI
   - Clone repository
   - Run `doppler login`
   - Start development

## Status

### Complete
- ✅ MacBook server deployed and tested
- ✅ Heroku mobile app deployed
- ✅ QR code registration flow working
- ✅ UDP telemetry from both rigs
- ✅ Dashboard with live data
- ✅ GitHub Actions auto-deployment
- ✅ Doppler secrets management
- ✅ Comprehensive documentation

### In Progress
- 🚧 Windows Rig 2 final setup
- 🚧 Stream Deck integration testing

### Future
- 📋 Lap records and leaderboard
- 📋 Player statistics tracking
- 📋 Race replay system
- 📋 Multi-player race support

## Support

**Documentation:** See [docs/](docs/) folder

**Logs:**
- Server: Terminal or `server/logs/`
- Heroku: `heroku logs --tail --app aicentre-f1`
- Rig Client: `C:\aicentre-f1-hybrid\rig-client\logs\`

**Help:**
- Review [docs/TEAM_HANDOVER.md](docs/TEAM_HANDOVER.md)
- Check [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Contact: jacob.berry@salesforce.com

## License

MIT License - See [LICENSE](LICENSE)

---

**Ready to start?** → [docs/TEAM_HANDOVER.md](docs/TEAM_HANDOVER.md)

**Setting up Doppler?** → [docs/DOPPLER_SETUP.md](docs/DOPPLER_SETUP.md)

**Deploying?** → [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)
