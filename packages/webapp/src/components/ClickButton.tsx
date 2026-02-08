import { FC } from 'react'

interface ClickButtonProps {
  onClick: () => void
}

export const ClickButton: FC<ClickButtonProps> = ({ onClick }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <button
        onClick={onClick}
        className="w-full h-64 rounded-md border-4 border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:to-purple-500/40 transition-all duration-200 text-8xl font-black flex items-center justify-center relative group overflow-hidden active:scale-95"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.4), inset 0 0 30px rgba(0, 255, 200, 0.1)'
        }}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative z-10 drop-shadow-[0_0_10px_rgba(0,255,136,0.6)]">₿</span>
      </button>
      <div className="absolute inset-0 rounded-md border-4 border-lime-400/0 group-hover:border-lime-400/30 transition-colors pointer-events-none"></div>
    </div>
  )
}
