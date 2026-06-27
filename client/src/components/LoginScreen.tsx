/**
 * LoginScreen.tsx
 * 
 * Displays the initial welcome/login screen.
 * Handles:
 *  - Displaying game title and logo.
 *  - Triggering OpenAuth OIDC login flow.
 *  - Input field for username (for NEW players).
 *  - Displaying existing username for returning players.
 *  - Displaying loading states and errors.
 *  - Handling logout.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Import the Player type from generated bindings
import { Player } from '../generated/types'; // Adjusted path
// Import FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faBars, faTimes, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import loginBackground from '../assets/ui/login_background.jpg';
import heroIdle from '../assets/hero_idle.png';
import { CHARACTERS } from '../constants/characters';
// Using direct public path for video to avoid Vite import errors



export const theme = {
    palette: {
        background: {
            default: '#000000',
            dark: '#1a1a1a',
            light: '#000000',
        },
        text: {
            primary: '#ffffff',
            secondary: '#cccccc',
        },
        accent: '#00e5ff',
    },
    typography: {
        useNextVariants: true,
        fontFamily: [
            'system-ui',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Oxygen',
            'Ubuntu',
            'Cantarell',
            'Open Sans',
            'Helvetica Neue',
            'sans-serif',
        ].join(','),
    },
    layout: {
        containerMaxWidth: '1400px',
        sectionPadding: '0px',
        headerHeight: '70px',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        html, body {
          minHeight: '100vh', // Ensure page is tall enough to scroll
          width: '100%', // Match the background image width exactly
          margin: 0,
          padding: 0,
          backgroundColor: '#000000', // Pure black background to match gradient
          backgroundAttachment: 'scroll',
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          color: 'white',
          position: 'relative',
          overflowX: 'hidden', // Prevent horizontal scrolling
          overflowY: 'auto', // Allow vertical scrolling
          boxSizing: 'border-box', // Include padding and border in width calculations
          isolation: 'isolate',
          display: 'flex', // Add flex to push footer to bottom
          flexDirection: 'column', // Column layout
        }
      `,
        },
    },
};
import logo from '../assets/ui/logo_alt.png';
import ShipwreckCarousel from './ShipwreckCarousel';
import GameplayFeaturesCarousel from './GameplayFeaturesCarousel';
// @ts-ignore - importing JavaScript module
import { blogPosts } from '../blog/data/blogPosts';
import bs58 from 'bs58';

const UI_BRAND_FONT = "'KiwiSoda', sans-serif";

// Style Constants (Consider moving to a shared file)
const UI_BG_COLOR = 'rgba(40, 40, 60, 0.85)';
const UI_BORDER_COLOR = '#a0a0c0';
const UI_SHADOW = '2px 2px 0px rgba(0,0,0,0.5)';
const UI_FONT_FAMILY = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
const UI_BUTTON_COLOR = '#777';
const UI_BUTTON_DISABLED_COLOR = '#555';
const UI_PAGE_BG_COLOR = '#1a1a2e';

// Mobile Navigation Menu Component
interface MobileNavMenuProps {
    navItems: Array<{ label: string; selector: string }>;
    onNavigate: (selector: string) => void;
    onPlayClick: () => void;
    /** When provided, shows signed-in email and logout at top of menu */
    userEmail?: string | null;
    onLogout?: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ navItems, onNavigate, onPlayClick, userEmail, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleNavClick = (selector: string) => {
        setIsOpen(false);
        onNavigate(selector);
    };

    const handlePlayClick = () => {
        setIsOpen(false);
        onPlayClick();
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    zIndex: 1001,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#5c8e32';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                }}
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 1000,
                            animation: 'fadeIn 0.2s ease-out',
                        }}
                    />

                    {/* Menu Panel */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '70px',
                            right: 0,
                            width: '280px',
                            maxWidth: '85vw',
                            height: 'calc(100vh - 70px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.98)',
                            backdropFilter: 'blur(20px)',
                            borderLeft: '2px solid rgba(92, 142, 50, 0.3)',
                            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '20px 0',
                            animation: 'slideInRight 0.3s ease-out',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Account section - when signed in */}
                        {userEmail && onLogout && (
                            <div style={{
                                padding: '0 24px 16px',
                                marginBottom: '12px',
                                borderBottom: '1px solid rgba(92, 142, 50, 0.2)',
                            }}>
                                <p style={{
                                    fontSize: '11px',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    margin: '0 0 4px 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>
                                    Signed in as
                                </p>
                                <p style={{
                                    fontSize: '13px',
                                    color: 'rgba(92, 142, 50, 0.95)',
                                    margin: '0 0 12px 0',
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace',
                                }}>
                                    {userEmail}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setIsOpen(false); onLogout(); }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        background: 'rgba(45, 71, 21, 0.15)',
                                        border: '1px solid rgba(45, 71, 21, 0.4)',
                                        borderRadius: '6px',
                                        color: 'rgba(255, 150, 180, 0.95)',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(45, 71, 21, 0.25)';
                                        e.currentTarget.style.borderColor = 'rgba(45, 71, 21, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(45, 71, 21, 0.15)';
                                        e.currentTarget.style.borderColor = 'rgba(45, 71, 21, 0.4)';
                                    }}
                                >
                                    Log out
                                </button>
                            </div>
                        )}

                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavClick(item.selector)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: '16px 24px',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderLeft: '3px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#5c8e32';
                                    e.currentTarget.style.backgroundColor = 'rgba(92, 142, 50, 0.1)';
                                    e.currentTarget.style.borderLeftColor = '#5c8e32';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderLeftColor = 'transparent';
                                }}
                            >
                                {item.label}
                            </button>
                        ))}

                        {/* PLAY Button in Menu */}
                        <button
                            onClick={handlePlayClick}
                            style={{
                                background: 'linear-gradient(135deg, #5c8e32, #2d4715)',
                                color: 'white',
                                border: '1px solid rgba(134, 190, 82, 0.3)',
                                borderRadius: '6px',
                                padding: '16px 24px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: '0 4px 12px rgba(92, 142, 50, 0.3)',
                                transition: 'all 0.2s ease',
                                margin: '20px 24px 0',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #86be52, #3b6320)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(92, 142, 50, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #5c8e32, #2d4715)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 142, 50, 0.3)';
                            }}
                        >
                            PLAY
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

interface LoginScreenProps {
    // Removed username/setUsername props
    handleJoinGame: (usernameToRegister: string | null, characterId?: number) => Promise<void>; // Accepts null for existing players, returns Promise to handle errors
    handleSpectateGame?: () => void | Promise<void>;
    loggedInPlayer: Player | null; // Player data from SpacetimeDB if exists
    connectionError?: string | null; // SpacetimeDB connection error from GameConnectionContext
    storedUsername?: string | null; // Username from localStorage for connection error fallback
    isSpacetimeConnected?: boolean; // Whether SpacetimeDB is connected (used to hide username for connection issues)
    isSpacetimeReady?: boolean; // Whether SpacetimeDB is fully ready (connection + identity established)
    retryConnection?: () => void; // Function to retry the SpacetimeDB connection
    onlinePlayerCount?: number; // Live count of connected human players
    maxPlayerCount?: number; // Server capacity (e.g. 50)
}

const LoginScreen: React.FC<LoginScreenProps> = ({
    handleJoinGame,
    handleSpectateGame,
    loggedInPlayer,
    connectionError,
    storedUsername,
    isSpacetimeConnected = true, // Default to true for backwards compatibility
    isSpacetimeReady = true, // Default to true for backwards compatibility
    retryConnection,
    onlinePlayerCount,
    maxPlayerCount,
}) => {
    // Get OpenAuth state and functions
    const {
        userProfile, // Contains { userId } after successful login 
        isAuthenticated,
        setIsSpectator,
        isLoading: authIsLoading,
        authError,
        loginRedirect,
        logout,
        loginWithWallet
    } = useAuth();

    // React Router navigation hook
    const navigate = useNavigate();

    // Local state for the username input field (only used for new players)
    const [inputUsername, setInputUsername] = useState<string>('');
    const [selectedCharacterId, setSelectedCharacterId] = useState<number>(0);
    const [localError, setLocalError] = useState<string | null>(null);
    const [simulatedWldrBalance, setSimulatedWldrBalance] = useState<number | null>(null);

    const computeSimulatedBalance = (publicKey: string): number => {
        let hash = 0;
        for (let i = 0; i < publicKey.length; i += 1) {
            hash = (hash * 31 + publicKey.charCodeAt(i)) >>> 0;
        }
        return hash % 2000;
    };

    const handleWalletLogin = async () => {
        setLocalError(null);
        try {
            // Newer Phantom injects at window.phantom.solana; older builds expose window.solana.
            const provider = (window as any).phantom?.solana ?? (window as any).solana;
            if (!provider || (!provider.isPhantom && typeof provider.connect !== 'function')) {
                throw new Error("Solana wallet not found. Install Phantom or Solflare, then refresh the page.");
            }
            
            const connectResponse = await provider.connect().catch((e: any) => {
                throw new Error(/reject/i.test(e?.message || '') ? "Wallet connection was rejected." : (e?.message || "Could not open the wallet."));
            });
            const publicKey = connectResponse?.publicKey ?? provider.publicKey;
            const publicKeyStr = publicKey?.toString?.();
            if (!publicKeyStr) {
                throw new Error("Could not read your wallet address. Unlock the wallet and try again.");
            }
            const balance = computeSimulatedBalance(publicKeyStr);
            setSimulatedWldrBalance(balance);
            
            const timestamp = Math.floor(Date.now() / 1000);
            const messageStr = `Sign this message to log into WILDER.\nChallenge: ${timestamp}`;
            const encodedMessage = new TextEncoder().encode(messageStr);
            // Phantom returns { signature: Uint8Array }; some wallets return the bytes directly.
            const signResponse = await provider.signMessage(encodedMessage).catch((e: any) => {
                throw new Error(/reject/i.test(e?.message || '') ? "Signature request was rejected." : (e?.message || "Could not sign the login message."));
            });
            let sigBytes: any = signResponse?.signature ?? signResponse;
            if (sigBytes && !(sigBytes instanceof Uint8Array)) {
                sigBytes = new Uint8Array(Object.values(sigBytes as Record<string, number>));
            }
            if (!sigBytes || sigBytes.length === 0) {
                throw new Error("Wallet returned an empty signature.");
            }
            const signatureStr = bs58.encode(sigBytes);

            await loginWithWallet(publicKeyStr, signatureStr, messageStr);
            // A successful wallet login ALWAYS enters the game as a player.
            // Spectator mode is reserved for visitors who have NOT connected a wallet.
            setIsSpectator(false);
        } catch (err: any) {
            console.error("[LoginScreen] Wallet authentication failed:", err);
            const raw = err?.message || String(err);
            const friendly = /failed to fetch|networkerror|load failed/i.test(raw)
                ? "Cannot reach the login server. Make sure the auth server is running (localhost:4001) and try again."
                : (raw || "Wallet sign-in cancelled or failed.");
            setLocalError(friendly);
        }
    };

    // Debug logging for new users (enable when debugging)
    // React.useEffect(() => {
    //     if (isAuthenticated && !loggedInPlayer && !storedUsername) {
    //         console.log(`[LoginScreen DEBUG] New user state - isSpacetimeReady: ${isSpacetimeReady}, isSpacetimeConnected: ${isSpacetimeConnected}, connectionError: ${connectionError}`);
    //     }
    // }, [isAuthenticated, loggedInPlayer, storedUsername, isSpacetimeReady, isSpacetimeConnected, connectionError]);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
    const [showStickyNav, setShowStickyNav] = useState<boolean>(false);
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState<boolean>(false);
    const [logoLoaded, setLogoLoaded] = useState<boolean>(false);

    // --- Scroll-based Auth Header Visibility ---
    const [showAuthHeader, setShowAuthHeader] = useState<boolean>(true);
    const lastScrollY = useRef<number>(0);

    // Ref for username input focus
    const usernameInputRef = useRef<HTMLInputElement>(null);

    // Ref for video element (smooth loop)
    const videoRef = useRef<HTMLVideoElement>(null);

    // Gleam animation hook for "Learn More" button
    const [isGleaming, setIsGleaming] = useState(false);
    const [showSystemRequirements, setShowSystemRequirements] = useState(false);
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
    useEffect(() => {
        const interval = 3200;
        const duration = 600;
        const gleamTimeouts: NodeJS.Timeout[] = [];
        let mounted = true;

        function triggerGleam() {
            if (!mounted) return;
            setIsGleaming(true);
            gleamTimeouts.push(setTimeout(() => {
                if (mounted) setIsGleaming(false);
            }, duration));
        }

        const mainInterval = setInterval(triggerGleam, interval);
        // Initial gleam after 700ms
        gleamTimeouts.push(setTimeout(triggerGleam, 700));

        return () => {
            mounted = false;
            clearInterval(mainInterval);
            gleamTimeouts.forEach(clearTimeout);
        };
    }, []);

    // Check for mobile screen size
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile(); // Check on mount
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // Check scroll position for back to top button, sticky nav, and auth header
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const currentScrollY = window.scrollY;

            setShowBackToTop(scrollTop > 300); // Show after scrolling 300px
            setShowStickyNav(scrollTop > window.innerHeight * 0.8); // Show after scrolling past 80% of viewport height
            setIsScrolled(scrollTop > 20); // Add scrolled state when page is scrolled past 20px

            // Auth header visibility logic
            if (currentScrollY < 50) {
                setShowAuthHeader(true);
            }
            // Hide header when scrolling down
            else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setShowAuthHeader(false);
            }
            // Show header when scrolling up
            else if (currentScrollY < lastScrollY.current) {
                setShowAuthHeader(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Aggressive image preloading and loading detection
    useEffect(() => {
        // Preload background image with loading detection
        const backgroundImg = new Image();
        backgroundImg.onload = () => setBackgroundLoaded(true);
        backgroundImg.src = loginBackground;

        // Preload logo with loading detection
        const logoImg = new Image();
        logoImg.onload = () => setLogoLoaded(true);
        logoImg.src = logo;

        // Add preload hints to DOM for additional browser optimization
        const preloadBackground = document.createElement('link');
        preloadBackground.rel = 'preload';
        preloadBackground.href = loginBackground;
        preloadBackground.as = 'image';
        preloadBackground.fetchPriority = 'high';
        document.head.appendChild(preloadBackground);

        const preloadLogo = document.createElement('link');
        preloadLogo.rel = 'preload';
        preloadLogo.href = logo;
        preloadLogo.as = 'image';
        preloadLogo.fetchPriority = 'high';
        document.head.appendChild(preloadLogo);

        // Cleanup
        return () => {
            try {
                document.head.removeChild(preloadBackground);
                document.head.removeChild(preloadLogo);
            } catch (e) {
                // Elements might already be removed
            }
        };
    }, []);

    // Autofocus username field if authenticated AND it's a new player
    useEffect(() => {
        if (isAuthenticated && !loggedInPlayer) {
            usernameInputRef.current?.focus();
        }
    }, [isAuthenticated, loggedInPlayer]);

    // Smooth scroll function with offset for sticky nav
    const smoothScrollTo = (elementSelector: string) => {
        const element = document.querySelector(elementSelector);
        if (element) {
            const yOffset = -100; // Offset to account for sticky nav (70px) + extra padding (30px)
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset + yOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Validation: only needed for new players entering a username
    const validateNewUsername = (): boolean => {
        if (!inputUsername.trim()) {
            setLocalError('Username is required to join the game');
            return false;
        }
        // Add other validation rules if needed (length, characters, etc.)
        setLocalError(null);
        return true;
    };

    // Handle button click: Trigger OpenAuth login or join game
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null); // Clear previous local errors

        if (!isAuthenticated) {
            // If not authenticated, start the OpenAuth login flow
            await loginRedirect();
        } else {
            // If authenticated, check if it's a new or existing player.
            // NOTE: a connected wallet always JOINS as a player — the simulated
            // $WLDR balance is shown for flavor only and never forces spectator mode.

            // CRITICAL CHECK: If authenticated but an authError exists, do not proceed.
            // This typically means a token was rejected, and invalidateCurrentToken should have
            // set isAuthenticated to false. If not, this is a safeguard.
            if (authError) {
                console.warn("[LoginScreen] Attempted to join game while authError is present. Aborting. Error:", authError);
                // The authError is already displayed. The user should likely re-authenticate.
                // Disabling the button (see below) also helps prevent this.
                return;
            }

            try {
                if (loggedInPlayer) {
                    // Existing player with loaded player data: Join directly
                    await handleJoinGame(null);
                } else if (storedUsername) {
                    // Existing player reconnecting with stored username: Join directly
                    await handleJoinGame(null);
                } else if (inputUsername.trim()) {
                    // New player with entered username: Validate and join with chosen character
                    if (validateNewUsername()) {
                        await handleJoinGame(inputUsername, selectedCharacterId);
                    }
                } else {
                    // No player data and no username entered
                    // Only show validation error if username input is actually visible
                    const shouldShowUsernameInput = !authError && !connectionError && !localError && isSpacetimeConnected && !loggedInPlayer && !storedUsername;
                    if (shouldShowUsernameInput) {
                        setLocalError('Username is required to join the game');
                    } else {
                        // Fallback: try to join anyway (might be a returning player with slow loading)
                        await handleJoinGame(null);
                    }
                }
            } catch (error) {
                // Handle server-side errors (like username already taken)
                const errorMessage = error instanceof Error ? error.message : String(error);
                setLocalError(errorMessage);
            }
        }
    };

    // Handle Enter key press in the input field (only applicable for new players)
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !authIsLoading && isAuthenticated && !loggedInPlayer) {
            handleSubmit(event as unknown as React.FormEvent);
        }
    };

    // Override global App.css scroll restrictions for login screen
    React.useEffect(() => {
        // Store original styles
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyOverflowX = document.body.style.overflowX;
        const originalBodyOverflowY = document.body.style.overflowY;
        const originalBodyHeight = document.body.style.height;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalHtmlOverflowX = document.documentElement.style.overflowX;
        const originalHtmlOverflowY = document.documentElement.style.overflowY;

        // Find and override .App container styles
        const appElement = document.querySelector('.App') as HTMLElement;
        const originalAppOverflow = appElement?.style.overflow;
        const originalAppOverflowX = appElement?.style.overflowX;
        const originalAppOverflowY = appElement?.style.overflowY;
        const originalAppHeight = appElement?.style.height;

        // COMPLETELY DISABLE horizontal scrolling at all levels
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.overflowY = 'auto';

        // Apply to App container as well
        if (appElement) {
            appElement.style.overflowX = 'hidden';
            appElement.style.overflowY = 'auto';
            appElement.style.height = 'auto';
        }

        return () => {
            // Restore original styles when component unmounts
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.overflowX = originalBodyOverflowX;
            document.body.style.overflowY = originalBodyOverflowY;
            document.body.style.height = originalBodyHeight;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.documentElement.style.overflowX = originalHtmlOverflowX;
            document.documentElement.style.overflowY = originalHtmlOverflowY;

            if (appElement) {
                appElement.style.overflow = originalAppOverflow || '';
                appElement.style.overflowX = originalAppOverflowX || '';
                appElement.style.overflowY = originalAppOverflowY || '';
                appElement.style.height = originalAppHeight || '';
            }
        };
    }, []);

    return (
        <>
            {/* Fixed Header with Email and Logout - Desktop only; on mobile we show it below JOIN GAME */}
            {isAuthenticated && userProfile && !isMobile && (
                <div
                    className="fixed-auth-header"
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        zIndex: 9999,
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'linear-gradient(135deg, rgba(15, 23, 13, 0.95) 0%, rgba(25, 35, 20, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderBottomLeftRadius: '8px',
                        borderLeft: '1px solid rgba(200, 162, 60, 0.4)',
                        borderBottom: '1px solid rgba(200, 162, 60, 0.4)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(200, 162, 60, 0.1)',
                        transform: showAuthHeader ? 'translateY(0)' : 'translateY(-100%)',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: showAuthHeader ? 'auto' : 'none',
                    }}
                >
                    <span
                        style={{
                            color: '#ffc83c',
                            fontSize: '14px',
                            fontFamily: "'PixelOperator', monospace",
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px #000, 0 0 8px rgba(200, 162, 60, 0.4)',
                        }}
                    >
                        {userProfile.email || 'User'}
                    </span>
                    <button
                        onClick={logout}
                        style={{
                            padding: '6px 16px',
                            background: 'linear-gradient(135deg, #7c1f1f 0%, #4a1010 100%)',
                            border: '1px solid rgba(200, 162, 60, 0.5)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            fontFamily: "'PixelOperator', monospace",
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textShadow: '1px 1px 2px #000',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #9e2a2a 0%, #5e1515 100%)';
                            e.currentTarget.style.borderColor = 'rgba(200, 162, 60, 0.8)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(200, 162, 60, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #7c1f1f 0%, #4a1010 100%)';
                            e.currentTarget.style.borderColor = 'rgba(200, 162, 60, 0.5)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
                        }}
                    >
                        LOG OUT
                    </button>
                </div>
            )}

            {/* Add CSS animations */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    100% { opacity: 0.8; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            {/* Sticky Navigation Bar - Always visible, transparent at first, solid/themed on scroll */}
            {true && (
                <div style={{
                    position: 'fixed',
                    top: isScrolled ? '0' : '15px',
                    left: isScrolled ? '0' : '20px',
                    right: isScrolled ? '0' : '20px',
                    boxSizing: 'border-box',
                    height: '70px',
                    backgroundColor: isScrolled ? 'rgba(15, 23, 13, 0.95)' : 'rgba(15, 23, 13, 0.65)',
                    backdropFilter: 'blur(10px)',
                    border: isScrolled ? 'none' : '1px solid rgba(200, 162, 60, 0.3)',
                    borderBottom: isScrolled ? '2px solid rgba(200, 162, 60, 0.4)' : '1px solid rgba(200, 162, 60, 0.3)',
                    borderRadius: isScrolled ? '0px' : '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 clamp(16px, 4vw, 40px)',
                    zIndex: 1000,
                    boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.6)' : '0 8px 32px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                    {/* Logo */}
                    <span
                        onClick={scrollToTop}
                        style={{
                            fontFamily: UI_BRAND_FONT,
                            fontSize: 'clamp(24px, 3vw, 32px)',
                            color: '#C8A23C',
                            textShadow: '2px 2px 0px #000',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            userSelect: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        WILDER
                    </span>

                    {/* Navigation Links */}
                    {isMobile ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            {/* Play Now Button - Only show after scrolling past the fold */}
                            {showStickyNav && (
                                <button
                                    onClick={scrollToTop}
                                    style={{
                                        backgroundColor: '#5c8e32',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '8px 16px',
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        boxShadow: '0 4px 12px rgba(92, 142, 50, 0.3)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#86be52';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(92, 142, 50, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#5c8e32';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 142, 50, 0.3)';
                                    }}
                                >
                                    PLAY
                                </button>
                            )}
                            <MobileNavMenu
                                navItems={[
                                    { label: 'ABOUT', selector: 'about' },
                                    { label: 'HOW TO PLAY', selector: 'how-to-play' },
                                ]}
                                onNavigate={(selector) => {
                                    if (selector === 'about') {
                                        navigate('/about');
                                        window.scrollTo(0, 0);
                                    } else if (selector === 'blog') {
                                        navigate('/blog');
                                        window.scrollTo(0, 0);
                                    } else if (selector === 'how-to-play') {
                                        const sec = document.querySelector('[data-how-to-play-section]');
                                        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                onPlayClick={scrollToTop}
                                userEmail={isAuthenticated && userProfile ? (userProfile.email || null) : null}
                                onLogout={isAuthenticated ? logout : undefined}
                            />
                        </div>
                    ) : (
                        <nav style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(10px, 2vw, 30px)',
                            fontSize: '14px',
                        }}>
                            {[
                                { label: 'ABOUT', selector: 'about' },
                                { label: 'HOW TO PLAY', selector: 'how-to-play' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        if (item.selector === 'about') {
                                            navigate('/about');
                                            window.scrollTo(0, 0);
                                        } else if (item.selector === 'blog') {
                                            navigate('/blog');
                                            window.scrollTo(0, 0);
                                        } else if (item.selector === 'how-to-play') {
                                            const sec = document.querySelector('[data-how-to-play-section]');
                                            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: 'inherit',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        padding: '8px 12px',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#5c8e32';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}

                            {/* PLAY Button */}
                            <button
                                onClick={scrollToTop}
                                style={{
                                    background: 'linear-gradient(135deg, #5c8e32, #2d4715)',
                                    color: 'white',
                                    border: '1px solid rgba(134, 190, 82, 0.3)',
                                    borderRadius: '6px',
                                    padding: '10px 24px',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    boxShadow: '0 4px 12px rgba(92, 142, 50, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #86be52, #3b6320)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(92, 142, 50, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #5c8e32, #2d4715)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 142, 50, 0.3)';
                                }}
                            >
                                PLAY
                            </button>
                        </nav>
                    )}
                </div>
            )}

            <div style={{
                minHeight: '100vh', // Ensure page is tall enough to scroll
                width: '100%', // Match the background image width exactly
                margin: 0,
                padding: 0,
                backgroundColor: '#000000', // Pure black background to match gradient
                backgroundAttachment: 'scroll',
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                color: 'white',
                position: 'relative',
                overflowX: 'hidden', // Prevent horizontal scrolling
                overflowY: 'auto', // Allow vertical scrolling
                boxSizing: 'border-box', // Include padding and border in width calculations
                isolation: 'isolate',
            }}>
                {/* Background Wrapper to clip the video overflow */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}>
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster={loginBackground}
                        style={{
                            position: 'absolute',
                            inset: '-2%',
                            width: '104%',
                            height: '104%',
                            objectFit: 'cover',
                            objectPosition: isMobile ? 'center 24%' : 'center 42%',
                            transform: 'scale(1.03)',
                            filter: 'contrast(1.08) saturate(0.92) brightness(0.9)',
                            opacity: 0.96,
                            zIndex: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        <source src='/assets/ui/herobg.mp4' type="video/mp4" />
                    </video>
                    {!backgroundLoaded && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${loginBackground})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            backgroundRepeat: 'no-repeat',
                            zIndex: 0,
                            pointerEvents: 'none',
                        }} />
                    )}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.14) 28%, rgba(0,0,0,0.38) 62%, rgba(0,0,0,0.82) 100%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                    }} />
                    {/* Gradient Overlay - Very aggressive transition to eliminate flat line */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: isMobile
                            ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.85) 88%, rgba(0,0,0,1) 98%)'
                            : 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0.85) 92%, rgba(0,0,0,1) 98%)',
                        pointerEvents: 'none', // Allow clicks to pass through
                        zIndex: 1,
                    }} />
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    minHeight: '100vh',
                    paddingTop: isMobile ? '90px' : 'calc(30vh - 10vw)', // Mobile: account for fixed nav bar (70px + 20px padding). Desktop: ~18vh
                    paddingBottom: '0px',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2, // Ensure content appears above the gradient overlay
                }}>
                    <h1 style={{
                        fontFamily: UI_BRAND_FONT,
                        fontSize: 'clamp(48px, 8vw, 96px)',
                        color: '#C8A23C',
                        textShadow: '3px 3px 0px #000, 6px 6px 20px rgba(200, 162, 60, 0.4)',
                        margin: '0 0 10px 0',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        userSelect: 'none',
                    }}>
                        WILDER
                    </h1>
                    <p style={{
                        fontFamily: "'PixelOperator', sans-serif",
                        fontSize: 'clamp(14px, 2.5vw, 18px)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '600px',
                        margin: '0 auto 10px auto',
                        lineHeight: '1.4',
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                    }}>
                        Survive the Wilderness. Buy, sell, and trade <strong style={{ color: '#C8A23C' }}>$WLDR</strong> tokens to claim your destiny.
                    </p>
                    <div style={{
                        backgroundColor: 'rgba(200, 162, 60, 0.15)',
                        border: '1px dashed #C8A23C',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'inline-block',
                        marginBottom: '40px',
                        fontFamily: "'PixelOperator', sans-serif",
                        fontSize: '14px',
                        color: '#ffc83c',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 0 10px rgba(200, 162, 60, 0.1)',
                    }}>
                        IMPORTANT: PLAYERS MUST BUY & SELL <strong style={{ color: 'white', textShadow: '0 0 5px #C8A23C' }}>$WLDR</strong> TO PROGRESS AND SURVIVE
                    </div>

                    <div style={{
                        textAlign: 'center',
                        marginTop: isMobile ? '30vh' : '0', // Push content lower on mobile
                    }}>

                        {/* Display based on authentication and player existence */}
                        {authIsLoading ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '30px',
                                background: 'linear-gradient(135deg, rgba(15, 23, 13, 0.85) 0%, rgba(25, 35, 20, 0.9) 100%)',
                                border: '1px solid rgba(200, 162, 60, 0.3)',
                                borderRadius: '12px',
                                maxWidth: '380px',
                                margin: '20px auto',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(200, 162, 60, 0.05)',
                                animation: 'fadeIn 0.5s ease-out',
                            }}>
                                {/* Enhanced Outer/Inner Rotating Rings */}
                                <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '20px' }}>
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        border: '4px solid rgba(200, 162, 60, 0.1)',
                                        borderTop: '4px solid #C8A23C',
                                        borderBottom: '4px solid #C8A23C',
                                        borderRadius: '50%',
                                        animation: 'spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        width: '40px',
                                        height: '40px',
                                        border: '3px solid rgba(59, 107, 53, 0.1)',
                                        borderLeft: '3px solid #3B6B35',
                                        borderRight: '3px solid #3B6B35',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite reverse',
                                    }} />
                                    {/* Central glowing core */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '20px',
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#C8A23C',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 15px #C8A23C',
                                        animation: 'pulse 1.2s ease-in-out infinite alternate',
                                    }} />
                                </div>
                                <h3 style={{
                                    fontFamily: "'PixelOperator', sans-serif",
                                    fontSize: '18px',
                                    color: '#ffc83c',
                                    margin: '0 0 8px 0',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    textShadow: '1px 1px 2px #000',
                                }}>
                                    Securing Session
                                </h3>
                                <p style={{
                                    fontFamily: "'PixelOperator', sans-serif",
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    margin: '0',
                                    textAlign: 'center',
                                    lineHeight: '1.4',
                                    textShadow: '1px 1px 2px #000',
                                }}>
                                    Authenticating wallet signature and authorizing session key. Please confirm in your wallet.
                                </p>
                            </div>
                        ) : (authError || (connectionError && (loggedInPlayer || storedUsername))) ? (
                            <>
                                <p style={{
                                    color: 'white',
                                    marginTop: '15px',
                                    fontSize: '12px',
                                    padding: '8px',
                                    backgroundColor: 'rgba(128, 0, 128, 0.1)',
                                    borderRadius: '4px',
                                    marginBottom: '20px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                }}>
                                    {connectionError || 'Connection failed. Please ensure you have an internet connection and try again.'}<br />
                                    {!connectionError && 'If the problem persists, please try signing out and signing in.'}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                    <button
                                        onClick={() => {
                                            // If it says "refresh your browser", do a page reload
                                            // Otherwise use retry function if available
                                            if (connectionError && connectionError.includes('Please refresh your browser')) {
                                                window.location.reload();
                                            } else if (connectionError && retryConnection) {
                                                retryConnection();
                                            } else {
                                                window.location.reload();
                                            }
                                        }}
                                        disabled={authIsLoading}
                                        onMouseEnter={(e) => {
                                            if (!authIsLoading) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4), 0 0 20px rgba(255,140,0,0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!authIsLoading) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(255,140,0,0.4)';
                                            }
                                        }}
                                        style={{
                                            padding: '16px 32px',
                                            border: '2px solid rgba(255, 165, 0, 0.6)',
                                            background: 'linear-gradient(135deg, #5c8e32, #2d4715)',
                                            color: 'white',
                                            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: authIsLoading ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(255,140,0,0.4)',
                                            display: 'inline-block',
                                            textTransform: 'uppercase',
                                            borderRadius: '8px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            letterSpacing: '1px',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {connectionError && connectionError.includes('Please refresh your browser') ? 'Refresh' : 'Try Again'}
                                    </button>
                                </div>
                            </>
                        ) : isAuthenticated ? (
                            loggedInPlayer ? (
                                // Existing Player: Show welcome message
                                <p style={{
                                    marginBottom: '20px',
                                    fontSize: '14px'
                                }}>
                                    Welcome back, {loggedInPlayer.username}!
                                </p>
                            ) : storedUsername ? (
                                // We have a stored username, so this is an existing player reconnecting
                                <p style={{
                                    marginBottom: '20px',
                                    fontSize: '14px'
                                }}>
                                    {connectionError ?
                                        `Playing as ${storedUsername}` :
                                        `Welcome back, ${storedUsername}!`
                                    }
                                </p>
                            ) : connectionError ? (
                                // Connection error without stored username: Show generic authenticated message
                                <div style={{
                                    marginBottom: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    {/* Loading Spinner */}
                                    <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '8px' }}>
                                        <div style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            border: '3px solid rgba(200, 162, 60, 0.1)',
                                            borderTop: '3px solid #C8A23C',
                                            borderBottom: '3px solid #C8A23C',
                                            borderRadius: '50%',
                                            animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                                        }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: '6px',
                                            left: '6px',
                                            width: '32px',
                                            height: '32px',
                                            border: '2px solid rgba(59, 107, 53, 0.1)',
                                            borderLeft: '2px solid #3B6B35',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite reverse',
                                        }} />
                                    </div>
                                    <p style={{
                                        fontSize: '14px',
                                        fontFamily: "'PixelOperator', sans-serif",
                                        margin: '0',
                                        color: '#ffc83c',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    }}>
                                        Authenticated - Reconnecting to game...
                                    </p>
                                </div>
                            ) : !authError && !connectionError && !loggedInPlayer && !storedUsername ? (
                                // New Player: Always show character picker + username input (stays visible on
                                // recoverable errors like "username taken" so the player can fix it and retry).
                                <div style={{
                                    maxWidth: '350px',
                                    margin: '0 auto',
                                    textAlign: 'left',
                                }}>
                                    {/* Character picker — choose 1 of 4 looks (seen by all other players) */}
                                    <div style={{ marginBottom: '22px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '10px',
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: '500',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                            letterSpacing: '0.5px',
                                            fontFamily: "'PixelOperator', sans-serif",
                                        }}>
                                            Choose Your Character
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                                            {CHARACTERS.map((c) => {
                                                const selected = selectedCharacterId === c.id;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => setSelectedCharacterId(c.id)}
                                                        title={c.name}
                                                        style={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '8px 2px',
                                                            cursor: 'pointer',
                                                            background: selected ? 'rgba(134,190,82,0.18)' : 'rgba(12,21,15,0.6)',
                                                            border: selected ? '2px solid #86be52' : '1px solid rgba(92,142,50,0.4)',
                                                            borderRadius: '10px',
                                                            transition: 'all 0.15s ease',
                                                            boxShadow: selected ? '0 0 14px rgba(134,190,82,0.45)' : 'none',
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '44px',
                                                            height: '44px',
                                                            backgroundImage: `url(${heroIdle})`,
                                                            backgroundSize: '400% 400%',
                                                            backgroundPosition: '0% 0%',
                                                            backgroundRepeat: 'no-repeat',
                                                            imageRendering: 'pixelated',
                                                            filter: c.filter || 'none',
                                                        }} />
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: selected ? '#c4e89c' : 'rgba(232,240,224,0.7)',
                                                            fontFamily: "'PixelOperator', sans-serif",
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                        }}>{c.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{
                                        marginBottom: '25px',
                                    }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: '500',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                            letterSpacing: '0.5px',
                                            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                                        }}>
                                            Choose Your Username
                                        </label>
                                        <input
                                            ref={usernameInputRef}
                                            type="text"
                                            placeholder="Enter username"
                                            value={inputUsername}
                                            onChange={(e) => setInputUsername(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '16px',
                                                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                                                backdropFilter: 'blur(8px)',
                                                transition: 'all 0.3s ease',
                                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#5c8e32';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(92, 142, 50, 0.2)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.2)';
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Other states - show empty
                                <></>
                            )
                        ) : null /* Not loading, no error, not authenticated: Button below will handle Sign In */}

                        {/* Render Login/Join button only if not loading and no authError and (no connectionError OR we have storedUsername) */}
                        {!authIsLoading && !authError && (!connectionError || storedUsername) && (
                            <form onSubmit={handleSubmit}>
                                {isAuthenticated ? (
                                    <>
                                        {simulatedWldrBalance !== null && (
                                            <div
                                                style={{
                                                    marginBottom: '14px',
                                                    fontSize: '12px',
                                                    color: 'rgba(255, 255, 255, 0.85)',
                                                    fontFamily: 'monospace',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                }}
                                            >
                                                Simulated $WLDR balance: {simulatedWldrBalance}
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={authError !== null || (connectionError !== null && !storedUsername) || localError !== null}
                                            onMouseEnter={(e) => {
                                                const isButtonDisabled = authError !== null || (connectionError !== null && !storedUsername) || localError !== null;
                                                if (!isButtonDisabled) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4), 0 0 20px rgba(200, 162, 60, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                const isButtonDisabled = authError !== null || (connectionError !== null && !storedUsername) || localError !== null;
                                                if (!isButtonDisabled) {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(200, 162, 60, 0.4)';
                                                }
                                            }}
                                            style={{
                                                padding: '16px 32px',
                                                border: '2px solid rgba(200, 162, 60, 0.5)',
                                                background: 'linear-gradient(135deg, #C8A23C, #3B6B35)',
                                                color: 'white',
                                                fontFamily: "'PixelOperator', sans-serif",
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                cursor: (authError || (connectionError && !storedUsername) || localError) ? 'not-allowed' : 'pointer',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(200, 162, 60, 0.4)',
                                                display: 'inline-block',
                                                boxSizing: 'border-box',
                                                textTransform: 'uppercase',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                letterSpacing: '1px',
                                                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            Join Game
                                        </button>
                                    </>
                                ) : (
                                  <>
                                    <button
                                        type="button"
                                        onClick={handleWalletLogin}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4), 0 0 20px rgba(200, 162, 60, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(200, 162, 60, 0.4)';
                                        }}
                                        style={{
                                            padding: '16px 32px',
                                            border: '2px solid rgba(200, 162, 60, 0.5)',
                                            background: 'linear-gradient(135deg, #C8A23C, #3B6B35)',
                                            color: 'white',
                                            fontFamily: "'PixelOperator', sans-serif",
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(200, 162, 60, 0.4)',
                                            display: 'inline-block',
                                            boxSizing: 'border-box',
                                            textTransform: 'uppercase',
                                            borderRadius: '8px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            letterSpacing: '1px',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        Connect Solana Wallet
                                    </button>

                                    {/* Spectate without a wallet — watch the live world as a drifting ember. */}
                                    {handleSpectateGame && (
                                        <div style={{ marginTop: '16px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleSpectateGame?.()}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.color = '#c4e89c';
                                                    e.currentTarget.style.borderColor = 'rgba(134, 190, 82, 0.8)';
                                                    e.currentTarget.style.background = 'rgba(16, 30, 22, 0.85)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.color = 'rgba(232, 240, 224, 0.85)';
                                                    e.currentTarget.style.borderColor = 'rgba(92, 142, 50, 0.5)';
                                                    e.currentTarget.style.background = 'rgba(12, 21, 15, 0.6)';
                                                }}
                                                style={{
                                                    padding: '12px 28px',
                                                    border: '1px solid rgba(92, 142, 50, 0.5)',
                                                    background: 'rgba(12, 21, 15, 0.6)',
                                                    color: 'rgba(232, 240, 224, 0.85)',
                                                    fontFamily: "'PixelOperator', sans-serif",
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'inline-block',
                                                    boxSizing: 'border-box',
                                                    textTransform: 'uppercase',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.25s ease',
                                                    letterSpacing: '1px',
                                                    backdropFilter: 'blur(6px)',
                                                }}
                                            >
                                                Spectate — No Wallet Needed
                                            </button>
                                        </div>
                                    )}
                                  </>
                                )}
                            </form>
                        )}

                        {/* System Requirements popup */}
                        {showSystemRequirements && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    zIndex: 9999,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backdropFilter: 'blur(8px)',
                                }}
                                onClick={() => setShowSystemRequirements(false)}
                            >
                                <div
                                    style={{
                                        width: isMobile ? '95%' : '520px',
                                        maxWidth: '95vw',
                                        maxHeight: '85vh',
                                        background: 'rgba(40, 40, 60, 0.98)',
                                        border: '2px solid rgba(92, 142, 50, 0.4)',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                                        fontFamily: UI_FONT_FAMILY,
                                        overflow: 'auto',
                                        padding: '28px 32px',
                                        position: 'relative',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 style={{
                                        margin: '0 0 20px 0',
                                        color: '#5c8e32',
                                        fontSize: '20px',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.2px',
                                    }}>
                                        System Requirements & Best Practices
                                    </h3>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: 1.6, textAlign: 'left' }}>
                                        <p style={{ marginTop: 0, marginBottom: '12px' }}>
                                            <strong>Minimum:</strong> Modern browser (Chrome, Firefox, Edge), 4GB RAM, stable internet connection.
                                        </p>
                                        <p style={{ marginBottom: '12px' }}>
                                            <strong>Recommended:</strong> 8GB+ RAM, GPU for faster canvas rendering, broadband connection.
                                        </p>
                                        <p style={{ marginBottom: '16px' }}>
                                            Broth and Bullets runs in your browser and shares CPU, GPU, and memory with other apps. For best performance:
                                        </p>
                                        <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', textAlign: 'left' }}>
                                            <li style={{ marginBottom: '8px' }}>Close other games in the background</li>
                                            <li style={{ marginBottom: '8px' }}>Close unnecessary browser tabs</li>
                                            <li style={{ marginBottom: '8px' }}>Close heavy apps (video editors, IDEs, etc.)</li>
                                            <li style={{ marginBottom: '8px' }}>Use a wired connection if possible</li>
                                            <li style={{ marginBottom: '8px' }}>Close other games even when minimized</li>
                                        </ul>
                                        <p style={{ marginBottom: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)' }}>
                                            Running multiple heavy applications at once will cause noticeable slowdown. For the smoothest experience, play Broth and Bullets when no other demanding games are running.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowSystemRequirements(false)}
                                        style={{
                                            marginTop: '16px',
                                            padding: '10px 24px',
                                            background: 'linear-gradient(90deg, #c4e89c, #5c8e32 90%, #2d4715)',
                                            border: 'none',
                                            color: '#852100',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontFamily: UI_FONT_FAMILY,
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Show error state with Refresh button for connection-related localErrors */}
                        {!authIsLoading && !authError && !connectionError && localError && (localError.includes('Connection error') || localError.includes('Quantum tunnel collapsed') || localError.includes('Please refresh your browser')) && localError !== connectionError && (
                            <>
                                <p style={{
                                    color: 'white',
                                    marginTop: '15px',
                                    fontSize: '12px',
                                    padding: '8px',
                                    backgroundColor: 'rgba(128, 0, 128, 0.1)',
                                    borderRadius: '4px',
                                    marginBottom: '20px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                }}>
                                    {localError}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        padding: '12px 24px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        backgroundColor: 'rgba(92, 142, 50, 0.8)', // Orange for retry
                                        color: 'white',
                                        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                                        textTransform: 'uppercase',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        width: 'auto',
                                        minWidth: '120px',
                                    }}
                                >
                                    Refresh
                                </button>
                            </>
                        )}

                        {/* Local Error Messages (e.g., for username validation) - show if not authError and not connection error */}
                        {localError && !authError && !localError.includes('Connection error') && !localError.includes('Quantum tunnel collapsed') && !localError.includes('Please refresh your browser') && localError !== connectionError && (
                            <p style={{
                                color: 'white',
                                marginTop: '0px',
                                marginBottom: '15px',
                                fontSize: '12px',
                                padding: '8px',
                                backgroundColor: 'rgba(128, 0, 128, 0.1)',
                                borderRadius: '4px',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            }}>
                                {localError}
                            </p>
                        )}
                    </div> {/* Close the textAlign: 'center' div opened at line 966 */}

                        {/* Content Section - Game Tools */}
                        <div style={{ paddingTop: '60px' }}>
                            {/* Stats Section */}
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                width: '100%',
                                maxWidth: '800px',
                                margin: '40px auto 60px auto',
                                padding: '0 20px',
                                boxSizing: 'border-box',
                            }}>
                                {/* Players Online */}
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '12px',
                                    border: '2px solid rgba(92, 142, 50, 0.5)',
                                    padding: '24px',
                                    width: '240px',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(92, 142, 50, 0.2)',
                                    transition: 'transform 0.3s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#86be52',
                                        fontFamily: "'PixelOperatorMono', monospace",
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        marginBottom: '8px',
                                    }}>
                                        Players Online
                                    </div>
                                    <div style={{
                                        fontFamily: UI_BRAND_FONT,
                                        fontSize: '48px',
                                        color: 'white',
                                        textShadow: '0 0 10px rgba(255,255,255,0.3)',
                                    }}>
                                        {typeof onlinePlayerCount === 'number' ? onlinePlayerCount : '—'} <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }}>/ {maxPlayerCount || 50}</span>
                                    </div>
                                </div>

                                {/* Persistent-world objective card (honest, non-hardcoded) */}
                                <div style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '12px',
                                    border: '2px solid rgba(200, 162, 60, 0.5)',
                                    padding: '24px',
                                    width: '240px',
                                    textAlign: 'center',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(200, 162, 60, 0.2)',
                                    transition: 'transform 0.3s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#ffc83c',
                                        fontFamily: "'PixelOperatorMono', monospace",
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        marginBottom: '8px',
                                    }}>
                                        The Goal
                                    </div>
                                    <div style={{
                                        fontFamily: "'PixelOperator', sans-serif",
                                        fontSize: '15px',
                                        color: 'white',
                                        lineHeight: 1.4,
                                        textShadow: '0 0 10px rgba(255,255,255,0.2)',
                                    }}>
                                        Survive, craft, and grow your $WLDR — one shared world.
                                    </div>
                                </div>
                            </div>

                            {/* How to Play Section */}
                            <div data-how-to-play-section style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(16px)',
                                borderRadius: '16px',
                                padding: '40px clamp(20px, 5vw, 40px)',
                                margin: '0 auto 80px auto',
                                maxWidth: '800px',
                                width: 'calc(100% - 40px)',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
                                textAlign: 'left',
                                boxSizing: 'border-box',
                            }}>
                                <h3 style={{
                                    fontFamily: UI_BRAND_FONT,
                                    fontSize: '36px',
                                    color: '#C8A23C',
                                    textShadow: '2px 2px 0px #000',
                                    textAlign: 'center',
                                    marginBottom: '30px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                }}>
                                    How to Play
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                }}>
                                    {[
                                        {
                                            step: "1",
                                            title: "Connect Wallet",
                                            desc: "Click 'Start Your Journey' or 'Join Game' to sign in with your Web3 wallet and authorize your session key."
                                        },
                                        {
                                            step: "2",
                                            title: "Buy $WLDR Tokens",
                                            desc: "Acquire $WLDR tokens required to purchase gear, trade with other players, and pay taxes."
                                        },
                                        {
                                            step: "3",
                                            title: "Survive & Earn",
                                            desc: "Harvest resources, craft weapons, and defend your homestead. Trade your items for $WLDR to survive."
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            gap: '20px',
                                            alignItems: 'flex-start',
                                            padding: '20px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            transition: 'border-color 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(92, 142, 50, 0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                        >
                                            <div style={{
                                                background: 'linear-gradient(135deg, #86be52, #3b6b35)',
                                                color: 'white',
                                                fontFamily: UI_BRAND_FONT,
                                                fontSize: '24px',
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                boxShadow: '0 0 10px rgba(92, 142, 50, 0.4)',
                                            }}>
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 style={{
                                                    fontFamily: "'PixelOperator', sans-serif",
                                                    fontSize: '20px',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    margin: '0 0 4px 0',
                                                }}>
                                                    {item.title}
                                                </h4>
                                                <p style={{
                                                    fontFamily: "'Courier New', monospace",
                                                    fontSize: '13px',
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    margin: 0,
                                                    lineHeight: '1.5',
                                                }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            </div>
                        </div>

                {/* Simple Footer */}
                <footer style={{
                    width: '100%',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '40px 20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: 'auto',
                    position: 'relative',
                    zIndex: 3,
                }}>
                    <div style={{
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}>
                        <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); window.scrollTo(0,0); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Courier New', monospace" }} onMouseEnter={(e) => e.currentTarget.style.color = '#5c8e32'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>ABOUT</a>
                        <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); window.scrollTo(0,0); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Courier New', monospace" }} onMouseEnter={(e) => e.currentTarget.style.color = '#5c8e32'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>PRIVACY</a>
                        <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); window.scrollTo(0,0); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontFamily: "'Courier New', monospace" }} onMouseEnter={(e) => e.currentTarget.style.color = '#5c8e32'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>TERMS</a>
                    </div>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: "'Courier New', monospace",
                        textAlign: 'center',
                    }}>
                        © 2026 Wilder Team. All rights reserved. Play responsibly using $WLDR.
                    </p>
                </footer>
                
                {/* Fixed Back to Top Button */}
                {showBackToTop && (
                    <button
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            right: '30px',
                            background: 'rgba(92, 142, 50, 0.9)',
                            border: '2px solid rgba(92, 142, 50, 0.6)',
                            color: 'white',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '600',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3), 0 0 10px rgba(255,140,0,0.4)',
                            zIndex: 1000,
                            width: '60px',
                            height: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(92, 142, 50, 1)';
                            e.currentTarget.style.borderColor = '#5c8e32';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255,140,0,0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(92, 142, 50, 0.9)';
                            e.currentTarget.style.borderColor = 'rgba(92, 142, 50, 0.6)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3), 0 0 10px rgba(255,140,0,0.4)';
                        }}
                        title="Back to Top"
                    >
                        ↑
                    </button>
                )}
                </div> {/* Close the inner flex wrapper (opened at line 914) */}
            </div> {/* Close the outer container (opened at line 882) */}
        </>
    );
};

export default LoginScreen;
