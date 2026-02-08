import { FC } from 'react'
import { Upgrade } from '../types'

interface UpgradeCardProps {
  upgrade: Upgrade
  isAffordable: boolean
  onPurchase: () => void
  index: number
  compact?: boolean
}

export const UpgradeCard: FC<UpgradeCardProps> = ({ upgrade, isAffordable, onPurchase, index, compact = false }) => {
  const isClickUpgrade = upgrade.effect === 'clickValue'
  const borderColor = isClickUpgrade ? 'rgba(34, 211, 238, 0.6)' : 'rgba(16, 185, 129, 0.6)'
  const bgColor = isClickUpgrade ? 'rgba(34, 211, 238, 0.05)' : 'rgba(16, 185, 129, 0.05)'

  // Compact mode for click upgrades
  if (compact) {
    return (
      <div
        className="relative group cursor-pointer transition-all duration-300"
        style={{
          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
        }}
      >
        {/* Icon box */}
        <button
          onClick={onPurchase}
          disabled={!isAffordable}
          className={`w-20 h-20 rounded-md border-2 flex items-center justify-center text-4xl transition-all ${
            isAffordable
              ? 'border-cyan-400/60 bg-cyan-500/10 hover:bg-cyan-500/25 hover:border-cyan-300'
              : 'border-gray-600/40 bg-gray-900/30 opacity-50'
          }`}
        >
          👆
        </button>

        {/* Hover tooltip card */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-48 bg-black border-2 border-cyan-500 rounded-md p-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 shadow-2xl"
          style={{
            boxShadow: 'inset 0 0 20px rgb(34, 211, 238), 0 0 30px rgb(34, 211, 238)',
            zIndex: 9999
          }}
        >
          <p className="font-bold text-white mb-2 text-sm uppercase tracking-wide">{upgrade.name}</p>
          <p className="text-xs text-lime-400 mb-3">
            → +{upgrade.amount} click value
          </p>
          {upgrade.purchased > 0 && (
            <p className="text-purple-400/60 text-xs mb-3">Purchases: {upgrade.purchased}</p>
          )}
          <button
            onClick={onPurchase}
            disabled={!isAffordable}
            className={`w-full px-3 py-2 rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all ${
              isAffordable
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,200,0.6)]'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            ${upgrade.cost}
          </button>
        </div>
      </div>
    )
  }

  // Full card mode for passive upgrades
  return (
    <div
      className={`border-2 transition-all duration-300 p-4 relative group cursor-pointer`}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
        borderColor: isAffordable ? borderColor : 'rgba(75, 85, 99, 0.4)',
        backgroundColor: isAffordable ? bgColor : 'rgba(17, 24, 39, 0.3)'
      }}
    >
      {/* Placeholder for upgrade icon */}
      <div className="absolute left-4 top-4 w-8 h-8 bg-gray-700/40 border border-gray-600/50 rounded flex items-center justify-center text-xs text-gray-500">
        ⚙️
      </div>

      <div className="ml-12 flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-white mb-1 text-sm uppercase tracking-wide">{upgrade.name}</p>
          <p className="text-xs uppercase tracking-widest text-emerald-400">
            ↻ +{upgrade.amount} /sec
          </p>
          {upgrade.purchased > 0 && (
            <p className="text-purple-400/60 text-xs mt-2">Purchased: {upgrade.purchased}</p>
          )}
        </div>

        <button
          onClick={onPurchase}
          disabled={!isAffordable}
          className={`px-4 py-2 rounded-sm font-mono font-bold text-sm uppercase tracking-widest transition-all ${
            isAffordable
              ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,200,0.6)] hover:shadow-[0_0_25px_rgba(0,255,200,0.8)]'
              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          }`}
        >
          ${upgrade.cost}
        </button>
      </div>

      {isAffordable && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-lime-400/50"></div>
      )}
    </div>
  )
}
