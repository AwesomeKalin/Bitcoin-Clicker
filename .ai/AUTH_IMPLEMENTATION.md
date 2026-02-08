# Authentication & Data Persistence System

## Overview

The Bitcoin Clicker now includes a dummy authentication system that generates browser tokens and persists game state to the Convex database.

## How It Works

### 1. Token Generation & Storage

When the app starts, the `useAuth()` hook:
- Checks if a token already exists in `localStorage` (key: `bitcoin_clicker_auth_token`)
- If not, generates a cryptographically random 64-character hex token using `crypto.getRandomValues()`
- Stores the token in localStorage for future sessions
- Returns the token to the app

**Token Format**: 64-character hexadecimal string (256 bits of entropy)

### 2. Game State Persistence

The `useGameState(token)` hook:
- Accepts the authentication token as a parameter
- Loads the saved game state from Convex on mount using `loadGameState` query
- Saves game state after every action (click, upgrade purchase, passive income) using `saveGameState` mutation
- Uses debouncing (2-second delay) to avoid excessive database writes

**Saved Data**:
```typescript
{
  token: string                    // Authentication token
  score: number                    // Current Bitcoin balance
  clickValue: number               // Bitcoins earned per click
  perSecond: number                // Bitcoins earned per second
  clickCount: number               // Total clicks made
  upgrades: Array<Upgrade>         // Upgrade purchase history with costs
  lastUpdated: number              // Timestamp of last save
}
```

### 3. Convex Backend Setup

**Schema** (`convex/schema.ts`):
- `gameStates` table stores all game state data
- Indexed by `token` for fast lookups
- Indexed by `lastUpdated` for cleanup operations

**Mutations & Queries** (`convex/gameState.ts`):
- `saveGameState`: Creates new record or updates existing one based on token
- `loadGameState`: Retrieves current game state for a token

### 4. React Integration

**Provider** (`src/providers/ConvexProvider.tsx`):
- Wraps the app with Convex React client
- Uses deployment URL from `VITE_CONVEX_URL` environment variable

**App Flow**:
1. ConvexProvider (main.tsx)
2. App component
3. useAuth() → generates/retrieves token
4. useGameState(token) → loads/syncs data

## Usage

### Development

1. **Start Convex dev server** (in `packages/webapp`):
   ```bash
   bun convex dev
   ```

2. **Start Vite dev server** (in another terminal, in `packages/webapp`):
   ```bash
   bun run dev
   ```

The app will:
- Generate a token on first load
- Load saved game state if available
- Automatically save changes as you play
- Close the tab and reopen to verify persistence

### Viewing Stored Data

In Convex Dashboard:
1. Go to the Data tab
2. Query the `gameStates` table
3. Filter by token to see saved games

## Technical Details

### Token Storage
- **Location**: Browser localStorage
- **Key**: `bitcoin_clicker_auth_token`
- **Persistence**: Survives browser restarts, cleared only if localStorage is cleared
- **Security**: Basic (suitable for demo/local use)

### Debouncing Strategy
- Clicks and upgrades queue a save after 2 seconds
- Passive income saves every 1 second (since it's continuous)
- This reduces database load while maintaining data integrity

### Loading State
- Shows "Loading game state..." message while fetching from Convex
- Prevents user interaction during initial load (isLoading flag)
- Automatically proceeds once data is loaded

## Files Created/Modified

**New Files**:
- `convex/schema.ts` - Data schema
- `convex/gameState.ts` - Mutations and queries
- `src/hooks/useAuth.ts` - Authentication token management
- `src/providers/ConvexProvider.tsx` - Convex React provider
- `.ai/AUTH_IMPLEMENTATION.md` - This documentation

**Modified Files**:
- `src/hooks/useGameState.ts` - Integrated Convex queries/mutations
- `src/App.tsx` - Integrated auth token, added loading state
- `src/main.tsx` - Wrapped with ConvexProvider

## Future Enhancements

- [ ] User authentication (Google, GitHub, custom)
- [ ] Multiple save slots per user
- [ ] Cloud sync across devices
- [ ] Leaderboard system
- [ ] Offline mode with auto-sync
- [ ] Data export/import
- [ ] Session tracking and analytics
