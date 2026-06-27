import { GAME_COLOR_OVERLAY, GameColorBlendMode } from '../../config/gameColorOverlay';
import { ASSET_RECOLOR } from '../../config/assetRecolor';

// Map our CSS-style blend names to canvas globalCompositeOperation values.
const BLEND_TO_COMPOSITE: Record<GameColorBlendMode, GlobalCompositeOperation> = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  'soft-light': 'soft-light',
  hue: 'hue',
  color: 'color',
};

/**
 * Recolors the rendered WORLD canvas in-place so the game reads as its own
 * reskin. This runs as a world render pass (not a DOM layer), so every HUD/UI
 * panel naturally draws on top and keeps its original colors. Configure the
 * look in config/gameColorOverlay.ts.
 */
export function renderWorldColorOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const { enabled, color, opacity, blendMode } = GAME_COLOR_OVERLAY;
  if (!enabled || opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, opacity));
  ctx.globalCompositeOperation = BLEND_TO_COMPOSITE[blendMode] ?? 'source-over';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

/**
 * Dark-fantasy recolor for the GROUND TERRAIN. Call this after the ground/tile
 * layer is drawn but BEFORE world entities, so it hue-shifts only the terrain.
 * Uses a 'hue' blend so each tile keeps its own brightness. See config/assetRecolor.ts.
 */
export function renderTerrainColorOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
): void {
  if (!ASSET_RECOLOR.enabled || !ASSET_RECOLOR.terrain.enabled) return;
  ctx.save();
  ctx.globalCompositeOperation = 'hue';
  ctx.fillStyle = ASSET_RECOLOR.terrain.color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}
