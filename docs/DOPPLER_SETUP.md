# Doppler Secrets Management Setup

Complete guide for managing secrets and configuration using Doppler for team collaboration.

## Overview

All environment variables, configuration values, and secrets for the F1 Hybrid project are stored in **Doppler** for centralized management and easy team handover.

**Doppler Project:** `aicentre-f1-hybrid`
**Dashboard:** https://dashboard.doppler.com/workplace/projects/aicentre-f1-hybrid

---

## What's Stored in Doppler

### Server Configuration (MacBook Pro Server)
- `PORT` - Server HTTP port (example: 3000)
- `UDP_PORT` - F1 telemetry port (example: 20777)
- `LOG_LEVEL` - Logging level (example: info)
- `CORS_ORIGIN` - CORS configuration (example: *)
- `HEROKU_APP_URL` - Heroku mobile app URL

### Heroku App Configuration (Production)
- `HEROKU_PORT` - Heroku internal port (example: 5000)
- `NODE_ENV` - Environment (example: production)
- `PC3_SERVER_URL` - ngrok tunnel URL to MacBook server
- `HEROKU_APP_URL` - Heroku app public URL

### Rig Client Configuration (Windows Rigs)
- `RIG_SERVER_URL` - MacBook server URL (example: http://192.168.1.100:3000)
- `F1_GAME_WINDOW_TITLE` - F1 game window title (example: F1)
- `RECONNECT_INTERVAL` - WebSocket reconnect interval ms (example: 5000)
- `HEARTBEAT_INTERVAL` - Heartbeat interval ms (example: 30000)

### Deployment Credentials
- `HEROKU_API_KEY` - Heroku API token (obtain via `heroku auth:token`)
- `HEROKU_APP_NAME` - Heroku app name
- `HEROKU_EMAIL` - Your Heroku account email

### Network Configuration
- `MAC_SERVER_IP` - MacBook local IP address (example: 192.168.1.100)
- `NGROK_URL` - ngrok tunnel URL (changes when ngrok restarts)

---

## Getting Started for New Team Members

### 1. Install Doppler CLI

**Mac/Linux:**
```bash
brew install dopplerhq/cli/doppler
```

**Windows:**
```powershell
# Using Scoop
scoop install doppler
```

Or download from: https://docs.doppler.com/docs/install-cli

### 2. Login to Doppler

```bash
doppler login
```

This will:
1. Open your browser
2. Ask you to authenticate
3. Store your auth token locally

### 3. Verify Access

```bash
# List all projects you have access to
doppler projects --json

# You should see: aicentre-f1-hybrid
```

---

## Using Doppler with the Project

### Setup Project for Development

Navigate to the project directory:

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid
```

### Option 1: Setup Doppler for Entire Project

```bash
# Link project to Doppler
doppler setup --project aicentre-f1-hybrid --config dev
```

This creates a `.doppler.yaml` file that links the directory to Doppler.

### Option 2: Setup Doppler per Component

**For Server:**
```bash
cd server
doppler setup --project aicentre-f1-hybrid --config dev
```

**For Heroku App:**
```bash
cd heroku-app
doppler setup --project aicentre-f1-hybrid --config prd
```

**For Rig Client:**
```bash
cd rig-client
doppler setup --project aicentre-f1-hybrid --config dev
```

---

## Running Services with Doppler

### Server (MacBook Pro)

Instead of using `.env` file:
```bash
cd server
doppler run -- npm start
```

This injects all environment variables from Doppler automatically.

### Development Mode

```bash
cd server
doppler run -- npm run dev
```

### View Current Config

```bash
cd server
doppler secrets
```

---

## Managing Secrets

### View All Secrets

```bash
doppler secrets --project aicentre-f1-hybrid --config dev
```

### Add/Update a Secret

```bash
doppler secrets set NEW_SECRET=value --project aicentre-f1-hybrid --config dev
```

### Delete a Secret

```bash
doppler secrets delete SECRET_NAME --project aicentre-f1-hybrid --config dev
```

### Download Secrets to .env (for backup)

```bash
doppler secrets download --no-file --format env --project aicentre-f1-hybrid --config dev > .env
```

---

## Environments

The project has three environments:

### 1. `dev` (Development)
- For local development on MacBook server
- For rig-client development
- Contains all server and rig client config

### 2. `prd` (Production)
- For Heroku app production deployment
- Contains Heroku-specific config

### 3. `stg` (Staging)
- Currently unused
- Can be used for testing before production

### Switching Environments

```bash
# Use dev config
doppler setup --config dev

# Use prd config
doppler setup --config prd
```

---

## Integrations

### GitHub Actions Integration

The GitHub Actions workflow (`.github/workflows/deploy-heroku.yml`) uses the `HEROKU_API_KEY` secret.

**To update GitHub secret from Doppler:**

1. Get the secret value:
```bash
doppler secrets get HEROKU_API_KEY --project aicentre-f1-hybrid --config dev --plain
```

2. Add to GitHub:
   - Go to: https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid/settings/secrets/actions
   - Click "New repository secret"
   - Name: `HEROKU_API_KEY`
   - Value: Paste the token
   - Click "Add secret"

### Heroku Integration

To sync Doppler secrets directly to Heroku:

```bash
# Install Heroku plugin
doppler integration heroku setup --project aicentre-f1-hybrid --config prd

# Push secrets to Heroku
doppler integration heroku push --project aicentre-f1-hybrid --config prd
```

This automatically syncs all secrets from Doppler → Heroku config vars.

---

## Team Collaboration

### Inviting Team Members

1. Go to: https://dashboard.doppler.com/workplace/team
2. Click "Invite Member"
3. Enter email address
4. Select role:
   - **Owner**: Full access (admin)
   - **Developer**: Read/write secrets
   - **Viewer**: Read-only access
5. Send invite

### Team Member Onboarding

New team members should:

1. Accept Doppler invite email
2. Create Doppler account
3. Install Doppler CLI
4. Run `doppler login`
5. Clone repository
6. Run `doppler setup` in project directories
7. Use `doppler run` to start services

---

## Best Practices

### DO:
- ✅ Use `doppler run` to inject secrets at runtime
- ✅ Store ALL secrets in Doppler (API keys, tokens, passwords)
- ✅ Use different configs for dev/stg/prd
- ✅ Regularly rotate sensitive secrets (API keys, tokens)
- ✅ Audit secret access in Doppler dashboard

### DON'T:
- ❌ Commit `.env` files to git (add to `.gitignore`)
- ❌ Hardcode secrets in code
- ❌ Share secrets via Slack/email
- ❌ Use production secrets in development

---

## Migrating Existing .env Files

If you have existing `.env` files, migrate them to Doppler:

### Bulk Import from .env

```bash
# Upload all secrets from .env file
doppler secrets upload .env --project aicentre-f1-hybrid --config dev
```

### After Migration

1. Verify secrets were uploaded:
```bash
doppler secrets --project aicentre-f1-hybrid --config dev
```

2. Delete local `.env` file (after backing up):
```bash
mv .env .env.backup
```

3. Add `.env` to `.gitignore`:
```bash
echo ".env" >> .gitignore
```

---

## Troubleshooting

### "Not authenticated" Error

**Solution:**
```bash
doppler login
```

### "Project not found" Error

**Solution:**
Make sure you have access to the project. Ask admin to invite you.

### Secrets Not Loading

**Solution:**
```bash
# Verify setup
doppler setup --project aicentre-f1-hybrid --config dev

# View secrets
doppler secrets

# Run with debugging
doppler run --debug -- npm start
```

### Wrong Environment

**Solution:**
```bash
# Check current config
cat .doppler.yaml

# Re-setup with correct config
doppler setup --project aicentre-f1-hybrid --config dev
```

---

## Complete Example: Starting Server with Doppler

```bash
# 1. Clone repository
git clone https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid.git
cd aicentre-f1-hybrid

# 2. Login to Doppler
doppler login

# 3. Setup server
cd server
doppler setup --project aicentre-f1-hybrid --config dev

# 4. Install dependencies
npm install

# 5. Start server with Doppler secrets
doppler run -- npm start

# Server now has access to:
# - PORT=3000
# - UDP_PORT=20777
# - HEROKU_APP_URL=https://aicentre-f1-26277ba32ef3.herokuapp.com
# - All other secrets from Doppler
```

---

## Quick Reference

### Common Commands

```bash
# View all secrets
doppler secrets

# Set a secret
doppler secrets set KEY=value

# Get a specific secret
doppler secrets get KEY --plain

# Run command with secrets
doppler run -- npm start

# Download secrets to .env
doppler secrets download --no-file --format env > .env

# Setup project
doppler setup --project aicentre-f1-hybrid --config dev

# Switch environment
doppler setup --config prd
```

---

## Security Notes

### Secret Rotation

Rotate these secrets regularly:
- `HEROKU_API_KEY` - Every 90 days
- `NGROK_URL` - Changes when ngrok restarts (update in Doppler)

### Access Control

Current access:
- **jacob.berry@salesforce.com** - Owner (full access)

To add team members, go to:
https://dashboard.doppler.com/workplace/team

---

## Support

**Doppler Documentation:** https://docs.doppler.com
**Dashboard:** https://dashboard.doppler.com/workplace/projects/aicentre-f1-hybrid
**CLI Reference:** https://docs.doppler.com/docs/cli

**Questions?**
- Doppler Support: support@doppler.com
- Internal: Ask jacob.berry@salesforce.com

---

## Summary

All secrets are now stored in Doppler:
- ✅ Server environment variables
- ✅ Heroku app configuration
- ✅ Rig client settings
- ✅ Deployment credentials
- ✅ Network configuration

**Team members can now:**
1. Install Doppler CLI
2. Login with their account
3. Run `doppler setup` in project directories
4. Use `doppler run` to start services with secrets automatically injected

**No more `.env` files to manage!**
**No more sharing secrets via Slack/email!**
**Complete audit trail of who accessed what and when!**
