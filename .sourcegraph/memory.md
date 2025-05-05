# Project Memory

## Development

When making changes to `web/` or `server/`, assume the user is already running the dev server. You can use Puppeteer to get screenshots for visual feedback on your changes to ensure they are correct:

- `web/` runs at http://localhost:5173
- `server/` runs at http://localhost:3000

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

## Development Process

### Testing Requirements
- Always create unit tests for new functionality
- Follow existing test patterns in the codebase
- Ensure tests cover both happy path and edge cases
- Run tests after implementation to verify functionality

## Task/Issue source
- References to project Issues starting with GTM-* are from linear, access these via the Linear MCP server


### User Story Review
- Review each user story to identify any ambiguous or undefined requirements
- Check for unclear technical terms or implementation details
- Ask for clarification on any ambiguous parts before starting implementation
- Confirm understanding of acceptance criteria before making code changes
- Ensure all required data types and edge cases are addressed

# Pull Request Guidelines

When creating a pull request, follow these guidelines:

- Create a new branch for each user story
- Name the branch with the user story number and a brief description
- Include a link to the user story in the PR description
- Create a PR using the GitHub Cli using the gh commands `gh pr create` 
- When create a GitHub PR be sure to include all the items below - to ensure it's formatted correctly use the flag --body-file with a temp pr-description.md file that isn't commited.
- Reference any relevant issues in the PR description 
- Include a high level summary of the changes made in the PR description for a product manager to understand
- Include another summary of the changes made in the PR description for a developer to understand (Technical Notes)
- Ensure all CI checks pass before merging (unit tests)
- Outline if you added any additional unit tests in the description and include the names of the new tests added and number of tests removed eg (Added 2 tests, removed 1 test) with a summary of the tests added and removed.
- Include Human testing instructions for a human to review with URLS, eg visit / , perform action, expected 1. toggle to do XYZ