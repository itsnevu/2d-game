import React from 'react';
import styles from './MenuComponents.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faVolumeUp, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { useSettings } from '../contexts/SettingsContext';

// Default audio settings based on optimal neural processing thresholds
export const DEFAULT_AUDIO_SETTINGS = {
    musicVolume: 0.20,        // 20% - Neural Harmony Levels (Cortical Music Enhancement)
    soundVolume: 0.50,       // 50% - Haptic Feedback Matrix (Neural Action Response)
    environmentalVolume: 1.00 // 100% - Atmospheric Sensors (Environmental Analysis)
} as const;

interface GameSettingsMenuProps {
    onBack: () => void;
    onClose: () => void;
}

const GameSettingsMenu: React.FC<GameSettingsMenuProps> = ({
    onBack,
    onClose,
}) => {
    const {
        musicVolume,
        soundVolume,
        environmentalVolume,
        setMusicVolume: onMusicVolumeChange,
        setSoundVolume: onSoundVolumeChange,
        setEnvironmentalVolume: onEnvironmentalVolumeChange,
    } = useSettings();
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onBack();
        }
    };

    const formatVolume = (volume: number) => `${Math.round(volume * 100)}%`;

    const settingCardStyle: React.CSSProperties = {
        marginBottom: '25px',
        padding: '14px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(0, 0, 0, 0.45)',
        background: 'rgba(0, 0, 0, 0.42)',
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.35)',
    };

    return (
        <>

            
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(16, 30, 22, 0.95), rgba(12, 21, 15, 0.98))',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 100000,
                    backdropFilter: 'blur(8px)',
                }}
                onClick={handleBackdropClick}
            >

            <div
                className={styles.menuContainer}
                style={{
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    background: 'linear-gradient(145deg, rgba(16, 30, 22, 0.95), rgba(12, 21, 15, 0.98))',
                    border: '2px solid #86be52',
                    borderRadius: '12px',
                    boxShadow: '0 0 30px rgba(134, 190, 82, 0.45), inset 0 0 20px rgba(134, 190, 82, 0.1)',
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
                    background: 'linear-gradient(90deg, transparent, #86be52, transparent)',
                    animation: 'scanLine 3s linear infinite',
                }} />

                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <h2
                        style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '22px',
                            color: '#86be52',
                            textAlign: 'center',
                            marginBottom: '8px',
                            textShadow: '0 0 10px rgba(134, 190, 82, 0.45), 0 0 20px rgba(134, 190, 82, 0.4)',
                            animation: 'glow 2s ease-in-out infinite alternate',
                            letterSpacing: '2px',
                        }}
                    >
                        AUDITORY CORTEX MODULE
                    </h2>
                    <div
                        style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '12px',
                            color: '#9ab08a',
                            textAlign: 'center',
                            letterSpacing: '1px',
                            opacity: 0.8,
                        }}
                    >
                        Neural Audio Processing Interface v0.82
                    </div>
                </div>
                
                <div style={{ padding: '20px 0' }}>
                    <div style={settingCardStyle}>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '16px',
                            color: '#86be52',
                            marginBottom: '12px',
                            textShadow: '0 0 8px #86be52',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <FontAwesomeIcon
                                icon={faMusic}
                                style={{
                                    color: '#86be52',
                                    textShadow: '0 0 8px #86be52',
                                    fontSize: '14px',
                                }}
                            />
                            NEURAL HARMONY LEVELS: {Math.round(musicVolume * 100)}%
                        </div>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '12px',
                            color: '#9ab08a',
                            marginBottom: '8px',
                            opacity: 0.7,
                            letterSpacing: '0.5px',
                            textAlign: 'left',
                        }}>
                            Cortical Music Enhancement, Ambient Synthesis
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={musicVolume}
                            onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                margin: '8px 0',
                            }}
                        />
                    </div>
                    
                    <div style={settingCardStyle}>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '16px',
                            color: '#86be52',
                            marginBottom: '12px',
                            textShadow: '0 0 8px #86be52',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <FontAwesomeIcon
                                icon={faVolumeUp}
                                style={{
                                    color: '#86be52',
                                    textShadow: '0 0 8px #86be52',
                                    fontSize: '14px',
                                }}
                            />
                            HAPTIC FEEDBACK MATRIX: {Math.round(soundVolume * 100)}%
                        </div>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '12px',
                            color: '#9ab08a',
                            marginBottom: '8px',
                            opacity: 0.7,
                            letterSpacing: '0.5px',
                            textAlign: 'left',
                        }}>
                            Neural Action Response, Item Recognition
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={soundVolume}
                            onChange={(e) => onSoundVolumeChange(parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                margin: '8px 0',
                            }}
                        />
                    </div>
                    
                    <div style={settingCardStyle}>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '16px',
                            color: '#86be52',
                            marginBottom: '12px',
                            textShadow: '0 0 8px #86be52',
                            letterSpacing: '1px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <FontAwesomeIcon
                                icon={faLeaf}
                                style={{
                                    color: '#86be52',
                                    textShadow: '0 0 8px #86be52',
                                    fontSize: '14px',
                                }}
                            />
                            ATMOSPHERIC SENSORS: {Math.round(environmentalVolume * 100)}%
                        </div>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '12px',
                            color: '#9ab08a',
                            marginBottom: '8px',
                            opacity: 0.7,
                            letterSpacing: '0.5px',
                            textAlign: 'left',
                        }}>
                            Weather Synthesis, Environmental Analysis
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={environmentalVolume}
                            onChange={(e) => onEnvironmentalVolumeChange(parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                margin: '8px 0',
                            }}
                        />
                    </div>

                    {/* Defaults preset */}
                    <div style={settingCardStyle}>
                        <div style={{
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '11px',
                            color: '#c4e89c',
                            opacity: 0.8,
                            marginBottom: '10px',
                            textAlign: 'left',
                            letterSpacing: '0.7px',
                        }}>
                            PRESETS
                        </div>
                        <button
                            onClick={() => {
                                onMusicVolumeChange(DEFAULT_AUDIO_SETTINGS.musicVolume);
                                onSoundVolumeChange(DEFAULT_AUDIO_SETTINGS.soundVolume);
                                onEnvironmentalVolumeChange(DEFAULT_AUDIO_SETTINGS.environmentalVolume);
                            }}
                            className={styles.menuButton}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, rgba(30, 65, 45, 0.85), rgba(20, 45, 30, 0.95))',
                                color: '#ffffff',
                                border: '2px solid #86be52',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                fontFamily: "'PixelOperator', monospace",
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.12)',
                                textShadow: '0 0 5px rgba(134, 190, 82, 0.85)',
                                letterSpacing: '1px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(45, 85, 60, 0.95), rgba(25, 55, 38, 1))';
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(134, 190, 82, 0.45), inset 0 0 15px rgba(134, 190, 82, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 65, 45, 0.85), rgba(20, 45, 30, 0.95))';
                                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.12)';
                            }}
                        >
                            DEFAULTS (20% / 50% / 100%)
                        </button>
                    </div>
                </div>
                
                <div className={styles.menuButtons}>
                    <button
                        onClick={onBack}
                        className={styles.menuButton}
                        style={{
                            background: 'linear-gradient(135deg, rgba(92, 142, 50, 0.55), rgba(45, 71, 21, 0.85))',
                            color: '#e8f0e0',
                            border: '2px solid #86be52',
                            borderRadius: '8px',
                            padding: '15px 30px',
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 15px rgba(134, 190, 82, 0.3), inset 0 0 10px rgba(134, 190, 82, 0.1)',
                            textShadow: '0 0 5px rgba(134, 190, 82, 0.8)',
                            letterSpacing: '1px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(134, 190, 82, 0.7), rgba(92, 142, 50, 0.95))';
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(134, 190, 82, 0.6), inset 0 0 15px rgba(134, 190, 82, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(92, 142, 50, 0.55), rgba(45, 71, 21, 0.85))';
                            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.3), inset 0 0 10px rgba(134, 190, 82, 0.1)';
                        }}
                    >
                        NEURAL INTERFACE MENU
                    </button>
                    <button
                        onClick={onClose}
                        className={`${styles.menuButton} ${styles.menuButtonPrimary}`}
                        style={{
                            background: 'linear-gradient(135deg, rgba(22, 41, 29, 0.8), rgba(16, 30, 22, 0.9))',
                            color: '#ffffff',
                            border: '2px solid #5c8e32',
                            borderRadius: '8px',
                            padding: '15px 30px',
                            fontFamily: "'PixelOperator', monospace",
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.1)',
                            textShadow: '0 0 5px rgba(134, 190, 82, 0.8)',
                            letterSpacing: '1px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(30, 56, 39, 0.9), rgba(22, 41, 29, 1))';
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(134, 190, 82, 0.45), inset 0 0 15px rgba(134, 190, 82, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(22, 41, 29, 0.8), rgba(16, 30, 22, 0.9))';
                            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.1)';
                        }}
                    >
                        RESUME CONSCIOUSNESS
                    </button>
                </div>
                
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
                `}</style>
            </div>
        </div>
        </>
    );
};

export default GameSettingsMenu; 