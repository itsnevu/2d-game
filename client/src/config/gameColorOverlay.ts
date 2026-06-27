// ============================================================================
// GLOBAL GAME COLOR OVERLAY
// ============================================================================
// Single source of truth for the screen-wide color overlay. This tints the
// ENTIRE game (world canvas + HUD) so the build reads as its own distinct
// reskin instead of looking like the original starter project.
//
// Tweak these four values to taste — nothing else needs to change.
//   - color:     the tint hue applied over everything
//   - opacity:   0 = invisible, 1 = full strength
//   - blendMode: how the tint mixes with what's underneath
//       'color'      -> true recolor: takes the tint's hue+saturation, keeps
//                       original brightness (everything becomes one palette)
//       'hue'        -> recolor hue only, keeps original saturation+brightness
//       'overlay' / 'soft-light' -> mood tint that preserves original hues
//       'multiply'   -> darken toward the tint
//       'normal'     -> a flat translucent veil
//   - enabled:   master on/off switch

export type GameColorBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hue'
  | 'color';

export interface GameColorOverlayConfig {
  enabled: boolean;
  color: string;
  opacity: number;
  blendMode: GameColorBlendMode;
}

export const GAME_COLOR_OVERLAY: GameColorOverlayConfig = {
  // Replaced by the per-asset dark-fantasy recolor (config/assetRecolor.ts).
  // Flip back to true for a single flat world tint instead.
  enabled: false,
  color: '#1d6e3a',
  opacity: 0.2,
  blendMode: 'color',
};
