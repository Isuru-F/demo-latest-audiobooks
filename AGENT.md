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

When creating a pull request, follow these guidelines

- Create a new branch for each user story
- Name the branch with the user story number and a brief description
- Include a link to the user story in the PR description
- Create a PR using the GitHub Cli using the gh commands `gh pr create` 
- When create a GitHub PR be sure to include all the items below - to ensure it's formatted correctly use the flag --body-file with a temp pr-description.md file that isn't commited.
- Reference any relevant issues in the PR description 
- Include a high level summary of the changes made in the PR description for a product manager to understand
- When pushing a branch in GitHub always push to origin and never create a Fork
- Include another summary of the changes made in the PR description for a developer to understand (Technical Notes)
- Include a mermaid digram explain how the new features work in the PR description. This is to help a human quickly get up to speed as to what was changed and why. This is very important.
- Ensure all CI checks pass before merging (unit tests)
- Outline if you added any additional unit tests in the description and include the names of the new tests added and number of tests removed eg (Added 2 tests, removed 1 test) with a summary of the tests added and removed.
- Include Human testing instructions for a human to review with URLS, eg visit / , perform action, expected 1. toggle to do XYZ
- No need to include screenshots in the PR



## Virtual Slash Commands (User invoked)

### `/dr` - DeepResearch

The `/dr` command enables parallel deep research for complex engineering tasks that require comprehensive investigation across multiple domains. This command orchestrates multiple specialized sub-agents to conduct simultaneous research, ensuring thorough coverage of all relevant aspects before implementation.

#### How it works

When the user invokes `/dr [task description]`, the AI Agent will:

1. **Task Analysis**: Breaks down the complex task into distinct research domains
2. **Agent Coordination**: Spawns specialized sub-agents, each with focused expertise  
3. **Parallel Research**: Conducts simultaneous research across multiple vectors:
   - **Web Research**: Uses 'web_search' tool and 'read_web_page' tool to find current best practices, tutorials, and documentation
   - **Codebase Analysis**: Searches existing patterns, conventions, and implementations within the project
   - **Documentation Review**: Analyzes official docs and guides for relevant technologies
   - **Pattern Recognition**: Identifies prevalent architectural patterns and conventions
4. **Synthesis**: Aggregates findings into a comprehensive implementation strategy
5. **Validation**: Cross-references findings to ensure consistency and compatibility

#### Example Usage

```
/dr scaffold a new desktop web app using Svelte 5 and Electron
```

This would spawn sub-agents to research:
- **Svelte5Agent**: Latest Svelte 5 patterns, component structure, state management
- **ElectronAgent**: Electron setup, main/renderer process patterns, security practices  
- **ArchitectureAgent**: Project structure best practices for Electron+Svelte apps
- **ToolingAgent**: Build tools, development workflows, testing strategies
- **CodebaseAgent**: Existing patterns in the current Amp codebase for reference

#### Research Methodology

Each sub-agent follows a structured research approach:

1. **Primary Research**: Search for official documentation and authoritative sources
2. **Community Insights**: Investigate community best practices and common patterns
3. **Codebase Mining**: Extract relevant patterns from existing high-quality codebases
4. **Compatibility Analysis**: Ensure all recommendations work together harmoniously
5. **Recency Validation**: Prioritize current (2024-2025) practices over outdated approaches

#### Output Format

The command produces:
- **Executive Summary**: High-level implementation strategy
- **Technology Research**: Detailed findings for each technology stack component
- **Architecture Recommendations**: Suggested project structure and patterns
- **Implementation Roadmap**: Step-by-step execution plan
- **Code Examples**: Relevant snippets and boilerplate based on research
- **Potential Challenges**: Identified risks and mitigation strategies

#### Best Practices for `/dr` Usage

- **Be Specific**: Include target technologies, constraints, and goals
- **Context Matters**: Mention existing project constraints or preferences  
- **Scope Control**: Break extremely large tasks into focused research areas

**Example prompts:**
- `/dr implement real-time collaboration features using WebRTC and operational transforms`
- `/dr migrate from Webpack to Vite while maintaining all current build optimizations`
- `/dr add comprehensive E2E testing with Playwright following current project patterns`

The `/dr` command is designed for tasks that benefit from comprehensive research before implementation, ensuring well-informed architectural decisions and reducing implementation risks.

### `/spec` - Implementation Specification

The `/spec` command generates a comprehensive implementation specification file that serves as a detailed blueprint for feature development. This command creates a structured document containing implementation strategy, technical considerations, and a progress tracking checklist.

#### How it works

When the user invokes `/spec [feature description]`, the AI Agent will:

1. **Requirements Analysis**: Breaks down the feature into specific requirements and acceptance criteria
2. **Technical Planning**: Analyzes codebase patterns and determines implementation approach
3. **Specification Generation**: Creates a comprehensive spec file with detailed implementation steps
4. **Progress Framework**: Generates a checklist-based progress tracking system
5. **Risk Assessment**: Identifies potential challenges and mitigation strategies

#### Specification Structure

The generated spec file includes:
- **Feature Overview**: High-level description and objectives
- **Technical Requirements**: Detailed technical specifications and constraints
- **Implementation Strategy**: Step-by-step approach with code examples
- **Architecture Considerations**: Design decisions and patterns to follow
- **Testing Strategy**: Unit, integration, and E2E testing requirements
- **Progress Checklist**: Trackable tasks with acceptance criteria
- **Risk Analysis**: Potential challenges and mitigation plans
- **Acceptance Criteria**: Definition of done for the feature

#### Example Usage

```
/spec implement user authentication with JWT tokens and role-based access control
```

This would generate a spec file containing:
- JWT implementation strategy for Vue 3.5 + Express
- Role-based middleware design
- Security considerations and best practices
- Database schema changes required
- Frontend state management updates
- Comprehensive testing checklist
- Step-by-step implementation plan

#### Output Format

Creates a single file: `SPEC_[feature-name].md` containing:
- **Executive Summary**: Feature overview and business value
- **Technical Architecture**: Implementation approach and design decisions
- **Implementation Steps**: Detailed checklist with code examples
- **Testing Requirements**: Test cases and validation criteria
- **Deployment Considerations**: Environment setup and migration steps

---

### `/complex-spec` - Multi-Phase Project Specification

The `/complex-spec` command breaks down large-scale features or system changes into manageable phases, creating separate specification files for each phase and a master progress tracking system.

#### How it works

When the user invokes `/complex-spec [project description]`, the AI Agent will:

1. **Project Decomposition**: Breaks complex project into logical phases
2. **Phase Analysis**: Defines dependencies, scope, and deliverables for each phase
3. **Multi-File Generation**: Creates separate spec files for each phase
4. **Progress Orchestration**: Generates master progress file tracking overall project state
5. **System State Tracking**: Documents current system state and evolution through phases

#### Project Structure

The command generates multiple files:
- **`PROJECT_[name]_PROGRESS.md`**: Master progress tracking and system state
- **`PHASE_01_[name].md`**: First phase specification
- **`PHASE_02_[name].md`**: Second phase specification
- **`PHASE_0N_[name].md`**: Additional phases as needed

#### Example Usage

```
/multi-spec migrate entire application to microservices architecture with event-driven communication
```


This would generate:
- **Master Progress File**: Overall project timeline and current system state
- **Phase 1**: API Gateway and service discovery setup
- **Phase 2**: User service extraction and database separation
- **Phase 3**: Event bus implementation and message queuing
- **Phase 4**: Remaining service extractions and legacy system retirement
- **Phase 5**: Performance optimization and monitoring setup

#### Phase File Structure

Each phase file should exist in the specs folder, create the folder if it doesn't exist

Each phase file contains:
- **Phase Overview**: Goals, scope, and deliverables
- **Prerequisites**: Dependencies on previous phases
- **System State**: Current state vs. target state after phase
- **Implementation Plan**: Detailed steps and technical approach
- **Testing Strategy**: Phase-specific testing requirements
- **Rollback Plan**: Risk mitigation and rollback procedures
- **Success Criteria**: Measurable outcomes for phase completion

#### Master Progress File Structure

The progress file includes:
- **Project Overview**: High-level goals and success metrics
- **Phase Status**: Current status of each phase (Not Started, In Progress, Completed)
- **System Evolution**: How the system changes through each phase
- **Risk Register**: Cross-phase risks and mitigation strategies
- **Timeline**: Estimated duration and dependencies
- **Resource Requirements**: Team members and technical resources needed

#### Best Practices

- **Phase Independence**: Each phase should deliver standalone value
- **Rollback Safety**: Every phase should have a rollback plan
- **System State**: Track how the system evolves through phases
- **Dependency Management**: Clearly define phase dependencies
- **Progress Tracking**: Regular updates to master progress file

**Example prompts:**
- `/complex-spec implement real-time collaboration with operational transforms, WebRTC, and conflict resolution`
- `/complex-spec migrate from monolith to microservices with zero-downtime deployment`
- `/complex-spec add comprehensive observability with metrics, tracing, and alerting across all services`

The `/complex-spec` command is designed for large-scale system changes that require careful planning, phased execution, and comprehensive progress tracking across multiple development cycles.
