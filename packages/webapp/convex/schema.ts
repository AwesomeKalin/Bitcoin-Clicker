import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  gameStates: defineTable({
    token: v.string(),
    score: v.number(),
    clickCount: v.number(),
    upgradePurchases: v.optional(v.array(
      v.object({
        id: v.number(),
        purchased: v.number(),
      })
    )),
    lastUpdated: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_lastUpdated', ['lastUpdated']),
})
