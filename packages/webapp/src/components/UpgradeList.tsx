import { FC } from 'react'
import { Upgrade } from '../types'
import { UpgradeCard } from './UpgradeCard'

interface UpgradeListProps {
  upgrades: Upgrade[]
  score: number
  onUpgrade: (upgradeId: number) => void
}

export const UpgradeList: FC<UpgradeListProps> = ({ upgrades, score, onUpgrade }) => {
  const clickUpgrades = upgrades.filter(u => u.effect === 'clickValue')
  const passiveUpgrades = upgrades.filter(u => u.effect === 'perSecond')

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="border-2 border-cyan-500/50 bg-black/50 backdrop-blur p-4 flex-shrink-0 overflow-visible">
        <div className="mb-4 pb-4 border-b border-cyan-500/30">
          <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00ffcc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <span className="text-2xl">👆</span>
            Click Enhancements
          </h3>
          <p className="text-cyan-400/60 text-xs uppercase tracking-widest mt-2">Hover for details</p>
        </div>

        {/* Click upgrades grid */}
        <div className="grid grid-cols-3 gap-4">
          {clickUpgrades.map((upgrade, idx) => {
            const isAffordable = score >= upgrade.cost
            return (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                isAffordable={isAffordable}
                onPurchase={() => onUpgrade(upgrade.id)}
                index={idx}
                compact={true}
              />
            )
          })}
        </div>
      </div>

      <div className="border-t-4 border-emerald-500/50 pt-4 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="border-2 border-purple-500/50 bg-black/50 backdrop-blur flex flex-col h-full min-h-0">
          {/* Section Header */}
          <div className="border-b border-purple-500/30 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/0 flex-shrink-0">
            <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2" style={{
              background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <span className="text-2xl">⚙️</span>
              Passive Income
            </h3>
            <p className="text-purple-400/60 text-xs uppercase tracking-widest mt-2">Generate Bitcoin automatically</p>
          </div>

          {/* Scrollable upgrades only */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {passiveUpgrades.map((upgrade, idx) => {
              const isAffordable = score >= upgrade.cost
              return (
                <UpgradeCard
                  key={upgrade.id}
                  upgrade={upgrade}
                  isAffordable={isAffordable}
                  onPurchase={() => onUpgrade(upgrade.id)}
                  index={idx}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

