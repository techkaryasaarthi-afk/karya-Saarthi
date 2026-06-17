// app/loading.tsx — shown during page transitions & initial load
// Dark skeleton prevents white flash during Next.js route navigation
export default function Loading() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: '100vh',
        backgroundColor: '#090909',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* Animated logo mark */}
        <div style={{
          width: 48, height: 48,
          borderRadius: 12,
          margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #141414, #1c1c1c)',
          border: '1px solid #1a1a1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'ks-pulse 1.4s ease-in-out infinite',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: '#262626' }} />
        </div>
        {/* Loading bar */}
        <div style={{ width: 120, height: 2, backgroundColor: '#1a1a1a', borderRadius: 99, overflow: 'hidden', margin: '0 auto' }}>
          <div style={{
            height: '100%',
            backgroundColor: '#0099ff',
            borderRadius: 99,
            animation: 'ks-loading-bar 1.2s ease-in-out infinite',
            transformOrigin: 'left',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes ks-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.97); }
          50%       { opacity: 1;   transform: scale(1); }
        }
        @keyframes ks-loading-bar {
          0%   { transform: translateX(-100%) scaleX(0.3); }
          50%  { transform: translateX(50%)  scaleX(0.8); }
          100% { transform: translateX(220%) scaleX(0.3); }
        }
      `}</style>
    </div>
  )
}
