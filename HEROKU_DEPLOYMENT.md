# Heroku Deployment Guide

Complete guide to deploying the F1 Hybrid mobile registration app to Heroku.

## Prerequisites

- Heroku account (free tier works): https://signup.heroku.com/
- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli
- ngrok account (for PC 3 tunneling): https://ngrok.com/
- Git repository pushed to GitHub

## Step 1: Install Heroku CLI

### macOS
```bash
brew install heroku/brew/heroku
```

### Windows
Download installer: https://devcenter.heroku.com/articles/heroku-cli#download-and-install

### Verify Installation
```bash
heroku --version
# Should show: heroku/8.x.x
```

## Step 2: Login to Heroku

```bash
heroku login
# Press any key to open browser and login
```

This will open your browser to authenticate.

## Step 3: Create Heroku App

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid

# Create a new Heroku app (choose a unique name)
heroku create aicentre-f1-racing

# Or let Heroku auto-generate a name:
# heroku create
```

**Note your app URL!** It will be something like: `https://aicentre-f1-racing.herokuapp.com`

Verify the Heroku remote was added:
```bash
git remote -v
# Should show:
# heroku  https://git.heroku.com/aicentre-f1-racing.git (fetch)
# heroku  https://git.heroku.com/aicentre-f1-racing.git (push)
```

## Step 4: Setup ngrok for PC 3 Access

Heroku needs to reach your MacBook server to send registration data. Since your Mac is on a local network, we need a public URL.

### 4.1: Install ngrok

**macOS:**
```bash
brew install ngrok
```

**Or download:** https://ngrok.com/download

### 4.2: Create ngrok Account

1. Sign up at: https://dashboard.ngrok.com/signup
2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### 4.3: Authenticate ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### 4.4: Start PC 3 Server (if not already running)

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server
npm start
```

Keep this terminal open.

### 4.5: Create ngrok Tunnel

Open a NEW terminal:

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy this URL!** (e.g., `https://abc123def456.ngrok.io`)

**IMPORTANT:** Keep this terminal open! If you close it, the tunnel stops.

## Step 5: Configure Heroku Environment Variables

Set the environment variables for your Heroku app:

```bash
# Set your ngrok URL (from Step 4.5)
heroku config:set PC3_SERVER_URL=https://abc123def456.ngrok.io

# Set your Heroku app URL (from Step 3)
heroku config:set APP_URL=https://aicentre-f1-racing.herokuapp.com

# Set Node environment
heroku config:set NODE_ENV=production
```

Verify configuration:
```bash
heroku config
# Should show all three variables
```

## Step 6: Configure Local Server .env

Update your MacBook server to use the Heroku URL:

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server

# Edit .env file
cat > .env << EOF
PORT=3000
UDP_PORT=20777
LOG_LEVEL=info
CORS_ORIGIN=*
HEROKU_APP_URL=https://aicentre-f1-racing.herokuapp.com
EOF
```

**IMPORTANT:** Replace `aicentre-f1-racing.herokuapp.com` with YOUR actual Heroku app URL!

Restart your server:
```bash
npm start
```

## Step 7: Deploy to Heroku

### 7.1: Commit Your Changes

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid

# Stage all changes
git add .

# Commit
git commit -m "Configure Heroku deployment with real QR codes"

# Push to GitHub (optional but recommended)
git push origin main
```

### 7.2: Deploy to Heroku

```bash
# Deploy from heroku-app subdirectory
cd heroku-app
git subtree push --prefix heroku-app heroku main

# Or if that fails, use this approach:
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid
git push heroku `git subtree split --prefix heroku-app main`:main --force
```

**Alternative Method (if subtree fails):**

```bash
# Create a temporary branch with only heroku-app
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid
git checkout -b heroku-deploy
git filter-branch --subdirectory-filter heroku-app HEAD
git push heroku heroku-deploy:main --force
git checkout main
git branch -D heroku-deploy
```

### 7.3: Watch Deployment

```bash
heroku logs --tail
```

Look for:
```
Build succeeded!
heroku[web.1]: Starting process with command `npm start`
State changed from starting to up
```

## Step 8: Verify Deployment

### 8.1: Check App Status

```bash
heroku ps
# Should show: web.1: up
```

### 8.2: Open App in Browser

```bash
heroku open
```

Or manually visit: `https://aicentre-f1-racing.herokuapp.com`

### 8.3: Test Registration Page

Visit: `https://aicentre-f1-racing.herokuapp.com/register?rig=1`

You should see the registration form.

### 8.4: Test QR Code

1. Open your MacBook dashboard: `http://10.104.88.20:3000`
2. You should see the sim attract screens
3. The QR code should now be REAL (not the fake SVG)
4. Scan with your phone
5. Should open: `https://aicentre-f1-racing.herokuapp.com/register?rig=1`

## Step 9: Test Full Registration Flow

### 9.1: Start All Systems

**Terminal 1 - Server:**
```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid/server
npm start
```

**Terminal 2 - ngrok:**
```bash
ngrok http 3000
```

**Terminal 3 - Monitor Heroku:**
```bash
heroku logs --tail
```

### 9.2: Test Registration

1. **Scan QR code** on rig attract screen (or manually visit registration URL)
2. **Enter name:** "Test Driver"
3. **Submit form**
4. **Check results:**
   - Phone redirects to ready screen
   - Dashboard shows "Test Driver" under Rig 1
   - Server logs show registration
   - Heroku logs show POST request

## Step 10: GitHub Repository Configuration

### Is the Repo Public or Private?

**For private repos (recommended for corporate use):**
- ✅ Your repo is private (GitHub organization)
- Windows PCs need GitHub authentication to clone
- Use personal access token or SSH key

**To clone private repo on Windows:**

1. **Install Git for Windows:** https://git-scm.com/download/win

2. **Generate Personal Access Token:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token (shows once!)

3. **Clone with token:**
```cmd
git clone https://YOUR_TOKEN@github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
```

**For public repos:**
- Anyone can clone without authentication:
```cmd
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
```

### Make Repo Public (Optional)

If you want to make it public:
1. GitHub → Repository → Settings → Danger Zone
2. Change repository visibility → Make public

**Security Note:** Don't commit `.env` files with secrets!

## Step 11: Windows PC Setup Commands

Once deployed, here's what to run on each Windows PC:

### Option A: Using GitHub (Recommended)

```cmd
cd C:\
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
cd aicentre-f1-hybrid\rig-client
npm install
npm run build
```

### Option B: Using Cloud Storage

1. Download `f1-project-deploy.zip` from cloud storage
2. Extract to `C:\f1-racing-simulator\`
3. Run:
```cmd
cd C:\f1-racing-simulator\rig-client
npm install
npm run build
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       INTERNET                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Heroku App (https://aicentre-f1-racing.herokuapp.com) │
│  ┌────────────────────────────────────────────┐        │
│  │ React Frontend (Registration UI)           │        │
│  │ - /register?rig=1 → Form                   │        │
│  │ - /ready?name=X → Wait screen              │        │
│  │ - /results → Race results                  │        │
│  └────────────────────────────────────────────┘        │
│                        │                                 │
│                        │ POST /api/register             │
│                        ▼                                 │
│  ┌────────────────────────────────────────────┐        │
│  │ ngrok Tunnel (https://abc123.ngrok.io)     │        │
│  └────────────────────────────────────────────┘        │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         │ Forwards to local network
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   LOCAL NETWORK                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MacBook Server (10.104.88.20:3000)                    │
│  ┌────────────────────────────────────────────┐        │
│  │ POST /api/register → Stores player         │        │
│  │ WebSocket → Broadcasts to rigs             │        │
│  │ UDP :20777 → Receives F1 telemetry         │        │
│  └────────────────────────────────────────────┘        │
│           │                          ▲                   │
│           │ WebSocket                │ UDP telemetry    │
│           ▼                          │                   │
│  ┌──────────────┐          ┌──────────────┐           │
│  │ Rig 1 Client │          │ Rig 2 Client │           │
│  │ - Browser    │          │ - Browser    │           │
│  │ - F1 Game ───┼──────────┼─ F1 Game    │           │
│  └──────────────┘          └──────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Deployment Failed

**Check build logs:**
```bash
heroku logs --tail
```

**Common issues:**
- Missing dependencies in `package.json`
- TypeScript build errors
- Port binding issues

**Fix and redeploy:**
```bash
git add .
git commit -m "Fix build issues"
git push heroku main
```

### Can't Connect to PC 3

**Symptoms:**
- Registration form submits but fails
- Heroku logs show connection errors
- Error: "Failed to register player"

**Fixes:**

1. **Check ngrok is running:**
```bash
# Terminal should show:
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

2. **Test ngrok URL:**
```bash
curl https://abc123.ngrok.io/api/health
# Should return: {"status":"ok",...}
```

3. **Update Heroku config if ngrok URL changed:**
```bash
heroku config:set PC3_SERVER_URL=https://NEW_NGROK_URL.ngrok.io
heroku restart
```

4. **Check CORS settings** on MacBook server

### QR Code Still Fake

**Symptoms:**
- QR code is still the fake SVG pattern
- Console shows: "Using fake QR code placeholder"

**Fixes:**

1. **Check browser console** for errors
2. **Verify `/api/config` endpoint works:**
```bash
curl http://10.104.88.20:3000/api/config
# Should return: {"herokuAppUrl":"https://aicentre-f1-racing.herokuapp.com"}
```

3. **Rebuild server:**
```bash
cd server
npm run build
npm start
```

4. **Clear browser cache** (Cmd+Shift+R on Mac)

### ngrok Session Expired

**Symptoms:**
- Registration worked, now fails
- ngrok terminal shows "Session expired"

**Fix:**
```bash
# Stop ngrok (Ctrl+C)
# Restart:
ngrok http 3000

# Update Heroku with new URL:
heroku config:set PC3_SERVER_URL=https://NEW_NGROK_URL.ngrok.io
heroku restart
```

### Registration Form Doesn't Submit

**Check Heroku logs:**
```bash
heroku logs --tail
```

**Test API directly:**
```bash
curl -X POST https://aicentre-f1-racing.herokuapp.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"rig":"1","name":"Test"}'
```

## Production Tips

### Keep ngrok Running Permanently

**Option 1: Use screen (macOS/Linux)**
```bash
screen -S ngrok
ngrok http 3000
# Press: Ctrl+A, then D (to detach)
# Reconnect: screen -r ngrok
```

**Option 2: Use nohup**
```bash
nohup ngrok http 3000 &
```

**Option 3: Use PM2**
```bash
npm install -g pm2
pm2 start ngrok -- http 3000
pm2 save
pm2 startup
```

### Upgrade to ngrok Pro

Free ngrok URLs change every restart. ngrok Pro gives you a static domain.

**Benefits:**
- Static URL (no config updates needed)
- No 8-hour session limit
- Custom subdomain

**Upgrade:** https://ngrok.com/pricing

### Alternative to ngrok: Cloudflare Tunnel

Free alternative with static URLs:

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create f1-server

# Run tunnel
cloudflared tunnel --url http://localhost:3000
```

## Cost Summary

**Free Tier (Sufficient for testing):**
- ✅ GitHub: Free for public repos
- ✅ Heroku: Free tier (550 dyno hours/month)
- ✅ ngrok: Free (2-hour session limit)
- ✅ Cloudflare Tunnel: Free

**Paid Options (For production):**
- Heroku Hobby: $7/month (custom domain, SSL, always-on)
- ngrok Pro: $10/month (static URL, no limits)
- GitHub: Free for organizations

**Recommended Production Setup:**
- Heroku Hobby: $7/month
- ngrok Pro OR Cloudflare Tunnel: Free

**Total: ~$7/month for production**

## Next Steps

1. ✅ Deploy Heroku app
2. ✅ Setup ngrok tunnel
3. ✅ Test QR code generation
4. ✅ Test full registration flow
5. ⬜ Setup Windows rigs
6. ⬜ Configure F1 game UDP settings
7. ⬜ Test complete race flow
8. ⬜ Setup Stream Deck controls
9. ⬜ Install as Windows services

## Support

**Heroku Docs:** https://devcenter.heroku.com/
**ngrok Docs:** https://ngrok.com/docs
**Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

## Summary Commands

```bash
# Deploy workflow:
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid

# 1. Start server
cd server && npm start

# 2. Start ngrok (new terminal)
ngrok http 3000

# 3. Update Heroku config with ngrok URL
heroku config:set PC3_SERVER_URL=https://YOUR_NGROK_URL.ngrok.io

# 4. Deploy to Heroku
git add . && git commit -m "Update" && git push heroku main

# 5. Check logs
heroku logs --tail

# 6. Test
heroku open
```

---

**Your Specific URLs:**
- GitHub: `https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git`
- Heroku: `https://aicentre-f1-racing.herokuapp.com` (or your chosen name)
- MacBook: `http://10.104.88.20:3000`
- ngrok: `https://XXXXX.ngrok.io` (changes each restart)
