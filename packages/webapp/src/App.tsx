import { useGameState } from './hooks/useGameState'
import { useAuth } from './hooks/useAuth'
import { Header } from './components/Header'
import { ScoreDisplay } from './components/ScoreDisplay'
import { ClickButton } from './components/ClickButton'
import { UpgradeList } from './components/UpgradeList'

export default function App() {
  const token = useAuth()
  const {
    score,
    clickValue,
    perSecond,
    clickCount,
    upgrades,
    handleClick,
    handleUpgrade,
    isLoading,
  } = useGameState(token)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden fixed inset-0" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 136, .05) 25%, rgba(0, 255, 136, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, .05) 75%, rgba(0, 255, 136, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 136, .05) 25%, rgba(0, 255, 136, .05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, .05) 75%, rgba(0, 255, 136, .05) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Neon glow effects */}
      <div className="fixed top-0 left-1/2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* Header */}
      <Header clickCount={clickCount} />

      {/* Main content */}
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <p className="text-cyan-400 text-xl uppercase tracking-widest animate-pulse">Loading game state...</p>
          </div>
        </div>
      ) : (
        <div className="relative max-w-7xl mx-auto px-8 py-4 grid grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* LEFT: Clicker Section (2 columns) */}
          <div className="col-span-2 flex flex-col gap-4 min-h-0">
            <ScoreDisplay
              score={score}
              clickValue={clickValue}
              perSecond={perSecond}
            />

            <div className="flex-1 flex items-center justify-center min-h-0">
              <ClickButton onClick={handleClick} />
            </div>

            <p className="text-center text-cyan-400/50 text-xs uppercase tracking-widest">[ Click to mine ]</p>
          </div>

          {/* RIGHT: Upgrades Section (2 columns) */}
          <div className="col-span-2 h-full max-h-[calc(100vh-120px)] overflow-y-auto pr-4">
            <UpgradeList
              upgrades={upgrades}
              score={score}
              onUpgrade={handleUpgrade}
            />
          </div>
        </div>
      )}

      <style>{`
        html, body {
          overflow: hidden;
          height: 100%;
        }

        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 255, 136, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #00ff88 0%, #00ffcc 100%);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #00ffaa 0%, #00ffee 100%);
        }
      `}</style>
    </div>
  )
}
