import { FC } from 'react'

interface HeaderProps {
  clickCount: number
}

export const Header: FC<HeaderProps> = ({ clickCount }) => {
  return (
    <div className="relative border-b border-cyan-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-wider" style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00ffcc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.3))'
          }}>
            BITCOIN MINER
          </h1>
          <p className="text-cyan-400/60 text-sm uppercase tracking-widest mt-1">Cybernetic Edition</p>
        </div>
        <div className="text-right">
          <p className="text-cyan-400/80 text-xs uppercase tracking-widest mb-1">Total Clicks</p>
          <p className="text-2xl font-bold text-cyan-300">{clickCount}</p>
        </div>
      </div>
    </div>
  )
}
