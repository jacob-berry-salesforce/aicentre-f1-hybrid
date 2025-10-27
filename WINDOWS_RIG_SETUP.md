# Windows Rig Setup Guide

Complete step-by-step guide to setup Racing Sim 2 (or any Windows rig).

## ✅ Mac Build Complete!

The rig-client code has been **built on Mac** and is ready for Windows deployment.

**Package created:** `rig-client-windows.zip` (34KB)

---

## 📦 Step 1: Transfer Code to Windows

### Option A: Upload to Cloud Storage (Easiest)

**On Mac:**
1. Upload `rig-client-windows.zip` to:
   - Google Drive: https://drive.google.com
   - OneDrive: https://onedrive.live.com
   - Dropbox: https://www.dropbox.com

**On Windows Rig:**
1. Download the zip file
2. Extract to `C:\aicentre-f1-hybrid\rig-client`

### Option B: Copy via Network Share

**On Mac:**
```bash
# If Windows rig is on same network
# Copy via SMB (if file sharing enabled on Windows)
```

---

## 🔧 Step 2: Install Node.js on Windows

**Download and Install:**
1. Go to: https://nodejs.org/
2. Download **LTS version** (20.x or higher)
3. Run installer with **default settings**
4. Verify installation:

```cmd
node --version
# Should show: v20.x.x or higher

npm --version
# Should show: 10.x.x or higher
```

---

## 📝 Step 3: Install Dependencies on Windows

**Open Command Prompt as Administrator:**
- Right-click **Command Prompt** or **PowerShell**
- Select **"Run as administrator"**

```cmd
cd C:\aicentre-f1-hybrid\rig-client

# Install dependencies (SKIP native module builds)
npm install --production --ignore-scripts

# If that fails, try:
npm install --omit=dev --ignore-scripts
```

**Expected output:**
```
added 150 packages in 30s
```

**Common issues:**
- ❌ `node-window-manager rebuild failed` → **IGNORE** (we used `--ignore-scripts`)
- ❌ `Visual Studio not found` → **IGNORE** (we used `--ignore-scripts`)
- ✅ As long as packages install, you're good!

---

## ⚙️ Step 4: Configure Rig Client

### 4.1: Create config.json

Create `C:\aicentre-f1-hybrid\rig-client\config.json`:

**For Rig 1:**
```json
{
  "rigId": "rig-1",
  "serverUrl": "http://10.104.88.20:3000",
  "herokuAppUrl": "https://aicentre-f1-26277ba32ef3.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

**For Rig 2:**
```json
{
  "rigId": "rig-2",
  "serverUrl": "http://10.104.88.20:3000",
  "herokuAppUrl": "https://aicentre-f1-26277ba32ef3.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

**IMPORTANT:** Only difference is `"rigId"` - change it to `"rig-2"` for second rig!

### 4.2: Verify Files Exist

```cmd
cd C:\aicentre-f1-hybrid\rig-client

# Check dist folder has compiled JavaScript
dir dist
# Should show: index.js, browser-controller.js, etc.

# Check config exists
type config.json
# Should show your config

# Check node_modules
dir node_modules
# Should show folders like: socket.io-client, winston, etc.
```

---

## 🎮 Step 5: Configure F1 25 Game

**In F1 25 Game:**

1. Launch F1 25
2. Go to: **Settings** → **Game Options** → **Telemetry Settings**
3. Configure:
   ```
   UDP Telemetry:          ON
   UDP IP Address:         10.104.88.20
   UDP Port:               20777
   UDP Send Rate:          60Hz
   UDP Format:             2025 (or latest)
   ```
4. **Save settings**
5. Exit to main menu (don't quit game)

---

## 🚀 Step 6: Start Rig Client

**In Command Prompt:**

```cmd
cd C:\aicentre-f1-hybrid\rig-client

# Start the rig client
npm start
```

**Expected behavior:**

1. **Console output:**
   ```
   [info] Rig Client starting...
   [info] Rig ID: rig-1 (or rig-2)
   [info] Server URL: http://10.104.88.20:3000
   [info] Connecting to server...
   [info] Connected to server
   [info] Launching browser...
   [info] Browser launched successfully
   [info] Showing attract screen
   ```

2. **Chrome opens fullscreen** showing:
   - Attract screen
   - QR code (real, not fake)
   - Track information
   - "Scan to Race" instructions

3. **On Mac dashboard** (`http://10.104.88.20:3000`):
   - Rig 1 (or Rig 2) dot turns **GREEN** ✅
   - Shows "Connected" status

---

## ✅ Step 7: Verify Connection

**Check 1: Rig Client Console**
- Should show: `[info] Connected to server`
- No errors

**Check 2: Mac Dashboard**
- Open: `http://10.104.88.20:3000`
- Rig indicator: **GREEN dot** ✅
- System State: **ATTRACT**

**Check 3: Rig Screen**
- Chrome in fullscreen
- Attract screen displaying
- QR code visible (scan it to test!)

**Check 4: QR Code Test**
- Scan QR code with phone
- Opens: `https://aicentre-f1-26277ba32ef3.herokuapp.com/register?rig=1`
- Shows registration form

---

## 🐛 Troubleshooting

### Error: "Cannot connect to server"

**Check server is running on Mac:**
```bash
# On Mac
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server
npm start
```

**Test network connectivity from Windows:**
```cmd
ping 10.104.88.20
# Should get replies

curl http://10.104.88.20:3000/api/health
# Should return: {"status":"ok",...}
```

**Check firewall:**
- Mac firewall may be blocking
- Windows firewall may be blocking
- Corporate network may block connections

---

### Error: "Browser failed to launch"

**Check Chrome is installed:**
```cmd
# Chrome should be at:
"C:\Program Files\Google\Chrome\Application\chrome.exe"

# If not installed:
# Download: https://www.google.com/chrome/
```

**Check Puppeteer dependencies:**
```cmd
cd C:\aicentre-f1-hybrid\rig-client
npm list puppeteer
# Should show: puppeteer@21.11.0
```

---

### Error: "node-window-manager" missing

This happens if `--ignore-scripts` didn't work. **Solution:**

**Option 1: Install Visual Studio Build Tools (30 min)**
1. Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Install: **"Desktop development with C++"** workload
3. Retry: `npm install`

**Option 2: Skip window management (testing only)**
Comment out window manager code temporarily (not recommended for production).

---

### Browser Opens But Shows Error

**Check Heroku app URL:**
```cmd
type config.json
# Verify: "herokuAppUrl": "https://aicentre-f1-26277ba32ef3.herokuapp.com"
```

**Test Heroku app:**
```cmd
curl https://aicentre-f1-26277ba32ef3.herokuapp.com/register?rig=1
# Should return HTML
```

---

### Dashboard Shows Red Dot

**Rig not connecting to server:**

1. **Check config.json:**
   ```cmd
   type config.json
   # Verify: "serverUrl": "http://10.104.88.20:3000"
   ```

2. **Check rig client console:**
   - Look for connection errors
   - Check logs: `C:\aicentre-f1-hybrid\rig-client\logs\rig-client.log`

3. **Restart rig client:**
   ```cmd
   # Press Ctrl+C to stop
   # Then restart: npm start
   ```

---

## 🔄 Repeat for Second Rig

Once Rig 1 works:

1. **Copy entire `C:\aicentre-f1-hybrid` folder** to Rig 2
2. **Edit `config.json`** on Rig 2:
   - Change: `"rigId": "rig-2"`
   - Keep everything else the same
3. **Configure F1 game** on Rig 2 (same settings)
4. **Start rig client** on Rig 2
5. **Verify** both rigs show **GREEN** on dashboard

---

## 📊 Testing Checklist

### Basic Connection
- [ ] Rig client starts without errors
- [ ] Chrome opens in fullscreen
- [ ] Attract screen displays
- [ ] QR code is real (not fake SVG)
- [ ] Mac dashboard shows GREEN dot

### Registration Flow
- [ ] Scan QR code with phone
- [ ] Registration page loads
- [ ] Enter name → Submit works
- [ ] Rig screen updates to "Ready"
- [ ] Mac dashboard shows player name

### Race Flow (requires F1 game running)
- [ ] Start race: `curl -X POST http://10.104.88.20:3000/api/start-race`
- [ ] Rig switches to F1 game window
- [ ] Drive in game
- [ ] Mac dashboard shows live telemetry
- [ ] End race: `curl -X POST http://10.104.88.20:3000/api/end-race`
- [ ] Rig switches back to results screen

---

## 🎯 Next Steps After Setup

### 1. Test Telemetry

**On Mac dashboard:**
```bash
curl -X POST http://10.104.88.20:3000/api/start-race
```

**On Rig:**
1. Start driving in F1 25 (Time Trial)
2. Complete at least 1 lap

**On Mac dashboard:**
- Should see live speed, position, lap times
- Should see rig name and telemetry updating

### 2. Install as Windows Service (Optional)

For production use, install as a Windows service so it starts automatically:

```cmd
cd C:\aicentre-f1-hybrid\rig-client

# Run as Administrator
npm run install-service
```

**Note:** This requires `node-window-manager` to build successfully, which needs Visual Studio Build Tools.

---

## 📋 Summary Commands

**On Windows Rig:**

```cmd
# Navigate to rig client
cd C:\aicentre-f1-hybrid\rig-client

# Start rig client
npm start

# Stop rig client
# Press Ctrl+C

# Check logs
type logs\rig-client.log

# Restart if needed
npm start
```

**On Mac Server:**

```bash
# Start server
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server
npm start

# Test API
curl http://10.104.88.20:3000/api/health

# Start race
curl -X POST http://10.104.88.20:3000/api/start-race

# End race
curl -X POST http://10.104.88.20:3000/api/end-race

# Reset
curl -X POST http://10.104.88.20:3000/api/reset
```

---

## 🎊 Success!

When everything works, you should see:

**Mac Dashboard:** Both rigs **GREEN** ✅
**Rig Screens:** Attract screens with real QR codes
**Phone:** Can scan and register
**F1 Game:** Telemetry flows to dashboard

---

## 📞 Support

**Issues with:**
- **npm install** → Use `--ignore-scripts` flag
- **Connection** → Check firewall and network
- **Browser** → Check Chrome is installed
- **Telemetry** → Check F1 game UDP settings

**Files:**
- Config: `C:\aicentre-f1-hybrid\rig-client\config.json`
- Logs: `C:\aicentre-f1-hybrid\rig-client\logs\rig-client.log`
- Code: `C:\aicentre-f1-hybrid\rig-client\dist\*.js`
