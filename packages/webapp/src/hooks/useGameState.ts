import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Upgrade } from '../types'

interface GameState {
  score: number
  clickValue: number
  perSecond: number
  clickCount: number
  upgrades: Upgrade[]
  handleClick: () => void
  handleUpgrade: (upgradeId: number) => void
  isLoading: boolean
}

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 1, name: 'Better Fingers', cost: 10, effect: 'clickValue', amount: 1, purchased: 0 },
  { id: 2, name: 'Cursor Speed', cost: 25, effect: 'clickValue', amount: 5, purchased: 0 },
  { id: 3, name: 'Auto Clicker', cost: 100, effect: 'perSecond', amount: 1, purchased: 0 },
  { id: 4, name: 'Mining Rig', cost: 500, effect: 'perSecond', amount: 10, purchased: 0 },
  { id: 5, name: 'Quantum Computer', cost: 2000, effect: 'perSecond', amount: 50, purchased: 0 },
]

// Helper: Extract only {id, purchased} pairs from upgrades
function extractUpgradePurchases(upgrades: Upgrade[]): Array<{ id: number; purchased: number }> {
  return upgrades.map(u => ({ id: u.id, purchased: u.purchased }))
}

// Helper: Merge loaded purchase data with upgrade definitions
function mergeUpgradePurchases(
  purchaseData: Array<{ id: number; purchased: number }> | undefined
): Upgrade[] {
  if (!purchaseData) return INITIAL_UPGRADES

  return INITIAL_UPGRADES.map(upgrade => {
    const saved = purchaseData.find(p => p.id === upgrade.id)
    if (!saved) return upgrade

    // Recalculate cost based on purchase count
    let cost = upgrade.cost
    for (let i = 0; i < saved.purchased; i++) {
      cost = Math.ceil(cost * 1.15)
    }

    return {
      ...upgrade,
      purchased: saved.purchased,
      cost,
    }
  })
}

// Helper: Calculate clickValue from upgrades
function calculateClickValue(upgrades: Upgrade[]): number {
  return 1 + upgrades
    .filter(u => u.effect === 'clickValue')
    .reduce((sum, u) => sum + u.amount * u.purchased, 0)
}

// Helper: Calculate perSecond from upgrades
function calculatePerSecond(upgrades: Upgrade[]): number {
  return upgrades
    .filter(u => u.effect === 'perSecond')
    .reduce((sum, u) => sum + u.amount * u.purchased, 0)
}

export function useGameState(token: string): GameState {
  const [score, setScore] = useState<number>(0)
  const [clickValue, setClickValue] = useState<number>(1)
  const [perSecond, setPerSecond] = useState<number>(0)
  const [clickCount, setClickCount] = useState<number>(0)
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Convex queries and mutations - only run query when token is ready
  const loadedState = useQuery(
    api.gameState.loadGameState, 
    token ? { token } : 'skip'
  )
  const saveGameStateMutation = useMutation(api.gameState.saveGameState)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load initial state from Convex
  useEffect(() => {
    if (!token) {
      console.log('🔑 Waiting for token...')
      return
    }

    if (loadedState === undefined) {
      // Query is still loading
      console.log('📡 Loading game state from Convex...')
      return
    }

    console.log('📦 Game state loaded:', loadedState)
    // Query loaded - set the data
    if (loadedState) {
      console.log('✅ Found existing game state, restoring...')
      setScore(loadedState.score)
      setClickCount(loadedState.clickCount)
      const restoredUpgrades = mergeUpgradePurchases(loadedState.upgradePurchases)
      setUpgrades(restoredUpgrades)
      // Calculate derived values
      setClickValue(calculateClickValue(restoredUpgrades))
      setPerSecond(calculatePerSecond(restoredUpgrades))
    } else {
      console.log('🆕 New user, will save initial state after loading')
    }
    // loadedState is null means no data yet, use defaults
    setIsLoading(false)
  }, [loadedState, token])

  // Save state to Convex with debouncing to avoid too many mutations
  const saveToConvex = (
    newScore: number,
    newClickCount: number,
    newUpgrades: Upgrade[]
  ): void => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout to save after 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      console.log('💾 Saving game state...', { score: newScore })
      void saveGameStateMutation({
        token,
        score: newScore,
        clickCount: newClickCount,
        upgradePurchases: extractUpgradePurchases(newUpgrades),
      }).catch(err => console.error('❌ Failed to save:', err))
    }, 2000)
  }

  // Handle clicking
  const handleClick = (): void => {
    const newScore = score + clickValue
    const newClickCount = clickCount + 1
    setScore(newScore)
    setClickCount(newClickCount)
    saveToConvex(newScore, newClickCount, upgrades)
  }

  // Handle upgrade purchase
  const handleUpgrade = (upgradeId: number): void => {
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (!upgrade || score < upgrade.cost) return

    const newScore = score - upgrade.cost
    setScore(newScore)

    const newUpgrades = upgrades.map(u => 
      u.id === upgradeId 
        ? { ...u, purchased: u.purchased + 1, cost: Math.ceil(u.cost * 1.15) }
        : u
    )
    setUpgrades(newUpgrades)
    
    // Recalculate derived values
    setClickValue(calculateClickValue(newUpgrades))
    setPerSecond(calculatePerSecond(newUpgrades))
    
    saveToConvex(newScore, clickCount, newUpgrades)
  }

  // Passive income effect
  useEffect(() => {
    if (perSecond === 0) return
    const interval = setInterval(() => {
      setScore(s => {
        const newScore = s + perSecond
        saveToConvex(newScore, clickCount, upgrades)
        return newScore
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [perSecond])

  // Save initial state when loading finishes for new users
  useEffect(() => {
    if (!isLoading && token && loadedState === null) {
      // This is a new user, save their initial state
      console.log('💾 Saving initial state for new user...')
      void saveGameStateMutation({
        token,
        score,
        clickCount,
        upgradePurchases: extractUpgradePurchases(upgrades),
      }).then(() => console.log('✅ Initial state saved!'))
        .catch(err => console.error('❌ Failed to save initial state:', err))
    }
  }, [isLoading, token, loadedState])

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    score,
    clickValue,
    perSecond,
    clickCount,
    upgrades,
    handleClick,
    handleUpgrade,
    isLoading,
  }
}
