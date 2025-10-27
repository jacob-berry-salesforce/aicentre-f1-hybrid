# Heroku Web Application

React + Express web application that provides the public-facing interface for player registration and race results. Deployed to Heroku for internet accessibility.

## Features

- **Attract Screen** - Full-screen display with QR code for registration
- **Registration Page** - Mobile-friendly player registration form
- **Ready Screen** - Waiting screen after registration
- **Results Screen** - Race results with winner celebration
- **WebSocket Integration** - Real-time updates from PC 3 server
- **Responsive Design** - Works on mobile phones and fullscreen displays

## Installation

```bash
cd heroku-app
npm install
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PC 3 Server URL (local network IP or public URL)
PC3_SERVER_URL=http://192.168.1.100:3000

# Application URL (Heroku URL after deployment)
APP_URL=https://my-racing-app.herokuapp.com
```

**Important:** `PC3_SERVER_URL` must be accessible from Heroku. For local testing, use ngrok or similar to expose PC 3.

## Development

Run both server and client in development mode:

```bash
npm run dev
```

This starts:
- Express server on port 5000
- Vite dev server on port 3001 (with proxy to :5000)

Access the app at: `http://localhost:3001`

### Run Server Only

```bash
npm run dev:server
```

### Run Client Only

```bash
npm run dev:client
```

## Production Build

Build both server and client:

```bash
npm run build
```

This:
1. Builds React frontend with Vite (output: `client/dist/`)
2. Builds Express server with TypeScript (output: `server/dist/`)

## Deployment to Heroku

### Initial Setup

1. Create Heroku app:
```bash
heroku create my-racing-app
```

2. Set environment variables:
```bash
heroku config:set PC3_SERVER_URL=http://YOUR-PC3-PUBLIC-IP:3000
heroku config:set NODE_ENV=production
heroku config:set APP_URL=https://my-racing-app.herokuapp.com
```

3. Deploy:
```bash
git push heroku main
```

Alternatively, use the npm script:
```bash
npm run deploy
```

### Heroku Configuration

The app includes:
- `Procfile` - Tells Heroku how to start the app
- `package.json` - Includes `heroku-postbuild` script for automatic builds

### Automatic Builds

Heroku will automatically run `npm run build` after installing dependencies.

### Viewing Logs

```bash
heroku logs --tail
```

### Scaling

```bash
heroku ps:scale web=1
```

## Application Structure

```
heroku-app/
├── client/                # React frontend
│   ├── src/
│   │   ├── main.tsx      # React entry point
│   │   ├── App.tsx       # Main app with routing
│   │   ├── index.css     # Global styles
│   │   └── pages/        # Page components
│   │       ├── AttractScreen.tsx
│   │       ├── AttractScreen.css
│   │       ├── RegisterScreen.tsx
│   │       ├── RegisterScreen.css
│   │       ├── ReadyScreen.tsx
│   │       ├── ReadyScreen.css
│   │       ├── ResultsScreen.tsx
│   │       └── ResultsScreen.css
│   ├── index.html
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/               # Express backend
│   ├── src/
│   │   └── index.ts     # Express server
│   └── tsconfig.json
├── package.json
├── Procfile
└── .env.example
```

## Pages

### 1. Attract Screen (`/attract?rig=X`)

**Purpose:** Displays on rig screens in kiosk mode when waiting for players.

**Features:**
- Large animated title
- QR code linking to registration page
- "Scan to Race" call-to-action
- Animated background effects
- Rig number display

**Query Parameters:**
- `rig` (required) - Rig number (1 or 2)

**Example URL:**
```
https://my-racing-app.herokuapp.com/attract?rig=1
```

### 2. Registration Screen (`/register?rig=X`)

**Purpose:** Mobile-friendly registration form for players.

**Features:**
- Simple name input form
- "Let's Race!" submit button
- Rig number display
- Form validation
- Error handling
- Loading state during submission

**Query Parameters:**
- `rig` (required) - Rig number (1 or 2)

**Example URL:**
```
https://my-racing-app.herokuapp.com/register?rig=1
```

**Flow:**
1. User scans QR code on rig screen
2. Opens registration page on mobile
3. Enters name
4. Submits form
5. Redirects to ready screen
6. Rig screen updates to show ready state

### 3. Ready Screen (`/ready?rig=X&name=Y`)

**Purpose:** Displays on both mobile and rig screen after registration.

**Features:**
- Success checkmark animation
- Player name display
- Rig number
- "Waiting for race to start" message
- Animated loading dots
- WebSocket connection for race start

**Query Parameters:**
- `rig` (required) - Rig number (1 or 2)
- `name` (required) - Player name

**Example URL:**
```
https://my-racing-app.herokuapp.com/ready?rig=1&name=John%20Doe
```

### 4. Results Screen (`/results`)

**Purpose:** Displays race results after race completion.

**Features:**
- Winner celebration banner with trophy
- Sorted leaderboard by position
- Player statistics (fastest lap, total time, laps)
- Animated entry of results
- Gold highlighting for winner
- Auto-refresh when new results available

**Example URL:**
```
https://my-racing-app.herokuapp.com/results
```

## API Endpoints

### POST /api/register

Register a player for a specific rig.

**Request:**
```json
{
  "rig": "1",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "rig": "rig-1",
    "name": "John Doe"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to register player",
  "message": "Connection to PC 3 failed"
}
```

### GET /api/race-results

Get current race results from PC 3 server.

**Response:**
```json
{
  "sessionId": "1234567890",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "players": [
    {
      "rigId": "rig-1",
      "name": "John Doe",
      "finalPosition": 1,
      "fastestLap": 95432,
      "totalTime": 285123,
      "lapTimes": [95432, 94876, 94815]
    }
  ],
  "winner": "John Doe",
  "raceCompleted": true
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "pc3Connected": true
}
```

## WebSocket Events

### Client → Server

**request:race_results**

Request latest race results.

### Server → Client

**state:change**

System state has changed.

**race:completed**

Race has finished with final results.

**race:results**

Race results data in response to request.

**player:registered**

A player was successfully registered.

**error**

Error occurred during operation.

## Styling

### Design System

**Colors:**
- Primary: `#e94560` (Red)
- Secondary: `#0f3460` (Dark Blue)
- Background: `#1a1a2e` (Very Dark Blue)
- Success: `#4caf50` (Green)
- Gold: `#ffd700` (Winner highlight)

**Typography:**
- Font Family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Headings: Bold, uppercase, letter-spaced
- Body: Regular weight

**Animations:**
- Slide in
- Pulse
- Bounce
- Fade
- Trophy bounce
- Winner glow

### Responsive Design

All pages are responsive with breakpoints at 768px for mobile devices.

**Mobile Optimizations:**
- Smaller font sizes
- Adjusted spacing
- Stacked layouts
- Touch-friendly buttons

## PC 3 Server Integration

### Connection Flow

1. Heroku app connects to PC 3 server via WebSocket
2. Maintains persistent connection
3. Auto-reconnects on disconnect
4. Forwards events to connected clients

### Challenges

**Local Network Access:**
PC 3 server runs on local network, not accessible from internet.

**Solutions:**
1. **ngrok** - Temporary public URL for testing
2. **Port Forwarding** - Configure router to expose PC 3
3. **VPN** - Connect Heroku to local network
4. **Cloudflare Tunnel** - Secure tunnel to local network

### Using ngrok (Development/Testing)

1. Install ngrok: https://ngrok.com/download

2. Start PC 3 server:
```bash
cd server
npm start
```

3. Create tunnel:
```bash
ngrok http 3000
```

4. Copy the forwarding URL (e.g., `https://abc123.ngrok.io`)

5. Update Heroku config:
```bash
heroku config:set PC3_SERVER_URL=https://abc123.ngrok.io
```

6. Restart Heroku app:
```bash
heroku restart
```

## Environment Variables

### Development

```env
PORT=5000
NODE_ENV=development
PC3_SERVER_URL=http://localhost:3000
APP_URL=http://localhost:3001
```

### Production (Heroku)

```env
PORT=5000
NODE_ENV=production
PC3_SERVER_URL=https://your-pc3-public-url.com
APP_URL=https://my-racing-app.herokuapp.com
```

Set via Heroku CLI:
```bash
heroku config:set VARIABLE=value
```

View all variables:
```bash
heroku config
```

## Testing

### Local Testing

1. Start PC 3 server:
```bash
cd server
npm run dev
```

2. Start Heroku app:
```bash
cd heroku-app
npm run dev
```

3. Open browser:
- Attract: `http://localhost:3001/attract?rig=1`
- Register: `http://localhost:3001/register?rig=1`
- Ready: `http://localhost:3001/ready?rig=1&name=Test`
- Results: `http://localhost:3001/results`

### Production Testing

After deploying to Heroku:

1. Test attract screen:
```
https://my-racing-app.herokuapp.com/attract?rig=1
```

2. Test registration:
```
https://my-racing-app.herokuapp.com/register?rig=1
```

3. Test results:
```
https://my-racing-app.herokuapp.com/results
```

## Troubleshooting

### Can't connect to PC 3

1. Verify `PC3_SERVER_URL` is correct
2. Check PC 3 server is running
3. Verify firewall allows connections
4. Test URL in browser
5. Check Heroku logs: `heroku logs --tail`

### Registration fails

1. Check PC 3 server is running
2. Verify network connectivity
3. Check browser console for errors
4. Review Heroku logs
5. Test API manually with curl

### QR code doesn't work

1. Verify Heroku app URL is correct
2. Check QR code content in browser inspector
3. Test URL manually on phone
4. Ensure phone has internet access

### Pages not displaying correctly

1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Verify build completed successfully
5. Check for CSS loading errors

### WebSocket connection fails

1. Check PC 3 server WebSocket endpoint
2. Verify CORS settings
3. Check browser console for WebSocket errors
4. Test WebSocket connection with tool like wscat
5. Review Heroku logs

## Performance

- React app is built with Vite for fast loading
- Static assets are cached
- WebSocket used for real-time updates
- Minimal dependencies for fast deploys

## Security

- All user inputs are sanitized
- CORS configured appropriately
- No sensitive data stored
- HTTPS enforced on Heroku
- Rate limiting recommended for production

## Future Enhancements

- Player photo upload
- Race replays
- Leaderboard history
- Social media sharing
- Email results to players
- Analytics and statistics

## License

MIT
