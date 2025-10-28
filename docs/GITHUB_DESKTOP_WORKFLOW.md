# GitHub Desktop Workflow for Heroku Deployment

## Overview

This guide shows you how to use **GitHub Desktop** to commit and push changes, which will **automatically deploy** to Heroku.

## One-Time Setup

### Step 1: Get Your Heroku API Key

1. Go to: https://dashboard.heroku.com/account
2. Scroll down to **API Key** section
3. Click **Reveal** to show your API key
4. **Copy the key** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Add Heroku API Key to GitHub

1. Go to your GitHub repo: https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid
2. Click **Settings** (top right of repo)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `HEROKU_API_KEY`
6. Value: Paste your Heroku API key
7. Click **Add secret**

### Step 3: Enable GitHub Actions (if needed)

1. In your repo, go to **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**

### Step 4: Commit the GitHub Action Workflow

Using **GitHub Desktop**:

1. Open **GitHub Desktop**
2. Select repository: `aicentre-f1-hybrid`
3. You should see new files:
   - `.github/workflows/deploy-heroku.yml`
   - `heroku-app/.env`
   - `server/.env` (updated)
   - Various other files
4. Write commit message: **"Setup automatic Heroku deployment via GitHub Actions"**
5. Click **Commit to main**
6. Click **Push origin** (top right)

### Step 5: Verify Deployment Works

1. Go to GitHub repo → **Actions** tab
2. You should see a workflow run: **"Deploy to Heroku"**
3. Click on it to watch progress
4. Wait for green checkmark ✅ (takes ~1-2 minutes)
5. Visit your app: https://aicentre-f1-26277ba32ef3.herokuapp.com

## Daily Workflow with GitHub Desktop

From now on, every time you make changes and push to GitHub, Heroku will automatically deploy!

### Making Changes

1. **Edit files** in VS Code or your preferred editor
2. **Open GitHub Desktop**
3. **Review changes** in the left panel
4. **Write commit message** describing your changes
5. **Click "Commit to main"**
6. **Click "Push origin"** (top right)
7. **Done!** GitHub Actions will automatically deploy to Heroku

### Checking Deployment Status

**Option 1: GitHub Actions (Recommended)**
1. Go to: https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid/actions
2. Click the latest workflow run
3. Watch real-time deployment progress

**Option 2: Heroku Dashboard**
1. Go to: https://dashboard.heroku.com/apps/aicentre-f1/activity
2. See deployment history

**Option 3: Command Line**
```bash
heroku releases --app aicentre-f1
heroku logs --tail --app aicentre-f1
```

## What Gets Deployed

The GitHub Action **only deploys** the `heroku-app/` directory when files in that folder change.

**Deploys when you change:**
- `heroku-app/client/**` (React frontend)
- `heroku-app/server/**` (Express backend)
- `heroku-app/package.json` (Dependencies)

**Does NOT deploy when you change:**
- `server/**` (MacBook server - runs locally)
- `rig-client/**` (Windows rig clients)
- `stream-deck/**` (Stream Deck configs)
- Documentation files

## Deployment Trigger

The workflow triggers on:
```yaml
push:
  branches:
    - main
  paths:
    - 'heroku-app/**'
```

This means:
- ✅ Push to `main` branch → Deploys
- ✅ Changes in `heroku-app/` → Deploys
- ❌ Changes outside `heroku-app/` → Does NOT deploy
- ❌ Push to other branches → Does NOT deploy

## Example: Updating Registration Form

Let's say you want to change the registration form text:

1. **Edit file:** `heroku-app/client/src/pages/RegisterScreen.tsx`
2. **Save file**
3. **GitHub Desktop:**
   - Summary: "Update registration form text"
   - Description: "Changed 'Enter your name' to 'Enter your driver name'"
   - Click **Commit to main**
   - Click **Push origin**
4. **GitHub Actions:**
   - Automatically starts deployment
   - Builds React frontend
   - Builds Express backend
   - Pushes to Heroku
   - ~1-2 minutes later: ✅ Deployed!
5. **Visit:** https://aicentre-f1-26277ba32ef3.herokuapp.com/register?rig=1
   - See your changes live!

## Troubleshooting

### Deployment Failed

**Check GitHub Actions:**
1. Go to: https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid/actions
2. Click the failed workflow
3. Expand the failed step to see error
4. Common issues:
   - `HEROKU_API_KEY` not set → Add secret in GitHub settings
   - Build error → Check `package.json` dependencies
   - Syntax error → Fix code and push again

**Fix and retry:**
1. Fix the issue locally
2. Commit and push again
3. GitHub Actions will automatically retry

### App Not Updating

**Clear browser cache:**
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

**Check Heroku release:**
```bash
heroku releases --app aicentre-f1
# Should show new release with recent timestamp
```

**Check app is running:**
```bash
heroku ps --app aicentre-f1
# Should show: web.1: up
```

### Need to Rollback

If deployment breaks something:

**Via Heroku CLI:**
```bash
# See recent releases
heroku releases --app aicentre-f1

# Rollback to previous version (e.g., v5)
heroku rollback v5 --app aicentre-f1
```

**Via Heroku Dashboard:**
1. Go to: https://dashboard.heroku.com/apps/aicentre-f1/activity
2. Find the working release
3. Click **Roll back to this release**

## Benefits of This Workflow

✅ **Easy:** Just commit and push in GitHub Desktop
✅ **Automatic:** No manual deployment commands
✅ **Fast:** Deploys in ~1-2 minutes
✅ **Safe:** Only deploys on push to main
✅ **Trackable:** See deployment history in GitHub Actions
✅ **Rollbackable:** Easy to undo if something breaks
✅ **Isolated:** Only deploys heroku-app, not entire monorepo

## Alternative: Manual Deployment

If you need to deploy manually (without pushing to GitHub):

```bash
cd /Users/jacob.berry/Developer/aicentre-f1-hybrid
git subtree split --prefix=heroku-app -b heroku-deploy
git push heroku heroku-deploy:main --force
git branch -D heroku-deploy
```

But with GitHub Actions, **you'll never need this!**

## Complete Workflow Example

**Scenario:** Update player registration success message

1. **Edit:** `heroku-app/client/src/pages/ReadyScreen.tsx`
   ```tsx
   // Change this:
   <h1>You're Registered!</h1>

   // To this:
   <h1>Ready to Race! 🏎️</h1>
   ```

2. **GitHub Desktop:**
   - See `ReadyScreen.tsx` in changes
   - Summary: "Add emoji to ready screen"
   - Commit to main
   - Push origin

3. **GitHub Actions:**
   - Watch at: https://github.com/jacob-berry-salesforce/aicentre-f1-hybrid/actions
   - See green checkmark after ~1-2 minutes

4. **Test:**
   - Visit: https://aicentre-f1-26277ba32ef3.herokuapp.com/ready?name=Test&rig=1
   - See: "Ready to Race! 🏎️"

5. **Done!** Changes are live.

## Files You'll Edit Often

### Registration/Mobile App
- `heroku-app/client/src/pages/RegisterScreen.tsx` - Registration form
- `heroku-app/client/src/pages/RegisterScreen.css` - Registration styles
- `heroku-app/client/src/pages/ReadyScreen.tsx` - Ready/waiting screen
- `heroku-app/client/src/pages/ResultsScreen.tsx` - Race results
- `heroku-app/client/src/pages/AttractScreen.tsx` - Attract screen with QR

### Backend API
- `heroku-app/server/src/index.ts` - Express server, API routes

### Configuration
- `heroku-app/.env` - Local development config (not deployed)
- Heroku config vars - Set via: https://dashboard.heroku.com/apps/aicentre-f1/settings

## Summary

🎉 **You're all set!**

**To deploy:**
1. Edit files
2. Commit in GitHub Desktop
3. Push
4. Wait ~2 minutes
5. Changes are live!

**No command line needed!**
**No manual Heroku commands!**
**Just code, commit, push, done!** ✨
