# Security Notice

## Heroku API Key Rotation Required

**Date:** October 28, 2025  
**Issue:** Heroku API key was temporarily exposed in git commit history  
**Status:** RESOLVED - Key revoked by GitHub secret scanning  

### What Happened

During project cleanup, a Heroku API key was included in documentation (`docs/DOPPLER_SETUP.md`) and committed to git history. GitHub's secret scanning detected and automatically revoked the exposed key.

### Actions Taken

1. ✅ GitHub automatically revoked the exposed Heroku API key
2. ✅ Removed hardcoded secrets from all documentation files
3. ✅ Rewrote git history to remove the exposed key (git commit --amend)
4. ✅ Created `.env.example` files for all components
5. ✅ Updated documentation to use placeholder examples only

### Required Action

**Before deploying again, you must:**

1. Generate a new Heroku API key:
   ```bash
   heroku authorizations:create --description "aicentre-f1-hybrid"
   ```

2. Update Doppler with the new key:
   ```bash
   doppler secrets set HEROKU_API_KEY=<new-key> --project aicentre-f1-hybrid --config dev
   ```

3. Update GitHub secret (for Actions):
   - Go to: https://github.com/YOUR-USERNAME/aicentre-f1-hybrid/settings/secrets/actions
   - Update `HEROKU_API_KEY` with new value

### What's Secure Now

- ✅ All secrets stored in Doppler only
- ✅ `.env.example` files with placeholder values
- ✅ Documentation uses examples, not real values
- ✅ `.gitignore` prevents committing `.env` files
- ✅ No secrets in git history

### Best Practices Going Forward

1. **Never commit real secrets** - Use Doppler or environment variables
2. **Always use .env.example** - Commit examples, not real values  
3. **Regular key rotation** - Rotate secrets every 90 days
4. **Review before commit** - Check diffs for accidental secrets
5. **Use Doppler CLI** - Run apps with `doppler run -- npm start`

### Files Changed

- `docs/DOPPLER_SETUP.md` - Removed real values, added placeholders
- `server/.env.example` - Created with example values
- `heroku-app/.env.example` - Created with example values
- `rig-client/config.json.example` - Created with example values

### No Other Secrets Exposed

- ✅ No database credentials (not used)
- ✅ No other API keys exposed
- ✅ Internal IPs are not secrets (10.104.88.20 is local network)
- ✅ Heroku app URLs are public (not secrets)

---

**If you have questions about this security notice, contact jacob.berry@salesforce.com**
