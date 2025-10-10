# client

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Sentry Configuration

1. Copy `.env.example` to `.env`:
   ```sh
   cp .env.example .env
   ```

2. Update `.env` with your Sentry credentials:
   - `VITE_SENTRY_DSN`: Your Sentry DSN from project settings
   - `VITE_SENTRY_ORG`: Your Sentry organization slug
   - `VITE_SENTRY_PROJECT`: Your Sentry project name
   - `VITE_SENTRY_AUTH_TOKEN`: Your Sentry auth token (for production builds)

For development without Sentry, you can leave these values empty or unset.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
