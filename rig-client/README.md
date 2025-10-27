# Rig Client Component (PC 1 & PC 2)

Background service that runs on each simulator rig (PC 1 and PC 2). Handles window management, browser control in kiosk mode, and communication with the central server on PC 3.

## Features

- **WebSocket client** connecting to PC 3 server
- **Window management** to switch between F1 game and browser
- **Browser controller** with Puppeteer for kiosk mode
- **Automatic reconnection** if server connection drops
- **Configurable** via JSON config file and environment variables
- **Windows service** support for auto-start on boot
- **Heartbeat** to maintain server connection

## Installation

```bash
cd rig-client
npm install
```

## Configuration

### Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Rig Configuration
RIG_ID=rig-1                              # IMPORTANT: "rig-1" for PC 1, "rig-2" for PC 2
SERVER_URL=http://192.168.1.100:3000      # PC 3 server IP address
HEROKU_APP_URL=https://my-racing-app.herokuapp.com

# F1 Game Window Title (partial match)
F1_GAME_WINDOW=F1

# Connection Settings (milliseconds)
RECONNECT_INTERVAL=5000
HEARTBEAT_INTERVAL=30000

# Logging
LOG_LEVEL=info
```

### Configuration File

Copy the example:

```bash
cp config.json.example config.json
```

Edit `config.json`:

```json
{
  "rigId": "rig-1",                              // "rig-1" or "rig-2"
  "serverUrl": "http://192.168.1.100:3000",     // PC 3 IP
  "herokuAppUrl": "https://my-racing-app.herokuapp.com",
  "f1GameWindowTitle": "F1",                     // Window title to match
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

**CRITICAL:** Each rig MUST have a unique `rigId`:
- PC 1: `rigId: "rig-1"`
- PC 2: `rigId: "rig-2"`

## Development

Run in development mode:

```bash
npm run dev
```

This will:
1. Launch browser in kiosk mode
2. Navigate to attract screen
3. Connect to PC 3 server
4. Listen for commands

## Production

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

## Windows Service Installation

To run the rig client as a Windows service (recommended for production):

### Install Service

1. Build the application:
```bash
npm run build
```

2. Run installer with administrator privileges:
```bash
npm run install-service
```

This creates a Windows service named "F1 Rig Client - rig-1" (or rig-2).

The service will:
- Start automatically on system boot
- Restart automatically if it crashes
- Run in the background

### Manage Service

**View service status:**
```bash
sc query "F1 Rig Client - rig-1"
```

**Start service:**
```bash
sc start "F1 Rig Client - rig-1"
```

**Stop service:**
```bash
sc stop "F1 Rig Client - rig-1"
```

**Uninstall service:**
```bash
npm run uninstall-service
```

### Alternative: PM2 (Cross-platform)

PM2 works on Windows, macOS, and Linux:

```bash
# Install PM2 globally
npm install -g pm2

# Start rig client
pm2 start dist/index.js --name "rig-client-1"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the instructions shown

# View logs
pm2 logs rig-client-1

# Restart
pm2 restart rig-client-1

# Stop
pm2 stop rig-client-1

# Remove
pm2 delete rig-client-1
```

## How It Works

### Startup Sequence

1. Load configuration from `config.json` and `.env`
2. Launch Chrome browser in kiosk mode
3. Navigate to attract screen URL
4. Connect to PC 3 server via WebSocket
5. Register rig with server
6. Start heartbeat to maintain connection
7. Listen for commands

### Command Handling

**START_RACE:**
1. Receive command from server
2. Focus F1 25 game window
3. Game becomes active screen

**END_RACE:**
1. Receive command with race results
2. Navigate browser to results page
3. Focus browser window
4. Results displayed in kiosk mode

**RESET:**
1. Receive command from server
2. Clear local player data
3. Navigate browser to attract screen
4. Focus browser window

**PLAYER_REGISTERED:**
1. Receive player registration for this rig
2. Navigate browser to ready screen
3. Focus browser window
4. Display player name and "Ready to Race"

### State Management

The rig client maintains minimal state:
- Current browser page (attract, ready, results)
- Player name (if registered)
- Connection status to server

All state decisions are made by the PC 3 server.

## Window Management

### How It Works

The rig client uses `node-window-manager` to:
- Enumerate all open windows
- Find windows by title (partial match)
- Bring windows to foreground
- Restore minimized windows

### F1 Game Window Detection

The client searches for windows containing the title specified in `F1_GAME_WINDOW` config.

Default: `"F1"` matches:
- "F1 25"
- "F1 2025"
- "EA SPORTS F1 25"

If your game window has a different title, update the config.

### Troubleshooting Window Switching

**Game window not found:**
1. Run the game first
2. Check the actual window title (Alt+Tab)
3. Update `F1_GAME_WINDOW` in config
4. Restart rig client

**Browser window not found:**
1. Ensure browser launched successfully
2. Check rig client logs
3. May need to manually focus once

**Window switching fails:**
1. Run rig client with elevated privileges
2. Check Windows permissions
3. Verify no other window managers are interfering

## Browser Controller

### Kiosk Mode

The rig client launches Chrome in kiosk mode with these flags:
- `--kiosk` - Fullscreen without UI
- `--start-fullscreen` - Alternative fullscreen
- `--no-first-run` - Skip first-run dialogs
- `--no-default-browser-check` - Skip default browser check
- `--disable-infobars` - Hide information bars
- `--disable-session-crashed-bubble` - Skip crash messages
- `--disable-restore-session-state` - Don't restore previous session

### Navigation

The browser automatically navigates to different URLs based on system state:

**ATTRACT:**
```
https://my-racing-app.herokuapp.com/attract?rig=1
```

**READY:**
```
https://my-racing-app.herokuapp.com/ready?rig=1&name=John%20Doe
```

**RESULTS:**
```
https://my-racing-app.herokuapp.com/results
```

### Browser State

The browser controller tracks:
- Browser instance (Puppeteer)
- Current page
- Current state (ATTRACT, READY, RESULTS)

Methods:
- `launch()` - Start browser
- `showAttractScreen()` - Navigate to attract
- `showReadyScreen(name)` - Navigate to ready
- `showResultsScreen()` - Navigate to results
- `close()` - Close browser
- `reload()` - Reload current page

## Logging

Logs are written to `logs/rig-client.log`.

Log levels:
- `error` - Critical errors
- `warn` - Warnings
- `info` - General information (default)
- `debug` - Detailed debugging

Set log level in `.env`:
```env
LOG_LEVEL=debug
```

View logs in real-time:
```bash
tail -f logs/rig-client.log
```

## Connection Management

### Automatic Reconnection

If connection to PC 3 server is lost, the client will:
1. Log the disconnection
2. Attempt to reconnect every 5 seconds (configurable)
3. Continue indefinitely until reconnected
4. Re-register with server upon reconnection

### Heartbeat

Every 30 seconds (configurable), the client sends a heartbeat to the server:

```javascript
{
  rigId: "rig-1",
  timestamp: 1234567890
}
```

This keeps the connection alive and allows the server to detect dead connections.

## Network Requirements

- **Outbound TCP** to PC 3 server (default: port 3000)
- **Internet access** to reach Heroku app (for browser pages)

Firewall configuration:
- Allow outbound connections to PC 3 IP
- Allow outbound HTTPS (443) for Heroku app

## System Requirements

- **OS:** Windows 10/11 (recommended), macOS, or Linux
- **Node.js:** 18.0.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Browser:** Chrome (installed by Puppeteer)
- **Game:** F1 25 installed and configured

## Troubleshooting

### Rig client won't start

1. Check Node.js version: `node --version`
2. Reinstall dependencies: `npm install`
3. Check configuration files
4. Review logs for errors

### Can't connect to server

1. Verify PC 3 server is running
2. Check `SERVER_URL` in config
3. Test connectivity: `ping 192.168.1.100`
4. Check firewall settings
5. Review network configuration

### Browser not launching

1. Check Puppeteer installation: `npm install puppeteer`
2. Verify Chrome installation
3. Check browser controller logs
4. Try manual launch: `npm run dev`

### Window switching not working

1. Ensure F1 game is running
2. Check `F1_GAME_WINDOW` configuration
3. List all windows: Check logs with `LOG_LEVEL=debug`
4. Run with administrator privileges
5. Check window manager permissions

### Browser shows wrong page

1. Check `HEROKU_APP_URL` configuration
2. Verify Heroku app is deployed
3. Test URLs manually in browser
4. Check browser controller logs

### Service won't install

1. Run Command Prompt as Administrator
2. Check npm permissions
3. Verify node-windows installation
4. Review installation logs

### Connection keeps dropping

1. Check network stability
2. Increase `HEARTBEAT_INTERVAL`
3. Check for network interference
4. Review server logs for clues

## Configuration Examples

### PC 1 (Rig 1)

**config.json:**
```json
{
  "rigId": "rig-1",
  "serverUrl": "http://192.168.1.100:3000",
  "herokuAppUrl": "https://my-racing-app.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

### PC 2 (Rig 2)

**config.json:**
```json
{
  "rigId": "rig-2",
  "serverUrl": "http://192.168.1.100:3000",
  "herokuAppUrl": "https://my-racing-app.herokuapp.com",
  "f1GameWindowTitle": "F1",
  "reconnectInterval": 5000,
  "heartbeatInterval": 30000
}
```

**Note:** Only `rigId` differs between rigs.

## Development Tips

- Test window switching manually before automating
- Use `LOG_LEVEL=debug` for detailed logs
- Test browser navigation with various URLs
- Monitor logs in real-time during development
- Use `npm run dev` for quick testing

## Production Checklist

- [ ] Configuration files created and validated
- [ ] Correct `rigId` set (rig-1 or rig-2)
- [ ] PC 3 server IP address configured
- [ ] F1 game window title verified
- [ ] Application built: `npm run build`
- [ ] Windows service installed (or PM2 configured)
- [ ] Service starts automatically on boot
- [ ] Logs directory created and writable
- [ ] Browser launches in kiosk mode successfully
- [ ] Window switching tested
- [ ] Connection to PC 3 server verified
- [ ] All URLs accessible from rig PC

## License

MIT
