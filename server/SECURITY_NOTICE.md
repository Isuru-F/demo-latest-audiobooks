# Security Notice: Environment Variables

## ⚠️ CRITICAL: Hardcoded Secrets Removed

**Date**: 2025-04-08  
**Issue**: SonarQube detected hardcoded Spotify API credentials in `server/.env`  
**Action Taken**: Credentials removed from version control and .env added to .gitignore

## Setup Instructions

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` with your actual Spotify API credentials:
   - Get your credentials from https://developer.spotify.com/dashboard
   - Replace placeholder values with your actual Client ID and Secret

3. **NEVER commit the .env file** - it's now in .gitignore

## For Developers

- Always use `.env.example` as a template
- Keep secrets in environment variables, never in code
- If you need to share non-sensitive config, update `.env.example`

## For Deployment

Ensure your deployment environment has the following variables set:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `PORT` (optional, defaults to 3000)
