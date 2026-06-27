/**
 * NightfallCue — cinematic "the wild stirs" moment when night falls.
 *
 * Watches the shared world day/night cycle (worldState.timeOfDay). The instant the
 * world crosses into Dusk (sunset), it flashes a full-screen banner + vignette and
 * plays a distant wolf howl, so every nightfall feels like an event — the core of
 * making WILDER feel WILDER at night. A softer "Dawn" relief plays when night ends.
 *
 * Pure client / presentational: no server changes, no DB writes. Mounted in
 * GameScreenOverlayUI alongside DayNightCycleTracker (same worldState source).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWorldTable } from '../engine/react/selectors';
import { WorldState } from '../generated/types';

/** timeOfDay tag at which night begins (sunset). Matches server TimeOfDay enum. */
const NIGHTFALL_TAG = 'Dusk';
/** timeOfDay tag at which day returns. */
const DAWN_TAG = 'Dawn';

const HOWL_FILES = [
  '/sounds/ambient/ambient_wolf_howl.mp3',
  '/sounds/ambient/ambient_wolf_howl2.mp3',
  '/sounds/ambient/ambient_wolf_howl3.mp3',
];

const NIGHTFALL_LINES = [
  'The wild stirs.',
  'Stay near the fire, operative.',
  'Something moves in the dark.',
  'Keep your weapon close.',
  'The cold hunts tonight.',
];
const FULL_MOON_LINES = [
  'The wild howls under a full moon.',
  'Nothing sleeps beneath a full moon.',
  'They come in numbers tonight.',
];

type CueKind = 'nightfall' | 'fullmoon' | 'dawn';
interface Cue { kind: CueKind; title: string; subtitle: string }

/** Read the player's SFX volume (stored 0–1 or 0–100). Returns 0 when muted. */
function getSfxVolume(): number {
  try {
    const raw = localStorage.getItem('soundVolume');
    if (raw == null) return 0.7;
    const v = parseFloat(raw);
    if (Number.isNaN(v)) return 0.7;
    return v > 1 ? v / 100 : v;
  } catch {
    return 0.7;
  }
}

interface NightfallCueProps {
  isMobile?: boolean;
}

const NightfallCue: React.FC<NightfallCueProps> = ({ isMobile = false }) => {
  const worldState = useWorldTable<WorldState | null>('worldState');
  const tag = worldState?.timeOfDay?.tag ?? null;
  const isFullMoon = worldState?.isFullMoon ?? false;
  const cycleCount = worldState?.cycleCount ?? 0;

  const prevTagRef = useRef<string | null>(null);
  const lastNightfallCycleRef = useRef<number>(-1);
  const lastDawnCycleRef = useRef<number>(-1);
  const fadeTimerRef = useRef<number | null>(null);
  const clearTimerRef = useRef<number | null>(null);

  const [cue, setCue] = useState<Cue | null>(null);
  const [visible, setVisible] = useState(false);

  const showCue = useCallback(
    (next: Cue, playHowl: boolean) => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setCue(next);
      setVisible(true);
      const holdMs = next.kind === 'dawn' ? 2600 : 3800;
      fadeTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        clearTimerRef.current = window.setTimeout(() => setCue(null), 1300);
      }, holdMs);

      if (playHowl) {
        try {
          const vol = getSfxVolume();
          if (vol > 0.001) {
            const audio = new Audio(HOWL_FILES[Math.abs(cycleCount) % HOWL_FILES.length]);
            audio.volume = Math.min(1, 0.6 * vol);
            void audio.play().catch(() => {});
          }
        } catch {
          /* audio is best-effort */
        }
      }
    },
    [cycleCount],
  );

  // Fire on real day/night transitions — never on the first observation (load-in).
  useEffect(() => {
    if (!tag) return;
    const prev = prevTagRef.current;
    if (tag === prev) return;
    if (prev !== null) {
      if (tag === NIGHTFALL_TAG && lastNightfallCycleRef.current !== cycleCount) {
        lastNightfallCycleRef.current = cycleCount;
        const lines = isFullMoon ? FULL_MOON_LINES : NIGHTFALL_LINES;
        showCue(
          {
            kind: isFullMoon ? 'fullmoon' : 'nightfall',
            title: isFullMoon ? 'FULL MOON RISES' : 'NIGHTFALL',
            subtitle: lines[Math.abs(cycleCount) % lines.length],
          },
          true,
        );
      } else if (tag === DAWN_TAG && lastDawnCycleRef.current !== cycleCount) {
        lastDawnCycleRef.current = cycleCount;
        showCue({ kind: 'dawn', title: 'DAWN', subtitle: 'You survived the night.' }, false);
      }
    }
    prevTagRef.current = tag;
  }, [tag, isFullMoon, cycleCount, showCue]);

  // Dev-only preview: run `__previewNightfall()` / ('fullmoon') / ('dawn') in the console.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __previewNightfall?: (k?: CueKind) => void };
    w.__previewNightfall = (k: CueKind = 'nightfall') => {
      if (k === 'dawn') showCue({ kind: 'dawn', title: 'DAWN', subtitle: 'You survived the night.' }, false);
      else if (k === 'fullmoon') showCue({ kind: 'fullmoon', title: 'FULL MOON RISES', subtitle: FULL_MOON_LINES[0] }, true);
      else showCue({ kind: 'nightfall', title: 'NIGHTFALL', subtitle: NIGHTFALL_LINES[0] }, true);
    };
    return () => {
      try { delete w.__previewNightfall; } catch { /* noop */ }
    };
  }, [showCue]);

  useEffect(
    () => () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    },
    [],
  );

  if (!cue) return null;

  const isFM = cue.kind === 'fullmoon';
  const isDawn = cue.kind === 'dawn';
  const accent = isDawn ? '#ffce7a' : isFM ? '#9bc0ff' : '#C8A23C';
  const glow = isDawn ? 'rgba(255,206,122,0.55)' : isFM ? 'rgba(155,192,255,0.65)' : 'rgba(200,162,60,0.6)';
  const vignetteColor = isDawn ? 'rgba(40,30,12,0.28)' : isFM ? 'rgba(8,16,38,0.62)' : 'rgba(4,8,16,0.66)';

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}
    >
      <style>{`
        @keyframes nightfallTitleIn {
          0% { transform: scale(0.94); letter-spacing: 1px; opacity: 0; }
          60% { opacity: 1; }
          100% { transform: scale(1); letter-spacing: 5px; opacity: 1; }
        }
        @keyframes nightfallGlowPulse {
          0%, 100% { text-shadow: 0 0 18px var(--nf-glow), 0 4px 0 rgba(0,0,0,0.55); }
          50% { text-shadow: 0 0 34px var(--nf-glow), 0 4px 0 rgba(0,0,0,0.55); }
        }
      `}</style>

      {/* Edge vignette — screen darkens/closes in as night takes hold */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 32%, ${vignetteColor} 100%)`,
        }}
      />

      {/* Full-moon halo at top */}
      {isFM && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            width: isMobile ? '180px' : '300px',
            height: isMobile ? '180px' : '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,192,255,0.35) 0%, rgba(155,192,255,0.08) 45%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
      )}

      {/* Centered banner */}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'transform 1.2s ease',
          ['--nf-glow' as string]: glow,
        }}
      >
        <div
          style={{
            fontFamily: "'KiwiSoda', sans-serif",
            fontSize: isMobile ? '34px' : '64px',
            color: accent,
            animation: visible ? 'nightfallTitleIn 1s ease-out, nightfallGlowPulse 2.8s ease-in-out infinite' : undefined,
            textShadow: `0 0 24px ${glow}, 0 4px 0 rgba(0,0,0,0.55)`,
            margin: 0,
          }}
        >
          {cue.title}
        </div>
        <div
          style={{
            marginTop: '10px',
            fontFamily: "'PixelOperatorMono', monospace",
            fontSize: isMobile ? '12px' : '16px',
            letterSpacing: '2px',
            color: 'rgba(232,240,224,0.88)',
            textShadow: '0 2px 6px rgba(0,0,0,0.85)',
          }}
        >
          {cue.subtitle}
        </div>
        {/* Skull-arrow flourish echoing the WILDER logo */}
        <div
          style={{
            marginTop: '14px',
            color: accent,
            opacity: 0.75,
            fontSize: isMobile ? '11px' : '15px',
            letterSpacing: '8px',
          }}
        >
          ◄ ◆ ►
        </div>
      </div>
    </div>
  );
};

export default NightfallCue;
