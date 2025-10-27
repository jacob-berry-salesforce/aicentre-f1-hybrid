# Deployment Checklist

Use this checklist to deploy the F1 Racing Simulator system from scratch.

## Pre-Deployment

### Hardware Setup
- [ ] PC 3 (Server) identified and networked
- [ ] PC 1 (Rig 1) with F1 25 installed
- [ ] PC 2 (Rig 2) with F1 25 installed
- [ ] All PCs connected to same local network
- [ ] Network is stable (wired Ethernet recommended)
- [ ] Stream Deck hardware available (optional)

### Software Prerequisites
- [ ] Node.js 18+ installed on all PCs
- [ ] npm installed on all PCs
- [ ] Chrome browser installed on PC 1 & 2
- [ ] F1 25 game installed and licensed on PC 1 & 2
- [ ] Git installed (for cloning repository)
- [ ] Text editor installed (VS Code recommended)

## Installation

### Step 1: Clone/Copy Project
- [ ] Project files copied to all three PCs
- [ ] Same directory structure on all PCs
- [ ] All files intact and readable

### Step 2: Install Dependencies
- [ ] Run `npm install` in project root (PC 3)
- [ ] Run `npm install` in project root (PC 1)
- [ ] Run `npm install` in project root (PC 2)
- [ ] All dependencies installed without errors
- [ ] No security vulnerabilities reported (or acknowledged)

### Step 3: Build All Components
- [ ] Run `npm run build` on PC 3
- [ ] Run `npm run build` on PC 1
- [ ] Run `npm run build` on PC 2
- [ ] All TypeScript compiled successfully
- [ ] No build errors

## Configuration

### PC 3 (Server) Configuration

#### Network Setup
- [ ] PC 3 IP address identified: _______________
- [ ] IP address is static (recommended)
- [ ] Port 3000 available (not in use)
- [ ] Port 20777 available (not in use)

#### Environment File
- [ ] `server/.env` created from `.env.example`
- [ ] PORT set correctly (default: 3000)
- [ ] UDP_PORT set correctly (default: 20777)
- [ ] HEROKU_APP_URL configured (if using)
- [ ] LOG_LEVEL set appropriately (default: info)

#### Firewall Rules
- [ ] Inbound TCP 3000 allowed
- [ ] Inbound UDP 20777 allowed
- [ ] Windows Firewall configured (or disabled for testing)

### PC 1 (Rig 1) Configuration

#### Environment File
- [ ] `rig-client/.env` created from `.env.example`
- [ ] RIG_ID set to "rig-1"
- [ ] SERVER_URL set to PC 3 IP (e.g., http://192.168.1.100:3000)
- [ ] HEROKU_APP_URL configured
- [ ] F1_GAME_WINDOW set to match game window title

#### Config File
- [ ] `rig-client/config.json` created from example
- [ ] rigId set to "rig-1"
- [ ] serverUrl set to PC 3 IP
- [ ] herokuAppUrl configured
- [ ] f1GameWindowTitle matches actual window

#### F1 25 Game Settings
- [ ] F1 25 launched at least once
- [ ] Settings → Telemetry Settings opened
- [ ] UDP Telemetry enabled
- [ ] UDP IP Address set to PC 3 IP
- [ ] UDP Port set to 20777
- [ ] UDP Send Rate set to 60Hz
- [ ] Settings saved

### PC 2 (Rig 2) Configuration

#### Environment File
- [ ] `rig-client/.env` created from `.env.example`
- [ ] RIG_ID set to "rig-2"
- [ ] SERVER_URL set to PC 3 IP
- [ ] HEROKU_APP_URL configured
- [ ] F1_GAME_WINDOW set to match game window title

#### Config File
- [ ] `rig-client/config.json` created from example
- [ ] rigId set to "rig-2"
- [ ] serverUrl set to PC 3 IP
- [ ] herokuAppUrl configured
- [ ] f1GameWindowTitle matches actual window

#### F1 25 Game Settings
- [ ] F1 25 launched at least once
- [ ] Settings → Telemetry Settings opened
- [ ] UDP Telemetry enabled
- [ ] UDP IP Address set to PC 3 IP
- [ ] UDP Port set to 20777
- [ ] UDP Send Rate set to 60Hz
- [ ] Settings saved

### Heroku App Deployment (Optional)

#### Heroku Setup
- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] Logged into Heroku CLI: `heroku login`
- [ ] Heroku app created: `heroku create APP-NAME`

#### Configuration
- [ ] `heroku-app/.env` created for local testing
- [ ] PC3_SERVER_URL configured (with ngrok or public IP)
- [ ] Heroku config vars set:
  - [ ] `heroku config:set PC3_SERVER_URL=...`
  - [ ] `heroku config:set NODE_ENV=production`
  - [ ] `heroku config:set APP_URL=...`

#### Deployment
- [ ] Code committed to git
- [ ] Pushed to Heroku: `git push heroku main`
- [ ] Build completed successfully
- [ ] App is running: `heroku ps`
- [ ] Logs show no errors: `heroku logs --tail`

#### Public Access
- [ ] ngrok or port forwarding configured (for PC 3 access)
- [ ] Heroku app can reach PC 3 server
- [ ] Test connection from Heroku logs

## Testing

### Network Connectivity Tests

#### PC 1 → PC 3
- [ ] Can ping PC 3: `ping 192.168.1.100`
- [ ] Can reach HTTP: `curl http://192.168.1.100:3000/api/health`
- [ ] WebSocket test successful

#### PC 2 → PC 3
- [ ] Can ping PC 3: `ping 192.168.1.100`
- [ ] Can reach HTTP: `curl http://192.168.1.100:3000/api/health`
- [ ] WebSocket test successful

### Component Startup Tests

#### PC 3 Server
- [ ] Server starts: `npm run start:server`
- [ ] No error messages in console
- [ ] Dashboard loads: http://localhost:3000
- [ ] WebSocket server running
- [ ] UDP listener active on port 20777

#### PC 1 Rig Client
- [ ] Client starts: `npm run start:rig`
- [ ] Connects to server successfully
- [ ] Browser launches in kiosk mode
- [ ] Attract screen displays
- [ ] QR code visible and correct
- [ ] Dashboard shows Rig 1 as connected

#### PC 2 Rig Client
- [ ] Client starts: `npm run start:rig`
- [ ] Connects to server successfully
- [ ] Browser launches in kiosk mode
- [ ] Attract screen displays
- [ ] QR code visible and correct
- [ ] Dashboard shows Rig 2 as connected

### Registration Flow Test

#### Mobile Registration (Rig 1)
- [ ] Scan QR code with mobile device
- [ ] Registration page loads correctly
- [ ] Enter test name and submit
- [ ] No errors during submission
- [ ] Redirects to ready screen
- [ ] Ready screen shows correct name
- [ ] Rig 1 browser updates to ready screen
- [ ] Dashboard shows player name for Rig 1

#### Mobile Registration (Rig 2)
- [ ] Scan QR code with mobile device
- [ ] Registration page loads correctly
- [ ] Enter test name and submit
- [ ] No errors during submission
- [ ] Redirects to ready screen
- [ ] Ready screen shows correct name
- [ ] Rig 2 browser updates to ready screen
- [ ] Dashboard shows player name for Rig 2

### Race Flow Test

#### Pre-Race
- [ ] At least one player registered
- [ ] F1 25 running on registered rig(s)
- [ ] Game is at main menu or ready to race
- [ ] Dashboard shows correct system state (ATTRACT)

#### Race Start
- [ ] Start race via Stream Deck or API
- [ ] No errors in server logs
- [ ] Rig browsers minimize/hide
- [ ] F1 25 game comes to foreground on both rigs
- [ ] Dashboard updates to RACING state
- [ ] Dashboard shows "Waiting for telemetry..."

#### During Race
- [ ] Start a race in F1 25 (Time Trial or Grand Prix)
- [ ] Drive at least 2-3 laps
- [ ] Telemetry appears on dashboard
- [ ] Live positions updating
- [ ] Lap times recorded
- [ ] Speed displayed
- [ ] No dropped connections
- [ ] No errors in logs

#### Race End
- [ ] End race via Stream Deck or API
- [ ] Results calculated correctly
- [ ] Winner determined (if multiple players)
- [ ] Rig browsers come to foreground
- [ ] Results page displays on rigs
- [ ] Results show on dashboard
- [ ] All lap times recorded
- [ ] Fastest lap calculated correctly

#### Reset
- [ ] Reset via Stream Deck or API
- [ ] Player names cleared
- [ ] Rigs return to attract screen
- [ ] QR codes displayed again
- [ ] Dashboard cleared
- [ ] System state returns to ATTRACT

### Window Management Test

#### Rig 1
- [ ] Can switch from browser to F1 game
- [ ] Can switch from F1 game to browser
- [ ] Window brings to foreground correctly
- [ ] No manual intervention needed

#### Rig 2
- [ ] Can switch from browser to F1 game
- [ ] Can switch from F1 game to browser
- [ ] Window brings to foreground correctly
- [ ] No manual intervention needed

### Stream Deck Test (if applicable)

- [ ] Stream Deck connected and recognized
- [ ] Button 1 (Start Race) triggers correctly
- [ ] Button 2 (End Race) triggers correctly
- [ ] Button 3 (Reset) triggers correctly
- [ ] Visual feedback shows button press
- [ ] API responses logged correctly

### Error Handling Tests

#### Network Interruption
- [ ] Disconnect PC 1 from network
- [ ] Dashboard shows Rig 1 disconnected
- [ ] Reconnect PC 1
- [ ] Rig 1 auto-reconnects
- [ ] Dashboard updates connection status

#### Server Restart
- [ ] Restart server while rigs connected
- [ ] Rigs detect disconnection
- [ ] Rigs auto-reconnect when server returns
- [ ] Dashboard restores connection status

#### Game Crash
- [ ] Close F1 game during race
- [ ] System continues to function
- [ ] Can end race despite missing game
- [ ] No server crashes

## Production Setup

### Windows Service Installation

#### PC 1 Rig Client
- [ ] Built successfully: `npm run build`
- [ ] Run Command Prompt as Administrator
- [ ] Navigate to rig-client directory
- [ ] Run: `npm run install-service`
- [ ] Service installed successfully
- [ ] Service started automatically
- [ ] Test service: `sc query "F1 Rig Client - rig-1"`
- [ ] Test auto-start by rebooting PC
- [ ] Service starts on boot automatically

#### PC 2 Rig Client
- [ ] Built successfully: `npm run build`
- [ ] Run Command Prompt as Administrator
- [ ] Navigate to rig-client directory
- [ ] Run: `npm run install-service`
- [ ] Service installed successfully
- [ ] Service started automatically
- [ ] Test service: `sc query "F1 Rig Client - rig-2"`
- [ ] Test auto-start by rebooting PC
- [ ] Service starts on boot automatically

### PC 3 Server Setup

#### Using PM2
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Server started: `pm2 start dist/index.js --name f1-server`
- [ ] Process saved: `pm2 save`
- [ ] Startup configured: `pm2 startup` (follow instructions)
- [ ] Test auto-start by rebooting PC
- [ ] Server starts on boot automatically

#### Or Using systemd (Linux)
- [ ] systemd service file created
- [ ] Service enabled: `systemctl enable f1-server`
- [ ] Service started: `systemctl start f1-server`
- [ ] Service status checked: `systemctl status f1-server`
- [ ] Test auto-start by rebooting PC

## Documentation

### System Documentation
- [ ] Network diagram updated with actual IPs
- [ ] All passwords/keys documented (if any)
- [ ] Contact information added
- [ ] Troubleshooting guide reviewed

### User Training
- [ ] Operators trained on Stream Deck usage
- [ ] Race flow documented and understood
- [ ] Emergency procedures documented
- [ ] Backup procedures documented

### Maintenance Plan
- [ ] Log rotation configured
- [ ] Backup schedule established
- [ ] Update procedures documented
- [ ] Monitoring plan in place

## Final Verification

### End-to-End Test
- [ ] Start all systems from scratch
- [ ] Complete full race flow (register → race → results → reset)
- [ ] Test with both rigs simultaneously
- [ ] Verify all telemetry data correct
- [ ] Verify results calculation accurate
- [ ] Test multiple races in sequence
- [ ] System performs reliably

### Performance Verification
- [ ] Dashboard updates smoothly (no lag)
- [ ] Telemetry data appears immediately
- [ ] Window switching is fast (< 1 second)
- [ ] API responses quick (< 100ms)
- [ ] No memory leaks over extended operation
- [ ] System stable for 2+ hours of operation

### User Acceptance
- [ ] System demonstrated to stakeholders
- [ ] User feedback collected
- [ ] Any issues addressed
- [ ] System approved for production use

## Go-Live

### Pre-Launch
- [ ] All systems tested one final time
- [ ] All PCs rebooted fresh
- [ ] All services running automatically
- [ ] Dashboard accessible and monitored
- [ ] Emergency contact information posted
- [ ] Backup plan documented

### Launch Day
- [ ] Arrive early to verify all systems
- [ ] Run quick verification test
- [ ] Monitor for first hour of operation
- [ ] Address any issues immediately
- [ ] Document any unexpected behavior

### Post-Launch
- [ ] Review logs for errors
- [ ] Collect user feedback
- [ ] Document lessons learned
- [ ] Plan for updates/improvements
- [ ] Schedule maintenance window

## Ongoing Maintenance

### Daily
- [ ] Check dashboard shows both rigs connected
- [ ] Verify no errors in logs
- [ ] Test quick race flow

### Weekly
- [ ] Review all log files
- [ ] Clear old race data (if needed)
- [ ] Verify disk space adequate
- [ ] Test full race flow
- [ ] Update any documentation

### Monthly
- [ ] Review system performance
- [ ] Check for software updates
- [ ] Backup configuration files
- [ ] Test disaster recovery
- [ ] Review and update procedures

## Success Criteria

System is production-ready when:
- [ ] All checklist items above are complete
- [ ] System operates reliably for 8+ hours
- [ ] Multiple races completed without issues
- [ ] All stakeholders approve system
- [ ] Documentation is complete and accurate
- [ ] Team is trained and confident
- [ ] Backup and recovery procedures tested

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________
**Approved By:** _______________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
