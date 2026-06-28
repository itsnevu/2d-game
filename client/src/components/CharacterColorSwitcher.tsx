/**
 * CharacterColorSwitcher — in-game button to change the player's character/skin color.
 *
 * Existing players can't re-pick on the login screen (that picker is new-players only),
 * so this small HUD control lets them switch any time. It calls registerPlayer(username, id)
 * — the server reducer updates character_id for an already-registered identity — and the new
 * tint shows up live via the normal Player subscription (no reload needed).
 */
import React, { useState } from 'react';
import { CHARACTERS } from '../constants/characters';
import heroIdle from '../assets/hero_idle.png';

interface CharacterColorSwitcherProps {
  username: string;
  currentCharacterId: number;
  registerPlayer: (username: string, characterId?: number) => Promise<void>;
}

const ACCENT = '#86be52';

export const CharacterColorSwitcher: React.FC<CharacterColorSwitcherProps> = ({
  username,
  currentCharacterId,
  registerPlayer,
}) => {
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);

  const pick = async (id: number) => {
    if (applying !== null) return;
    setApplying(id);
    try {
      await registerPlayer(username, id);
    } catch (err) {
      console.error('[CharacterColorSwitcher] Failed to change character:', err);
    } finally {
      setApplying(null);
    }
  };

  const thumb = (filter: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    backgroundImage: `url(${heroIdle})`,
    backgroundSize: '400% 400%',
    backgroundPosition: '0% 0%',
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    filter: filter || 'none',
  });

  return (
    <div style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 9000, fontFamily: "'PixelOperator', sans-serif" }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: '56px',
            width: '252px',
            padding: '12px',
            background: 'rgba(12,21,15,0.94)',
            border: `1px solid ${ACCENT}66`,
            borderRadius: '12px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#c4e89c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Ganti Warna Karakter
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {CHARACTERS.map((c) => {
              const selected = currentCharacterId === c.id;
              const busy = applying === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id)}
                  title={c.name}
                  disabled={applying !== null}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '5px 2px',
                    cursor: applying !== null ? 'wait' : 'pointer',
                    background: selected ? `${ACCENT}2e` : 'rgba(255,255,255,0.04)',
                    border: selected ? `2px solid ${ACCENT}` : '1px solid rgba(146,178,128,0.3)',
                    borderRadius: '8px',
                    opacity: busy ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={thumb(c.filter)} />
                  <span style={{ fontSize: '8px', color: selected ? '#c4e89c' : 'rgba(232,240,224,0.7)', textTransform: 'uppercase' }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Ganti warna karakter"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: `1px solid ${ACCENT}66`,
          background: open ? `${ACCENT}2e` : 'rgba(12,21,15,0.85)',
          color: '#c4e89c',
          cursor: 'pointer',
          fontSize: '20px',
          lineHeight: 1,
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🎨
      </button>
    </div>
  );
};

export default CharacterColorSwitcher;
