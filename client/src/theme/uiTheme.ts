/**
 * uiTheme.ts — Single source of truth for the in-game HUD visual identity.
 *
 * One unified "Neural Survival" theme (green). Every in-game HUD component
 * (Neural Uplink, Chat, Hotbar, status bars, quests, minimap, ECHO voice box,
 * debug console, spectator banner, …) should pull its colors / fonts from here
 * instead of redeclaring private constants. This eliminates the previous mix of
 * cyan/purple/gold/Material palettes and the three competing font stacks.
 *
 * Keep this file in sync with theme/tokens.css (the CSS-variable mirror used by
 * .css / .module.css files that can't import TS).
 */

/* ── Fonts (all already @font-face'd in index.html) ────────────────────────── */
export const FONT_UI = "'PixelOperator', sans-serif";        // labels, body, buttons
export const FONT_MONO = "'PixelOperatorMono', monospace";   // numbers, data readouts, terminal
export const FONT_BRAND = "'KiwiSoda', sans-serif";          // titles / logo flourish only

/* ── Palette ───────────────────────────────────────────────────────────────── */
export const COLORS = {
  // Surfaces (replaces the old purple rgba(30,15,50) / gray panels)
  bg900: '#0c150f',          // deepest base
  bg800: '#101e16',          // standard panel background
  bg700: '#15281e',          // raised surface / header bar
  bg600: '#1c3327',          // hover / selected surface

  // Structure
  border: '#5c8e32',         // standard panel border (dominant existing green)
  borderInner: '#2d4715',    // inset / secondary border
  borderDim: 'rgba(92,142,50,0.35)',

  // Accents
  accent: '#86be52',         // primary accent / interactive
  accentBright: '#c4e89c',   // highlight, active, success
  accentGlow: 'rgba(134,190,82,0.45)',  // replaces ALL old cyan rgba(0,170,255) glows
  accentGlowStrong: 'rgba(134,190,82,0.7)',

  // Text
  textPrimary: '#e8f0e0',
  textDim: '#9ab08a',
  textFaint: 'rgba(232,240,224,0.55)',

  // Semantic
  warn: '#ffc83c',           // warnings, "available" quests, spectator banner, gold accents
  warnDim: 'rgba(255,200,60,0.5)',
  danger: '#f87171',         // damage, threats, enemies
  good: '#86be52',           // success (alias of accent)
  whisper: '#d488ff',        // single reserved chat-channel accent (was pink+lime+gold)
  team: '#86be52',           // team chat -> reuse accent

  // Shadows
  panelShadow: '0 8px 24px rgba(0,0,0,0.55)',
  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
} as const;

/* ── Convenience composites (common patterns reused across components) ───────── */
export const UI = {
  font: FONT_UI,
  fontMono: FONT_MONO,
  fontBrand: FONT_BRAND,

  // Panel chrome
  panelBg: `linear-gradient(135deg, ${COLORS.bg800} 0%, ${COLORS.bg900} 100%)`,
  panelBgSolid: COLORS.bg800,
  panelBorder: `1px solid ${COLORS.border}`,
  panelBorder2: `2px solid ${COLORS.border}`,
  panelRadius: '10px',
  panelShadow: COLORS.panelShadow,

  // Text
  text: COLORS.textPrimary,
  textDim: COLORS.textDim,
  textShadow: COLORS.textShadow,

  // Accents / state
  accent: COLORS.accent,
  accentBright: COLORS.accentBright,
  glow: COLORS.accentGlow,
  border: COLORS.border,
  borderInner: COLORS.borderInner,
  warn: COLORS.warn,
  danger: COLORS.danger,

  // Buttons
  buttonBg: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.borderInner} 100%)`,
  buttonText: '#0c150f',
} as const;

export default UI;
