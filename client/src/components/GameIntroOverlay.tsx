/**
 * GameIntroOverlay — first-time onboarding popup.
 *
 * Shows once when a player first enters the world. Explains the objective in clear
 * steps and plays ECHO's intro broadcast so it feels read-aloud. Fully skippable /
 * closeable — if the player skips, the voice keeps playing in the background so
 * ECHO can continue onto the next briefing.
 *
 * Self-contained: it sets the crash-intro localStorage keys on mount so the
 * deterministic tutorial system (useSovaTutorials) does NOT double-play the same clip.
 */
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faForward, faSeedling, faHammer, faShieldHalved, faCoins } from '@fortawesome/free-solid-svg-icons';
import echoLogo from '../assets/ui/sova.png';
import { ASSISTANT_NAME } from '../constants/branding';

const SEEN_KEY = 'broth_game_intro_overlay_seen';

export function hasSeenGameIntro(): boolean {
  try { return localStorage.getItem(SEEN_KEY) === 'true'; } catch { return false; }
}

const STEPS = [
  { icon: faSeedling, title: 'Gather', body: 'Head to the shore and harvest plant fiber from the vegetation. It is the base for rope, bandages, and your first tools.' },
  { icon: faHammer, title: 'Craft & Build', body: 'Open crafting to turn raw materials into tools, weapons, and shelter. Press J anytime to see your current objectives.' },
  { icon: faShieldHalved, title: 'Survive', body: 'Watch your health, water, and hunger. Night is colder and more dangerous — stay fed, stay warm, stay alive.' },
  { icon: faCoins, title: 'Grow $WLDR', body: 'Trade what you gather and craft to earn $WLDR. This is one shared world — other survivors are out there with you.' },
];

interface GameIntroOverlayProps {
  onClose: () => void;
}

const GameIntroOverlay: React.FC<GameIntroOverlayProps> = ({ onClose }) => {
  const [closing, setClosing] = useState(false);

  // NOTE: this overlay is purely VISUAL. ECHO's intro voice is played independently by
  // the deterministic tutorial system (useSovaTutorials crashIntro) ~2.5s after spawn,
  // so the briefing reads aloud alongside the popup — and if the player skips, the voice
  // simply keeps playing onto the next briefing. We do NOT play audio here (would double up).

  const finish = () => {
    if (closing) return;
    setClosing(true);
    try { localStorage.setItem(SEEN_KEY, 'true'); } catch { /* ignore */ }
    setTimeout(onClose, 220);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 11000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(12,21,15,0.82) 0%, rgba(5,9,6,0.94) 100%)',
        backdropFilter: 'blur(6px)',
        fontFamily: "'PixelOperator', sans-serif",
        opacity: closing ? 0 : 1,
        transition: 'opacity 0.22s ease',
        animation: 'introFade 0.35s ease-out',
      }}
    >
      <style>{`
        @keyframes introFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes introRise { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes echoPulse { 0%,100% { box-shadow: 0 0 18px 2px rgba(134,190,82,0.35); } 50% { box-shadow: 0 0 30px 6px rgba(134,190,82,0.6); } }
      `}</style>

      <div
        style={{
          width: 'min(680px, 92vw)', maxHeight: '88vh', overflowY: 'auto',
          background: 'linear-gradient(135deg, #101e16 0%, #0c150f 100%)',
          border: '2px solid #5c8e32', borderRadius: '14px',
          boxShadow: '0 18px 60px rgba(0,0,0,0.6), 0 0 30px rgba(134,190,82,0.18)',
          padding: '28px clamp(20px, 4vw, 36px)',
          position: 'relative',
          animation: 'introRise 0.4s ease-out',
        }}
      >
        {/* Skip (top-right) */}
        <button
          type="button"
          onClick={() => finish()}
          title="Skip — ECHO keeps talking"
          style={{
            position: 'absolute', top: '14px', right: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(12,21,15,0.6)', border: '1px solid rgba(92,142,50,0.5)',
            color: '#9ab08a', borderRadius: '6px', padding: '6px 12px',
            fontFamily: "'PixelOperator', sans-serif", fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#c4e89c'; e.currentTarget.style.borderColor = 'rgba(134,190,82,0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ab08a'; e.currentTarget.style.borderColor = 'rgba(92,142,50,0.5)'; }}
        >
          <FontAwesomeIcon icon={faForward} /> Skip
        </button>

        {/* Header: ECHO avatar + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
          <img
            src={echoLogo}
            alt={ASSISTANT_NAME}
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #5c8e32', background: '#0c150f', padding: '4px', animation: 'echoPulse 2.4s ease-in-out infinite' }}
          />
          <div>
            <div style={{ color: '#86be52', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>{ASSISTANT_NAME} // Neural Uplink</div>
            <div style={{ color: '#e8f0e0', fontSize: 'clamp(22px, 4vw, 30px)', fontFamily: "'KiwiSoda', sans-serif", letterSpacing: '1px', textShadow: '0 0 12px rgba(134,190,82,0.4)' }}>
              Neural Link Established
            </div>
          </div>
        </div>

        <p style={{ color: '#cfe0c2', fontSize: '14px', lineHeight: 1.6, margin: '0 0 22px 0' }}>
          You washed ashore on an uncharted island. The crew is gone and extraction is not coming —
          your survival is now my primary directive. Here is how you stay alive:
        </p>

        {/* Objective steps with SVG icons */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '26px' }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 14px', background: 'rgba(28,51,39,0.45)', border: '1px solid rgba(92,142,50,0.35)', borderRadius: '8px' }}>
              <div style={{ flexShrink: 0, width: '38px', height: '38px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(92,142,50,0.85), rgba(45,71,21,0.9))', color: '#e8f0e0', border: '1px solid #5c8e32' }}>
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <div>
                <div style={{ color: '#c4e89c', fontSize: '15px', fontWeight: 'bold', marginBottom: '2px' }}>
                  <span style={{ color: '#86be52', marginRight: '8px' }}>{i + 1}.</span>{s.title}
                </div>
                <div style={{ color: '#9ab08a', fontSize: '13px', lineHeight: 1.5 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => finish()}
            style={{ background: 'rgba(12,21,15,0.6)', border: '1px solid rgba(92,142,50,0.5)', color: '#9ab08a', borderRadius: '8px', padding: '12px 22px', fontFamily: "'PixelOperator', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c4e89c'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9ab08a'; }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ marginRight: '8px' }} />Skip Briefing
          </button>
          <button
            type="button"
            onClick={() => finish()}
            style={{ background: 'linear-gradient(135deg, #86be52 0%, #3b6b35 100%)', border: '1px solid #5c8e32', color: '#0c150f', borderRadius: '8px', padding: '12px 28px', fontFamily: "'PixelOperator', sans-serif", fontSize: '14px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 0 18px rgba(134,190,82,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #c4e89c 0%, #5c8e32 100%)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #86be52 0%, #3b6b35 100%)'; }}
          >
            Begin Survival
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameIntroOverlay;
