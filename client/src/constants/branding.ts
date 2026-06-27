/**
 * branding.ts — Single source of truth for the in-game AI assistant's name.
 *
 * The assistant was previously branded "SOVA". All USER-VISIBLE text now reads
 * from ASSISTANT_NAME so the brand can change in one place. Internal identifiers
 * (component/hook/file names, CSS classes, generated SpacetimeDB bindings, and the
 * pre-recorded `sova_*.mp3` voice files) intentionally keep their old names — they
 * are not shown to the player and renaming them is high-churn / risky.
 *
 * NOTE: the recorded voice clips still *say* "SOVA" out loud until the audio is
 * regenerated; only on-screen text + the logo image reflect the new name.
 */
export const ASSISTANT_NAME = 'ECHO';
export const ASSISTANT_FULL_NAME = 'Emergent Cognitive Heuristic Operator';

/** Convenience: `ECHO: New Mission` style labels. */
export const assistantLabel = (suffix: string): string => `${ASSISTANT_NAME}: ${suffix}`;
