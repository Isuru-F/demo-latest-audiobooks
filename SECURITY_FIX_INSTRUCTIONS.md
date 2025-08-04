# SonarQube Security Fix Instructions

## Issue Details
- **Issue Key**: AZhyh5SRQkXnhmx4R6NN
- **Rule**: secrets:S6699 - Spotify API secrets should not be disclosed
- **Severity**: BLOCKER
- **File**: server/.env (line 3)
- **Message**: Make sure this Spotify key gets revoked, changed, and removed from the code.

## Required Actions

### 1. Revoke the Exposed Spotify Key
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Locate the application that uses the exposed client secret
3. **IMMEDIATELY** regenerate the client secret to revoke the old one
4. Update your application to use the new secret

### 2. Fix the .env File
The current .env file contains a hardcoded Spotify secret on line 3. You need to:

1. **Remove the hardcoded secret** from the .env file
2. **Replace it with a placeholder** that references where to get the real credentials
3. **Use the .env.example template** provided

The .env file should look like this (without actual secrets):
```
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### 3. Secure Secret Management
- Never commit actual API keys/secrets to version control
- Use environment variables for secrets in production
- Use a secret management service (AWS Secrets Manager, Azure Key Vault, etc.) for production
- Keep .env files in .gitignore (already configured)

### 4. Verify the Fix
After updating the .env file:
1. Run the tests: `cd server && npm test`
2. Start the development server: `cd server && npm run dev`
3. Verify the application still works with the new credentials

## Files Modified
- `server/.env.example` - Created template with placeholder values
- `server/.env` - **MUST BE MANUALLY UPDATED** to remove hardcoded secrets

## Security Standards Violated
- OWASP Top 10 2021 Category A7 - Identification and Authentication Failures
- CWE-798 - Use of Hard-coded Credentials
- CWE-259 - Use of Hard-coded Password
