import { useState, useEffect } from 'react'
import { Upgrade } from '../types'

interface GameState {
  score: number
  clickValue: number
  perSecond: number
  clickCount: number
  upgrades: Upgrade[]
  handleClick: () => void
  handleUpgrade: (upgradeId: number) => void
}

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 1, name: 'Better Fingers', cost: 10, effect: 'clickValue', amount: 1, purchased: 0 },
  { id: 2, name: 'Cursor Speed', cost: 25, effect: 'clickValue', amount: 5, purchased: 0 },
  { id: 3, name: 'Auto Clicker', cost: 100, effect: 'perSecond', amount: 1, purchased: 0 },
  { id: 4, name: 'Mining Rig', cost: 500, effect: 'perSecond', amount: 10, purchased: 0 },
  { id: 5, name: 'Quantum Computer', cost: 2000, effect: 'perSecond', amount: 50, purchased: 0 },
]

export function useGameState(): GameState {
  const [score, setScore] = useState<number>(0)
  const [clickValue, setClickValue] = useState<number>(1)
  const [perSecond, setPerSecond] = useState<number>(0)
  const [clickCount, setClickCount] = useState<number>(0)
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES)

  // Handle clicking
  const handleClick = (): void => {
    setScore(score + clickValue)
    setClickCount(clickCount + 1)
  }

  // Handle upgrade purchase
  const handleUpgrade = (upgradeId: number): void => {
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (!upgrade || score < upgrade.cost) return

    setScore(score - upgrade.cost)
    
    if (upgrade.effect === 'clickValue') {
      setClickValue(clickValue + upgrade.amount)
    } else if (upgrade.effect === 'perSecond') {
      setPerSecond(perSecond + upgrade.amount)
    }

    setUpgrades(upgrades.map(u => 
      u.id === upgradeId 
        ? { ...u, purchased: u.purchased + 1, cost: Math.ceil(u.cost * 1.15) }
        : u
    ))
  }

  // Passive income effect
  useEffect(() => {
    if (perSecond === 0) return
    const interval = setInterval(() => {
      setScore(s => s + perSecond)
    }, 1000)
    return () => clearInterval(interval)
  }, [perSecond])

  return {
    score,
    clickValue,
    perSecond,
    clickCount,
    upgrades,
    handleClick,
    handleUpgrade,
  }
}
