import { ASSET_RECOLOR } from '../../config/assetRecolor';

// Recolors world-asset spritesheets with a Photoshop-style "Hue" blend, baked
// once per (image, color) and cached. The player, human NPCs, wild animals,
// fire/light and the HUD never reach here, so they keep their original colors.

type Drawable = HTMLImageElement | HTMLCanvasElement;

// Resolve the hue color (or null = don't tint) for a given image src. Cached per src.
const srcColorCache = new Map<string, string | null>();
function colorForSrc(src: string): string | null {
  const cached = srcColorCache.get(src);
  if (cached !== undefined) return cached;

  const lower = src.toLowerCase();
  let result: string | null;
  if (ASSET_RECOLOR.excludePatterns.some((p) => lower.includes(p))) {
    result = null; // warm fire/light bodies stay natural
  } else {
    const cat = ASSET_RECOLOR.categories.find((c) => c.patterns.some((p) => lower.includes(p)));
    result = cat ? cat.color : ASSET_RECOLOR.baseColor;
  }
  srcColorCache.set(src, result);
  return result;
}

// Bake a hue-blended copy of an image, preserving its alpha. Cached per (image, color).
const bakeCache = new WeakMap<Drawable, Map<string, HTMLCanvasElement>>();
function bakeHueTint(img: Drawable, color: string): HTMLCanvasElement | null {
  const w = (img as HTMLImageElement).naturalWidth || img.width;
  const h = (img as HTMLImageElement).naturalHeight || img.height;
  if (!w || !h) return null;

  let perColor = bakeCache.get(img);
  if (!perColor) {
    perColor = new Map();
    bakeCache.set(img, perColor);
  }
  const cached = perColor.get(color);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d');
  if (!c) return null;

  c.drawImage(img, 0, 0);
  c.globalCompositeOperation = 'hue';   // take the target hue, keep sprite luminance/saturation
  c.fillStyle = color;
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'destination-in'; // re-apply original alpha mask
  c.drawImage(img, 0, 0);
  c.globalCompositeOperation = 'source-over';

  perColor.set(color, canvas);
  return canvas;
}

/** Returns a hue-tinted drawable for a world asset, or the original image if no tint applies. */
export function getTintedDrawable(img: Drawable, src: string): Drawable {
  if (!ASSET_RECOLOR.enabled || !src) return img;
  const color = colorForSrc(src);
  if (!color) return img;
  return bakeHueTint(img, color) ?? img;
}
