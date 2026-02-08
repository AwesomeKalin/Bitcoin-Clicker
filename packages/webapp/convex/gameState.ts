import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Helper to extract purchase data from old format if it exists
function extractPurchasesFromOldData(
  data: any
): Array<{ id: number; purchased: number }> {
  // If already in new format, return as-is
  if (data.upgradePurchases) {
    return data.upgradePurchases
  }
  // If old format with full upgrade objects, extract just id and purchased
  if (data.upgrades && Array.isArray(data.upgrades)) {
    return data.upgrades.map((u: any) => ({
      id: u.id,
      purchased: u.purchased,
    }))
  }
  // Fallback: empty array
  return []
}

export const saveGameState = mutation({
  args: {
    token: v.string(),
    score: v.number(),
    clickCount: v.number(),
    upgradePurchases: v.array(
      v.object({
        id: v.number(),
        purchased: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('gameStates')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        score: args.score,
        clickCount: args.clickCount,
        upgradePurchases: args.upgradePurchases,
        lastUpdated: Date.now(),
      })
      return existing._id
    } else {
      return await ctx.db.insert('gameStates', {
        token: args.token,
        score: args.score,
        clickCount: args.clickCount,
        upgradePurchases: args.upgradePurchases,
        lastUpdated: Date.now(),
      })
    }
  },
})

export const loadGameState = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const gameState = await ctx.db
      .query('gameStates')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first()

    if (!gameState) {
      return null
    }

    // Handle migration from old format
    const upgradePurchases = extractPurchasesFromOldData(gameState)

    return {
      score: gameState.score,
      clickCount: gameState.clickCount,
      upgradePurchases,
    }
  },
})
