# Project Memory

## Build/Test/Lint Commands

### Client (Vue 3.5)
- Build: `cd client && npm run build`
- Dev server: `cd client && npm run dev`
- Type check: `cd client && npm run type-check`
- Lint: `cd client && npm run lint`
- Format: `cd client && npm run format`
- Unit tests: `cd client && npm run test:unit`
- Single test: `cd client && npm run test:unit -- -t "test name"`

### Server (Node.js/Express)
- Start server: `cd server && npm run dev`
- All tests: `cd server && npm test`
- Unit tests: `cd server && npm run test:unit`
- Integration tests: `cd server && npm run test:integration`
- Single test: `cd server && npm test -- -t "test name"`

## Code Style Guidelines
- Client: Vue 3.5 with TypeScript, Prettier (no semicolons, single quotes, 100 char width)
- Server: Node.js/Express with Jest for testing
- Error handling: Use try/catch blocks and appropriate error responses
- Prefer async/await over promise chains

## Verification Steps
- Open Playwright and check any visual changes are applied successfully