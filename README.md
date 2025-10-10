# Jukebox - Spotify Music Discovery App

Jukebox is a modern music discovery application that allows users to explore new music releases and various music genres. It uses the Spotify API to fetch data and present it in a visually pleasing interface.

## Project Structure

The project consists of two main parts:

1. Backend (Node.js/Express API)
2. Frontend (Vue 3.5 client)

### Backend (/server)

- Node.js and Express API
- Handles Spotify API authentication and requests
- Unit tests with Jest
- Integration tests with Supertest

### Frontend (/client)

- Vue 3.5 application
- Modern UI with custom styling
- Pinia for state management
- Unit tests with Vitest
- Sentry error tracking and performance monitoring

## Features

- Browse latest music releases
- Explore music genres
- Responsive design

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- Spotify Developer account for API credentials

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your Spotify API credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   PORT=3000
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Sentry (optional):
   ```
   cp .env.example .env
   # Edit .env with your Sentry credentials
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Testing

### Backend Tests

```
cd server
npm test                  # Run all tests
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
```

### Frontend Tests

```
cd client
npm run test:unit        # Run unit tests
```

## API Endpoints

- `GET /api/spotify/new-releases` - Get new music releases
- `GET /api/spotify/genres` - Get available music genres

## Technologies Used

### Backend
- Node.js
- Express
- Axios
- Jest
- Supertest

### Frontend
- Vue 3.5
- Pinia
- Vue Router
- Axios
- Vitest
- Sentry (Error tracking & Performance monitoring)

## License

MIT