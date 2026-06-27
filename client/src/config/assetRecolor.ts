// ============================================================================
// DARK-FANTASY-DUNGEON ASSET RECOLOR
// ============================================================================
// Recolors world assets with a "Hue" blend (takes the target hue, keeps each
// sprite's own shading/saturation, so detail survives). Matching is by image
// filename substring, so it works in dev and in hashed production builds.
//
// What gets recolored: trees, grass, plants, stone/rocks/cairns, structures,
//   ground terrain, and hostile MONSTERS.
// What stays original (never recolored): the player + human NPCs, wild ANIMALS,
//   fire/light (campfire/furnace/torch/lantern — excluded below), and the HUD.
//
// Tweak freely: add a category, change a hex, or flip `enabled`.

export interface RecolorCategory {
  /** lowercase substrings matched against the image src/filename */
  patterns: string[];
  /** target hue color for this category */
  color: string;
}

export interface AssetRecolorConfig {
  enabled: boolean;
  /** Fallback hue for any recolorable asset not matched by a category. */
  baseColor: string;
  /** Per-type hue overrides (first match wins). */
  categories: RecolorCategory[];
  /** Image srcs that must NEVER be tinted (warm fire/light bodies). */
  excludePatterns: string[];
  /** Hostile creatures (animal.isHostileNpc) — tinted via a CSS filter. */
  monster: { enabled: boolean; filter: string };
  /** Ground terrain layer — one cohesive hue pass under the entities. */
  terrain: { enabled: boolean; color: string };
}

export const ASSET_RECOLOR: AssetRecolorConfig = {
  enabled: true,
  baseColor: '#38454e', // cold slate — generic structures, props, misc
  categories: [
    // Foliage → deep teal-green (lightless, sickly forest)
    { color: '#2f4f47', patterns: ['spruce', 'birch', 'hemlock', 'pine', 'willow', 'tree', 'grass', 'coral', 'fern', 'reed', 'kelp', 'bush'] },
    // Stone → slate-blue (damp dungeon rock)
    { color: '#3a4658', patterns: ['stone', 'rock', 'cairn', 'rune', 'basalt', 'sea_stack', 'seastack', 'boulder', 'quarry'] },
    // Fungi → necrotic violet (eerie, faintly arcane)
    { color: '#3c2f63', patterns: ['mushroom', 'chanterelle', 'porcini', 'agaric', 'morel', 'toadstool'] },
  ],
  excludePatterns: ['campfire', 'barbecue', 'furnace', 'hearth', 'lantern', 'torch', 'brazier', 'candle', 'fire'],
  monster: { enabled: true, filter: 'hue-rotate(200deg) saturate(1.3) brightness(0.9)' }, // void/dread cast
  terrain: { enabled: true, color: '#33384a' }, // cold ash dungeon floor
};
