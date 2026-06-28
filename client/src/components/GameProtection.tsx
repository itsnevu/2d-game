import React, { useEffect, useRef, useState } from 'react';
import { GAME_PROTECTION } from '../config/gameProtection';

/**
 * Anti-inspect / anti-screenshot deterrents. See config/gameProtection.ts for
 * the (honest) caveats — these deter casual inspection/capture, they do not
 * truly prevent it (no web app can).
 *
 * Renders a full-screen blackout "shield" when DevTools is detected open, the
 * window loses focus, or a screenshot key is pressed.
 */
const GameProtection: React.FC = () => {
  const cfg = GAME_PROTECTION;
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const [focusLost, setFocusLost] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Block context menu + inspect/view-source keyboard shortcuts ---
  useEffect(() => {
    if (!cfg.enabled) return;

    const onContextMenu = (e: MouseEvent) => {
      if (cfg.blockContextMenu) e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (cfg.blockDevtoolsShortcuts) {
        // F12
        if (e.key === 'F12') { e.preventDefault(); return; }
        // Ctrl/Cmd+Shift+I / J / C  (inspector, console, element picker)
        if (mod && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
          e.preventDefault(); return;
        }
        // Ctrl/Cmd+U (view source), Ctrl/Cmd+S (save page)
        if (mod && (key === 'u' || key === 's')) { e.preventDefault(); return; }
      }
    };

    const onKeyUpDown = (e: KeyboardEvent) => {
      if (cfg.deterScreenshots && (e.key === 'PrintScreen' || e.key === 'Snapshot')) {
        // Best-effort: clobber whatever the OS just put on the clipboard.
        try { navigator.clipboard?.writeText('').catch(() => {}); } catch { /* ignore */ }
        triggerFlash();
      }
    };

    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUpDown, true);
    window.addEventListener('keydown', onKeyUpDown, true);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUpDown, true);
      window.removeEventListener('keydown', onKeyUpDown, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Blank the game when the TAB is hidden (minimized / switched away) ---
  // NOTE: we intentionally key off document visibility, NOT window `blur`.
  // A `blur` also fires when a browser-extension popup (e.g. the Phantom wallet
  // approve/sign dialog) or the address bar takes focus while the tab is still
  // fully visible. Blacking out then makes wallet login look like it hangs on a
  // black "Paused" screen that never clears (the page often does not get a
  // matching `focus` back after an extension popup closes). visibilitychange
  // only fires on real tab-switch / minimize, which is what we actually want to
  // hide for — and it self-clears the instant the tab is visible again.
  useEffect(() => {
    if (!cfg.enabled || !cfg.hideOnFocusLoss) return;

    const onVisibility = () => setFocusLost(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility(); // sync initial state
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Heuristic DevTools-open detection (window chrome size delta) ---
  useEffect(() => {
    if (!cfg.enabled || !cfg.detectDevtools) return;

    const THRESHOLD = 170; // px of "missing" viewport that suggests a docked panel
    const check = () => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      setDevtoolsOpen(widthGap > THRESHOLD || heightGap > THRESHOLD);
    };
    check();
    const id = window.setInterval(check, 800);
    window.addEventListener('resize', check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('resize', check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Disable text selection + image dragging app-wide ---
  useEffect(() => {
    if (!cfg.enabled || !cfg.disableSelection) return;
    const style = document.createElement('style');
    style.setAttribute('data-game-protection', 'true');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      img, canvas { -webkit-user-drag: none; user-drag: none; }
      /* Keep typing/selection working in text fields (chat, login, etc.) */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerFlash = () => {
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 1200);
  };
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  if (!cfg.enabled) return null;

  const shieldVisible = devtoolsOpen || focusLost || flash;
  if (!shieldVisible) return null;

  const message = devtoolsOpen
    ? 'Developer tools detected. Close them to continue.'
    : flash
      ? 'Screen capture is disabled.'
      : 'Paused';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647, // above everything, including the color overlay
        background: '#05070a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ab08a',
        fontFamily: "'PixelOperatorMono', monospace",
        fontSize: '16px',
        letterSpacing: '1px',
        textAlign: 'center',
        padding: '24px',
        userSelect: 'none',
      }}
    >
      {message}
    </div>
  );
};

export default GameProtection;
