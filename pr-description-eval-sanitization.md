# Security Fix: Replace eval() with Safe JSON Parsing in Config Service

## Overview
Fixed a **Medium severity** Improper Code Sanitization vulnerability found by Snyk security scan in `server/src/services/config.service.js` line 68. The service was using `eval()` with user input, allowing Remote Code Execution (RCE).

## Security Issue Details
The vulnerability existed because the config service used multiple `eval()` patterns with unsanitized user input:

1. **Direct eval()**: `eval(configString)` - Most dangerous
2. **Function constructor**: `new Function('return ' + configString)()` 
3. **Dynamic property access**: `eval('(' + configString + ')')`
4. **Script execution method**: `executeConfigScript()` with `eval()`

**Attack Examples:**
```javascript
// Attackers could send:
"process.exit(1)"                    // Crash the server
"require('fs').unlinkSync('*')"      // Delete files
"global.process = null"              // Break the runtime
"(() => { while(true) {} })()"       // Infinite loop DoS
```

## Solution Implemented
1. **Replaced eval() with JSON.parse()**: No code execution, only data parsing
2. **Added Schema Validation**: AJV library enforces strict configuration structure
3. **Removed executeConfigScript()**: Eliminated RCE vector entirely
4. **Comprehensive Security Tests**: Covers all attack vectors and edge cases

## Code Changes
- Installed `ajv` for JSON schema validation (removed vulnerable `vm2`)
- Replaced all `eval()` calls with `JSON.parse()`
- Added strict schema allowing only: `debug`, `logLevel`, `timeout`, `retries`
- Schema includes type validation and value range constraints
- Completely removed `executeConfigScript()` method
- Created extensive security test suite in `tests/security/config-security.test.js`

## Schema Validation Details
```javascript
{
  debug: { type: 'boolean' },
  logLevel: { enum: ['verbose', 'info', 'warn', 'error'] },
  timeout: { type: 'number', minimum: 0 },
  retries: { type: 'number', minimum: 0, maximum: 10 }
}
```
- `additionalProperties: false` - Rejects unknown keys
- Type validation prevents injection through type confusion
- Enum/range validation prevents out-of-bounds values

## Alternative Approaches Considered
- **VM2 Sandbox**: Deprecated with critical security issues
- **AST Parsing**: Overly complex for configuration needs
- **YAML Support**: Could be added but JSON is sufficient and more secure

Chose JSON + schema validation as recommended by Oracle for maximum security with minimal complexity.

## Testing
✅ **Project still compiles** after changes  
✅ **All existing tests pass** (17 client tests, 9 server tests)  
✅ **Added 6 new security tests** covering:
- Malicious JavaScript code execution attempts rejection
- Valid JSON configuration acceptance
- Schema validation enforcement
- All allowed configuration fields processing
- executeConfigScript method removal verification
- Safe configuration merging

### New Tests Added:
1. `should reject malicious JavaScript code execution attempts` - Tests 5 attack vectors
2. `should accept valid JSON configuration` - Validates normal operation
3. `should validate configuration schema strictly` - Tests schema enforcement
4. `should process valid configurations with all allowed fields` - Full schema test
5. `should not have executeConfigScript method` - Confirms RCE method removal
6. `should merge with existing configuration safely` - Tests integration behavior

## Verification
- ✅ Snyk scan no longer reports Improper Code Sanitization vulnerability
- ✅ Malicious payloads like `process.exit(1)` are rejected at JSON parsing stage
- ✅ Invalid configurations fail schema validation before processing
- ✅ All functionality preserved for valid JSON configurations

## Human Testing Instructions
1. Test malicious input rejection:
   ```bash
   curl -X POST http://localhost:3000/api/config \
     -H "Content-Type: application/json" \
     -d '"process.exit(1)"'
   ```
   **Expected**: `Config is not valid JSON` error

2. Test valid configuration:
   ```bash
   curl -X POST http://localhost:3000/api/config \
     -H "Content-Type: application/json" \
     -d '{"debug": false, "logLevel": "warn"}'
   ```
   **Expected**: Successful configuration update

3. Test schema validation:
   ```bash
   curl -X POST http://localhost:3000/api/config \
     -H "Content-Type: application/json" \
     -d '{"debug": "not-boolean"}'
   ```
   **Expected**: `Config validation failed` error

## Progress Notes
✅ Verified project builds and tests pass  
✅ Ran Snyk security scan - found 5 vulnerabilities  
✅ Fixed High severity XSS vulnerability (PR #97)  
✅ Fixed Medium severity Information Exposure vulnerability (PR #98)  
✅ **COMPLETED: Fixed Medium severity Improper Code Sanitization vulnerability**  
🔄 Fixing remaining Low severity vulnerabilities in separate PRs  

## AmpCode Thread
https://ampcode.com/threads/T-cc9ed9e6-c720-413d-b322-d596c3b10cc1

## Mermaid Diagram: Safe Configuration Processing

```mermaid
flowchart TD
    A[User Input: Configuration String] --> B[JSON.parse]
    B --> C{Valid JSON?}
    C -->|No| D[Reject: Invalid JSON Error]
    C -->|Yes| E[AJV Schema Validation]
    E --> F{Schema Valid?}
    F -->|No| G[Reject: Validation Error]
    F -->|Yes| H[Safe Configuration Object]
    H --> I[Merge with Existing Config]
    I --> J[Store Updated Configuration]
    
    K[Malicious Input: process.exit] --> B
    B --> D
    
    L[Invalid Schema: {debug: 'string'}] --> B
    B --> C
    C --> E
    E --> F
    F --> G
    
    M[Valid Config: {debug: true}] --> B
    B --> C
    C --> E
    E --> F
    F --> H
    
    style B fill:#90EE90
    style E fill:#90EE90
    style D fill:#FFE4E1
    style G fill:#FFE4E1
    style J fill:#E6F3FF
```
