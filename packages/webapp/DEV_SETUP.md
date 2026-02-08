# Bitcoin Clicker - Development Setup

## Prerequisites

Make sure you have Bun installed. If not, install from https://bun.sh

## Running the Development Environment

The Bitcoin Clicker game requires **two** servers to run:
1. **Convex Backend** - Handles data persistence
2. **Vite Frontend** - React development server

### Option 1: Run Both Servers (Recommended)

From `/workspaces/Bitcoin-Clicker/packages/webapp/`:

```bash
# Using the dev script
chmod +x dev.sh
./dev.sh

# OR manually with concurrently
bun add -D concurrently
bun run dev:full
```

This will start:
- Convex dev server (syncs your functions to the backend)
- Vite on `http://localhost:5173`

### Option 2: Manual - Two Terminal Windows

**Terminal 1 - Start Convex backend:**
```bash
cd /workspaces/Bitcoin-Clicker/packages/webapp
npx convex dev
```

This will:
- Deploy your Convex functions
- Regenerate TypeScript types
- Watch for changes

**Terminal 2 - Start Vite frontend:**
```bash
cd /workspaces/Bitcoin-Clicker/packages/webapp
bun run dev
# Opens on http://localhost:5173
```

## How It Works

1. **Token Generation**: On first visit, browser generates a unique auth token and stores it in localStorage
2. **Initial Load**: When the game loads, it queries your Convex backend for saved state using the token
3. **Auto-Save**: Every 2 seconds, game changes are automatically saved to the database
4. **Data Persistence**: Refresh the page - your game state will restore

## Debugging

If the game state isn't persisting:

1. **Open Browser DevTools** (F12 → Console tab)
2. **Look for these logs**:
   - ✨ `Generated new token: ...` - Token created
   - 🔑 `Using existing token: ...` - Token restored
   - 📡 `Loading game state from Convex...` - Querying database
   - ✅ `Found existing game state...` - Data loaded successfully
   - 🆕 `New user, will save initial state...` - First time setup
   - 💾 `Saving game state...` - Auto-save happening

3. **Common issues**:
   - No "Saving game state..." logs? → Convex dev server not running
   - Error saving? → Check Convex CLI is running and connected
   - Page stuck on "Loading game state..."? → Check browser console for errors

## Environment Variables

Already configured in `.env.local`:
- `VITE_CONVEX_URL` - Points to your Convex deployment
- `CONVEX_DEPLOYMENT` - Your Convex project ID

## Stopping the Servers

- **Vite**: Press `Ctrl+C` in the terminal
- **Convex**: Press `Ctrl+C` in the terminal or use the kill script
- **Both**: If using `dev:full`, single `Ctrl+C` stops both

## Troubleshooting

### "Cannot find api" errors
→ Run `npx convex dev` to regenerate types

### Database empty on refresh
→ Make sure Convex dev server is running while you play

### Token changes every refresh
→ Check localStorage isn't being cleared (devtools → Application → Storage)

For more info on Convex: https://docs.convex.dev
