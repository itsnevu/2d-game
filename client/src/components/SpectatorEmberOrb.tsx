/**
 * SpectatorEmberOrb — the visual body of a no-wallet spectator.
 *
 * A spectator has no character; instead they appear as a small swarm of spinning
 * fire embers. The spectator camera is centred on its target, so rendering this at
 * screen-centre places the embers exactly where the "player" would stand.
 *
 * Pure CSS/DOM (no engine/particle wiring) so it is cheap and cannot destabilise
 * the render loop.
 */
import React from 'react';

const EMBERS = [
  { radius: 18, size: 8, dur: 2.4, delay: 0.0, color: '#ffd24a' },
  { radius: 26, size: 7, dur: 3.1, delay: 0.3, color: '#ff9d3c' },
  { radius: 14, size: 6, dur: 1.9, delay: 0.6, color: '#ffe79a' },
  { radius: 31, size: 6, dur: 3.8, delay: 0.9, color: '#ff7a2f' },
  { radius: 22, size: 7, dur: 2.7, delay: 1.2, color: '#ffc83c' },
  { radius: 11, size: 5, dur: 1.6, delay: 1.5, color: '#fff0c2' },
  { radius: 35, size: 5, dur: 4.3, delay: 0.45, color: '#ff8a3a' },
  { radius: 29, size: 6, dur: 3.4, delay: 1.05, color: '#ffd24a' },
  { radius: 40, size: 4, dur: 5.0, delay: 0.75, color: '#ff6a28' },
  { radius: 16, size: 5, dur: 2.1, delay: 1.8, color: '#ffe79a' },
];

const SpectatorEmberOrb: React.FC = () => {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        transform: 'translate(-50%, -50%)',
        zIndex: 56,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes spec-orb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spec-orb-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes spec-orb-flicker {
          0%, 100% { opacity: 0.55; transform: translateX(var(--r)) scale(0.85); }
          50% { opacity: 1; transform: translateX(var(--r)) scale(1.25); }
        }
        @keyframes spec-orb-core {
          0%, 100% { opacity: 0.7; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>

      {/* Soft dark backing so the orb reads on any terrain */}
      <div
        style={{
          position: 'absolute',
          top: '-46px',
          left: '-46px',
          width: '92px',
          height: '92px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,8,0,0.45) 0%, rgba(20,8,0,0.18) 45%, rgba(0,0,0,0) 72%)',
        }}
      />

      {/* Warm central core glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,190,1) 0%, rgba(255,150,55,0.7) 45%, rgba(255,90,30,0) 78%)',
          boxShadow: '0 0 22px 8px rgba(255,140,50,0.55)',
          filter: 'blur(0.5px)',
          animation: 'spec-orb-core 1.4s ease-in-out infinite',
        }}
      />

      {/* Orbiting embers */}
      {EMBERS.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            animation: `${i % 2 === 0 ? 'spec-orb-spin' : 'spec-orb-spin-rev'} ${e.dur}s linear infinite`,
            animationDelay: `${e.delay}s`,
          }}
        >
          <div
            style={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ['--r' as any]: `${e.radius}px`,
              position: 'absolute',
              top: `${-e.size / 2}px`,
              left: `${-e.size / 2}px`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              borderRadius: '50%',
              background: e.color,
              boxShadow: `0 0 ${e.size + 3}px ${e.size / 2}px ${e.color}`,
              animation: `spec-orb-flicker ${e.dur * 0.6}s ease-in-out infinite`,
              animationDelay: `${e.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SpectatorEmberOrb;
