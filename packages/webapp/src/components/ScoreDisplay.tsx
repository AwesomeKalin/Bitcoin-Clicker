import { FC } from 'react'

interface ScoreDisplayProps {
  score: number
  clickValue: number
  perSecond: number
}

export const ScoreDisplay: FC<ScoreDisplayProps> = ({ score, clickValue, perSecond }) => {
  const formatScore = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return Math.floor(num).toString()
  }

  return (
    <div className="border-2 border-cyan-500/50 bg-black/50 backdrop-blur p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <p className="text-cyan-400/70 text-xs uppercase tracking-widest mb-3">Current Balance</p>
        <div className="text-5xl font-black mb-2" style={{
          color: '#00ff88',
          textShadow: '0 0 20px rgba(0, 255, 136, 0.6)'
        }}>
          ₿ {formatScore(score)}
        </div>
        <div className="space-y-2 mt-4 text-sm">
          <p className="text-lime-400">→ {clickValue} per click</p>
            <p className="text-emerald-400 animate-pulse">→ {perSecond}/sec</p>
        </div>
      </div>
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 animate-pulse"></div>
    </div>
  )
}
