// ============================================================================
// GAME PROTECTION (anti-inspect / anti-screenshot deterrents)
// ============================================================================
// IMPORTANT / HONEST CAVEAT:
// A web page can NOT truly prevent DevTools or screenshots. The browser and the
// OS always win — a user can open DevTools before the page loads, use a remote
// debugger, or take an OS-level screenshot that no web API can intercept.
// Everything here is a DETERRENT that stops casual inspection/capture, not a
// guarantee. For real asset protection, keep secrets on the server.
//
// Toggle individual deterrents below. To only protect production builds, set:
//     enabled: import.meta.env.PROD,

export interface GameProtectionConfig {
  /** Master on/off switch. */
  enabled: boolean;
  /** Disable the right-click context menu. */
  blockContextMenu: boolean;
  /** Swallow F12 / Ctrl+Shift+I/J/C / Ctrl+U / Ctrl+S inspect shortcuts. */
  blockDevtoolsShortcuts: boolean;
  /** Blank the screen when DevTools is heuristically detected as open. */
  detectDevtools: boolean;
  /** Wipe the clipboard when PrintScreen is pressed + flash a blackout. */
  deterScreenshots: boolean;
  /** Black out the game when the window loses focus or is hidden. */
  hideOnFocusLoss: boolean;
  /** Disable text selection / image dragging across the app. */
  disableSelection: boolean;
}

export const GAME_PROTECTION: GameProtectionConfig = {
  enabled: true,
  blockContextMenu: true,
  blockDevtoolsShortcuts: true,
  detectDevtools: true,
  deterScreenshots: true,
  hideOnFocusLoss: true,
  disableSelection: true,
};
