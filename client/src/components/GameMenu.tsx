import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faEye, faGamepad, faLightbulb, faPlay, faRightFromBracket, IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type MenuType = 'main' | 'controls' | 'tips' | 'settings' | 'visual_settings' | null;

interface MenuOption {
    label: string;
    action: () => void;
    icon?: IconDefinition;
    isSignOut?: boolean;
}

interface GameMenuProps {
    onClose: () => void;
    onNavigate: (menu: MenuType) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ 
    onClose, 
    onNavigate, 
}) => {
    const { logout } = useAuth();
    const [showSignOutConfirm, setShowSignOutConfirm] = React.useState(false);
    
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSignOutRequest = () => {
        setShowSignOutConfirm(true);
    };

    const handleSignOutConfirm = async () => {
        setShowSignOutConfirm(false);
        onClose(); // Close the menu first
        await logout(); // Then sign out
    };

    const handleSignOutCancel = () => {
        setShowSignOutConfirm(false);
    };

    const menuOptions: MenuOption[] = [
        { label: 'RESUME', action: () => onClose(), icon: faPlay },
        { label: 'SOUND', action: () => onNavigate('settings'), icon: faVolumeUp },
        { label: 'VISUAL', action: () => onNavigate('visual_settings'), icon: faEye },
        { label: 'CONTROLS', action: () => onNavigate('controls'), icon: faGamepad },
        { label: 'TIPS', action: () => onNavigate('tips'), icon: faLightbulb },
        { label: 'EXIT', action: handleSignOutRequest, icon: faRightFromBracket, isSignOut: true },
    ];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #101e16 0%, #0c150f 50%, #0a120d 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2000,
                backdropFilter: 'blur(8px)',
                overflow: 'hidden',
            }}
            onClick={handleBackdropClick}
        >
            {/* Animated grid background */}
            <div 
                className="grid-background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `
                        linear-gradient(rgba(92, 142, 50, 0.15) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(92, 142, 50, 0.15) 1px, transparent 1px),
                        linear-gradient(rgba(92, 142, 50, 0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(92, 142, 50, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
                    animation: 'grid-move 20s linear infinite',
                    opacity: 0.7,
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    background: 'linear-gradient(135deg, #101e16, #0c150f)',
                    border: '4px solid #5c8e32',
                    borderRadius: '0px',
                    padding: '40px',
                    minWidth: '350px',
                    boxShadow: '0 8px 0 #2d4715, 0 0 20px rgba(134, 190, 82, 0.45)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Scan line effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(134, 190, 82, 0.45), transparent)',
                    animation: 'scanLine 3s linear infinite',
                }} />
                
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2
                        style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '24px',
                            color: '#e8f0e0',
                            textAlign: 'center',
                            marginBottom: '8px',
                            textShadow: '0 0 10px rgba(134, 190, 82, 0.45)',
                            animation: 'glow 2s ease-in-out infinite alternate',
                            letterSpacing: '2px',
                        }}
                    >
                        GAME MENU
                    </h2>
                    <div
                        style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '12px',
                            color: '#9ab08a',
                            textAlign: 'center',
                            letterSpacing: '1px',
                            opacity: 0.8,
                            lineHeight: '1.4',
                        }}
                    >
                        <div>SURVIVAL MATRIX</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {menuOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={option.action}
                            style={{
                                background: option.isSignOut
                                    ? 'linear-gradient(135deg, rgba(168,68,68,0.9), rgba(120,40,40,0.95))'
                                    : 'linear-gradient(135deg, rgba(92,142,50,0.85), rgba(60,100,30,0.95))',
                                color: option.isSignOut ? '#ffffff' : '#e8f0e0',
                                border: option.isSignOut ? '3px solid #f87171' : '3px solid #5c8e32',
                                borderRadius: '0px',
                                padding: '15px 25px',
                                fontFamily: "'PixelOperator', monospace",
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2), 0 4px 0 rgba(0,0,0,0.1)',
                                textShadow: '2px 2px 0px rgba(0,0,0,0.4)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = option.isSignOut
                                    ? 'linear-gradient(135deg, rgba(248,113,113,0.95), rgba(168,68,68,1))'
                                    : 'linear-gradient(135deg, rgba(134,190,82,0.95), rgba(92,142,50,1))';
                                e.currentTarget.style.borderColor = option.isSignOut ? '#f87171' : '#c4e89c';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = option.isSignOut
                                    ? 'linear-gradient(135deg, rgba(168,68,68,0.9), rgba(120,40,40,0.95))'
                                    : 'linear-gradient(135deg, rgba(92,142,50,0.85), rgba(60,100,30,0.95))';
                                e.currentTarget.style.borderColor = option.isSignOut ? '#f87171' : '#5c8e32';
                                e.currentTarget.style.transform = 'translateY(0px)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: '12px',
                                width: '100%',
                                paddingLeft: '8px',
                            }}>
                                <div style={{
                                    width: '20px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    {option.icon && (
                                        <FontAwesomeIcon 
                                            icon={option.icon} 
                                            style={{
                                                fontSize: '16px',
                                                color: 'currentColor',
                                            }}
                                        />
                                    )}
                                </div>
                                <span>{option.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
                
                {/* Neural Sleep Confirmation Dialog */}
                {showSignOutConfirm && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                        }}
                        onClick={handleSignOutCancel}
                    >
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #101e16, #0c150f)',
                                border: '4px solid #5c8e32',
                                borderRadius: '0px',
                                padding: '30px',
                                maxWidth: '450px',
                                textAlign: 'center',
                                boxShadow: '0 8px 0 #2d4715, 0 0 20px rgba(134, 190, 82, 0.45)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Warning scan line */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, rgba(134, 190, 82, 0.45), transparent)',
                                animation: 'scanLine 2s linear infinite',
                            }} />

                            <div style={{
                                color: '#ffc83c',
                                fontSize: '18px',
                                marginBottom: '15px',
                                textShadow: '0 0 10px rgba(255, 200, 60, 0.8)',
                                fontFamily: "'PixelOperator', monospace",
                                letterSpacing: '1px',
                            }}>
                                NEURAL SLEEP PROTOCOL
                            </div>

                            <div style={{
                                color: '#e8f0e0',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                marginBottom: '25px',
                                padding: '20px',
                                backgroundColor: 'rgba(12, 21, 15, 0.6)',
                                border: '2px solid #2d4715',
                                fontFamily: "'PixelOperator', monospace",
                            }}>
                                Are you sure you want to disconnect and exit the game?
                                <br /><br />
                                Your character will remain in the world.
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                justifyContent: 'center',
                            }}>
                                <button
                                    onClick={handleSignOutConfirm}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(168,68,68,0.9), rgba(120,40,40,0.95))',
                                        color: '#ffffff',
                                        border: '3px solid #f87171',
                                        borderRadius: '0px',
                                        padding: '15px 25px',
                                        fontFamily: "'PixelOperator', monospace",
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2)',
                                        textShadow: '1px 1px 0px rgba(0,0,0,0.4)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(248,113,113,0.95), rgba(168,68,68,1))';
                                        e.currentTarget.style.borderColor = '#f87171';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,68,68,0.9), rgba(120,40,40,0.95))';
                                        e.currentTarget.style.borderColor = '#f87171';
                                    }}
                                >
                                    CONFIRM EXIT
                                </button>

                                <button
                                    onClick={handleSignOutCancel}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(92,142,50,0.85), rgba(60,100,30,0.95))',
                                        color: '#e8f0e0',
                                        border: '3px solid #5c8e32',
                                        borderRadius: '0px',
                                        padding: '15px 25px',
                                        fontFamily: "'PixelOperator', monospace",
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2)',
                                        textShadow: '1px 1px 0px rgba(0,0,0,0.4)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(134,190,82,0.95), rgba(92,142,50,1))';
                                        e.currentTarget.style.borderColor = '#c4e89c';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(92,142,50,0.85), rgba(60,100,30,0.95))';
                                        e.currentTarget.style.borderColor = '#5c8e32';
                                    }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <style>{`
                    @keyframes scanLine {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    
                    @keyframes glow {
                        0% {
                            text-shadow: 0 0 10px rgba(134, 190, 82, 0.45), 0 0 20px rgba(134, 190, 82, 0.4);
                        }
                        100% {
                            text-shadow: 0 0 15px rgba(134, 190, 82, 1), 0 0 30px rgba(134, 190, 82, 0.45);
                        }
                    }
                    
                    @keyframes holodeck-pulse {
                        0% { opacity: 0.3; }
                        100% { opacity: 0.8; }
                    }
                    
                    .grid-background::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background:
                            radial-gradient(circle at 25% 25%, rgba(134, 190, 82, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(134, 190, 82, 0.1) 0%, transparent 50%);
                        animation: holodeck-pulse 8s ease-in-out infinite alternate;
                        pointer-events: none;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default GameMenu; 