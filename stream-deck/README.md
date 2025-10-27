# Stream Deck Configuration for F1 Racing Simulator

This document explains how to configure your Elgato Stream Deck to control the F1 Racing Simulator system.

## Overview

The Stream Deck provides three main control buttons:
1. **Start Race** - Begins the race and switches rigs to F1 game
2. **End Race** - Ends the race and shows results
3. **Reset** - Returns system to attract screen state

## Prerequisites

- Elgato Stream Deck hardware
- Stream Deck software installed on the control PC
- PC 3 server running and accessible on your network

## Button Configuration

### Button 1: Start Race

**Button Setup:**
- **Title:** START RACE
- **Icon:** Green flag or play icon (suggested)
- **Action Type:** System > Website

**URL to trigger:**
```
http://localhost:3000/api/start-race
```

**Alternative: Using cURL (Advanced)**
- **Action Type:** System > Open
- **App/File:** Command Prompt or Terminal
- **Command:**
```bash
curl -X POST http://localhost:3000/api/start-race
```

**What it does:**
- Initializes race session
- Validates that at least one player is registered
- Broadcasts START_RACE command to all connected rigs
- Rigs switch from browser to F1 game window
- Dashboard updates to show "RACING" state
- Starts telemetry collection

### Button 2: End Race

**Button Setup:**
- **Title:** END RACE
- **Icon:** Checkered flag icon (suggested)
- **Action Type:** System > Website

**URL to trigger:**
```
http://localhost:3000/api/end-race
```

**Alternative: Using cURL (Advanced)**
```bash
curl -X POST http://localhost:3000/api/end-race
```

**What it does:**
- Finalizes race data (positions, lap times, fastest lap)
- Calculates winner
- Broadcasts END_RACE command to all rigs
- Rigs switch from F1 game to results browser screen
- Dashboard updates to show "RESULTS" state
- Saves race to history

### Button 3: Reset System

**Button Setup:**
- **Title:** RESET
- **Icon:** Refresh/restart icon (suggested)
- **Action Type:** System > Website

**URL to trigger:**
```
http://localhost:3000/api/reset
```

**Alternative: Using cURL (Advanced)**
```bash
curl -X POST http://localhost:3000/api/reset
```

**What it does:**
- Clears all player registrations
- Resets system state to "ATTRACT"
- Broadcasts RESET command to all rigs
- Rigs switch to attract screen with QR codes
- Dashboard clears current race data
- Ready for new players to register

## Setup Instructions

### Method 1: Using Website Action (Recommended)

1. Open Stream Deck software
2. Drag a "Website" action onto your Stream Deck button
3. Configure as follows:
   - **URL:** `http://localhost:3000/api/start-race` (or end-race, or reset)
   - **Access Website:** Checked
4. Add custom icon (optional)
5. Add button title
6. Repeat for other buttons

### Method 2: Using System Command with cURL

1. Open Stream Deck software
2. Drag a "System > Open" action onto your button
3. Configure as follows:
   - **App/File:** Browse to `cmd.exe` (Windows) or `Terminal.app` (Mac)
   - **Arguments:** `/c curl -X POST http://localhost:3000/api/start-race`
4. Add custom icon and title
5. Repeat for other buttons

### Method 3: Using Multi-Action (Advanced)

For more complex workflows, you can use Multi-Action to:
1. Show a confirmation message
2. Trigger the API call
3. Display success/error feedback

## Custom Icon Suggestions

### Start Race Button
- Green flag
- Play button icon
- Racing helmet
- Green light
- Color: Green (#4CAF50)

### End Race Button
- Checkered flag
- Stop icon
- Finish line
- Trophy
- Color: Red (#E94560)

### Reset Button
- Circular arrows (refresh)
- Home icon
- Reset symbol
- Restart icon
- Color: Blue (#0F3460)

## Testing Your Setup

1. Ensure PC 3 server is running:
   ```bash
   cd server
   npm run start
   ```

2. Test each button by pressing it and checking:
   - Server logs for API calls
   - Dashboard for state changes
   - Rig clients for correct behavior

3. Verify the status endpoint:
   ```
   http://localhost:3000/api/status
   ```

## Troubleshooting

### Button doesn't work
- Verify PC 3 server is running
- Check the URL in Stream Deck matches your server address
- Check firewall settings

### Wrong state transitions
- Use the Reset button to return to a known state
- Check server logs for errors
- Verify rig clients are connected (check dashboard)

### Connection issues
- Ensure all devices are on the same network
- Verify IP addresses in configuration files
- Check that port 3000 is not blocked

## API Response Examples

### Start Race - Success
```json
{
  "success": true,
  "state": "RACING",
  "race": {
    "sessionId": "1234567890",
    "players": [
      {"rigId": "rig-1", "name": "John Doe"}
    ]
  }
}
```

### Start Race - Error (No players)
```json
{
  "error": "No players registered",
  "message": "At least one player must register before starting a race"
}
```

### End Race - Success
```json
{
  "success": true,
  "state": "RESULTS",
  "race": {
    "winner": "John Doe",
    "players": [...]
  }
}
```

### Reset - Success
```json
{
  "success": true,
  "state": "ATTRACT"
}
```

## Advanced: Custom Profiles

You can create different Stream Deck profiles for different scenarios:

1. **Race Control** - Main buttons (Start, End, Reset)
2. **Diagnostics** - Status checks, rig connections, health endpoints
3. **Emergency** - Force reset, emergency stop, reconnect rigs

## Network Configuration

If PC 3 is not on `localhost`, update the URLs:

```
http://[PC3-IP-ADDRESS]:3000/api/start-race
http://[PC3-IP-ADDRESS]:3000/api/end-race
http://[PC3-IP-ADDRESS]:3000/api/reset
```

Example:
```
http://192.168.1.100:3000/api/start-race
```

## Support

For issues or questions:
1. Check server logs: `server/logs/combined.log`
2. Check rig client logs: `rig-client/logs/rig-client.log`
3. Review dashboard connection status
4. Verify all configuration files are correct

## Additional API Endpoints

While not typically used on Stream Deck, these endpoints are available:

- `GET /api/status` - Get current system status
- `GET /api/health` - Health check
- `GET /api/race-results` - Get latest race results
- `GET /api/race-history` - Get all race history
- `POST /api/salesforce-webhook` - Salesforce integration endpoint

## Best Practices

1. **Always verify rig connections** before starting a race (check dashboard)
2. **Wait for players to register** before pressing Start Race
3. **Allow race to fully load** before ending (watch dashboard telemetry)
4. **Use Reset between sessions** to clear state
5. **Keep Stream Deck software updated** for best performance
