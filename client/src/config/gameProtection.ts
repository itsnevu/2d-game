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
  // PROD-only: deterrents stay off during local dev (localhost / vite) so DevTools,
  // the Phantom wallet popup, alt-tab, etc. never black out the screen while you
  // build, and turn on automatically in the deployed production build.
  enabled: import.meta.env.PROD,
  blockContextMenu: true,
  blockDevtoolsShortcuts: true,
  // OFF: the size-delta heuristic blacks out the game with "Developer tools
  // detected. Close them to continue." for legit players and gives them no way
  // out. It can't tell a docked DevTools panel apart from ordinary chrome that
  // grows the outer/inner gap *after* load — most commonly PAGE ZOOM (Ctrl+= or
  // Ctrl+mouse-wheel; e.g. 150% on 1080p shrinks the viewport ~600px, dwarfing
  // any threshold), but also exiting fullscreen (F11), dragging the window to a
  // monitor with different scaling, or showing the bookmarks/downloads bar. Once
  // the gap inflates, the learned baseline never recovers, so the blackout
  // sticks until reload — and because the inspect shortcuts are blocked, it
  // feels like the game randomly froze. DevTools blocking is only ever a
  // deterrent (anyone can open DevTools before load or via a remote debugger),
  // so the shortcut-swallowing below is enough; the unrecoverable blackout costs
  // far more than it protects. Flip back to true only if the heuristic in
  // GameProtection.tsx is reworked to be zoom/fullscreen-aware.
  detectDevtools: false,
  deterScreenshots: true,
  hideOnFocusLoss: true,
  disableSelection: true,
};
