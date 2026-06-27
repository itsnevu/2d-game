import React, { useRef } from 'react';
import styles from './MenuComponents.module.css';
import { tipSections } from '../utils/gameKnowledgeExtractor';

interface GameTipsMenuProps {
    onBack: () => void;
    onClose: () => void;
}

const GameTipsMenu: React.FC<GameTipsMenuProps> = ({ onBack, onClose }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onBack();
        }
    };

    // Function to scroll to a specific section
    const scrollToSection = (sectionIndex: number) => {
        if (contentRef.current) {
            const sectionElements = contentRef.current.querySelectorAll('[data-section]');
            const targetSection = sectionElements[sectionIndex] as HTMLElement;
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    };

    // Extract emojis from section titles for the table of contents
    const sectionEmojis = tipSections.map(section => {
        const emojiMatch = section.title.match(/^(\p{Emoji})/u);
        return emojiMatch ? emojiMatch[1] : '';
    });

    const sectionNames = tipSections.map(section => {
        return section.title.replace(/^(\p{Emoji})\s*/u, '');
    });

    // Add escape key handler
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onBack(); // Return to main menu instead of closing entirely
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onBack]);

    return (
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
                zIndex: 2000,
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
                    boxShadow: '0 0 30px rgba(134, 190, 82, 0.45), inset 0 0 20px rgba(134, 190, 82, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className={styles.menuTitle}
                    style={{
                        fontFamily: "var(--ui-font)",
                        fontSize: '24px',
                        color: '#86be52',
                        textAlign: 'center',
                        marginBottom: '15px',
                        textShadow: '0 0 10px rgba(134, 190, 82, 0.8), 0 0 20px rgba(134, 190, 82, 0.45)',
                    }}
                >
                    TACTICAL KNOWLEDGE MATRIX
                </h2>

                <div
                    style={{
                        fontFamily: "var(--ui-font)",
                        fontSize: '12px',
                        color: '#9ab08a',
                        textAlign: 'center',
                        letterSpacing: '1px',
                        opacity: 0.8,
                        marginBottom: '20px',
                    }}
                >
                    Neural Survival Protocol Database v0.82
                </div>

                {/* Table of Contents */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '20px',
                    padding: '10px 15px',
                    background: 'linear-gradient(135deg, rgba(16, 30, 22, 0.8), rgba(12, 21, 15, 0.9))',
                    borderRadius: '8px',
                    border: '1px solid rgba(134, 190, 82, 0.2)',
                    margin: '0 15px 20px 15px',
                }}>
                    {sectionEmojis.map((emoji, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                            }}
                        >
                            <button
                                onClick={() => scrollToSection(index)}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16, 30, 22, 0.8), rgba(12, 21, 15, 0.9))',
                                    border: '2px solid rgba(134, 190, 82, 0.4)',
                                    borderRadius: '6px',
                                    padding: '8px 10px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 0 8px rgba(134, 190, 82, 0.2)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.4)';
                                    e.currentTarget.style.borderColor = 'rgba(134, 190, 82, 0.8)';
                                    // Show tooltip
                                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (tooltip) tooltip.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 0 8px rgba(134, 190, 82, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(134, 190, 82, 0.4)';
                                    // Hide tooltip
                                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (tooltip) tooltip.style.opacity = '0';
                                }}
                            >
                                {emoji}
                            </button>
                            {/* Tooltip */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    marginBottom: '8px',
                                    padding: '6px 10px',
                                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.98))',
                                    color: '#86be52',
                                    border: '1px solid #86be52',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontFamily: "var(--ui-font)",
                                    whiteSpace: 'nowrap',
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    transition: 'opacity 0.3s ease',
                                    zIndex: 1000,
                                    textShadow: '0 0 5px rgba(134, 190, 82, 0.8)',
                                    boxShadow: '0 0 10px rgba(134, 190, 82, 0.45)',
                                }}
                            >
                                {sectionNames[index]}
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '5px solid transparent',
                                    borderRight: '5px solid transparent',
                                    borderTop: '5px solid #86be52',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div 
                    ref={contentRef}
                    data-scrollable-region="tips-content"
                    className={`${styles.scrollableSection} ${styles.menuContent}`}
                >
                    {tipSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} data-section={sectionIndex}>
                            <h3
                                style={{
                                    fontFamily: "var(--ui-font)",
                                    fontSize: '16px',
                                    color: '#5c8e32',
                                    marginBottom: '15px',
                                    textShadow: '0 0 8px rgba(134, 190, 82, 0.8)',
                                }}
                            >
                                {section.title}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {section.tips.map((tip, tipIndex) => (
                                    <div
                                        key={tipIndex}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            padding: '15px 18px',
                                            background: 'linear-gradient(135deg, rgba(16, 30, 22, 0.6), rgba(12, 21, 15, 0.8))',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(134, 190, 82, 0.3)',
                                            boxShadow: '0 0 10px rgba(134, 190, 82, 0.1), inset 0 0 5px rgba(134, 190, 82, 0.05)',
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "var(--ui-font)",
                                                fontSize: '14px',
                                                color: '#ffdd44',
                                                marginRight: '12px',
                                                marginTop: '2px',
                                                textShadow: '0 0 6px rgba(255, 221, 68, 0.6)',
                                            }}
                                        >
                                            •
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "var(--ui-font)",
                                                fontSize: '14px',
                                                color: '#ffffff',
                                                lineHeight: '1.7',
                                                flex: 1,
                                                textAlign: 'left',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                hyphens: 'auto',
                                                textShadow: '0 0 4px rgba(255, 255, 255, 0.4)',
                                            }}
                                        >
                                            {tip}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                            fontFamily: "var(--ui-font)",
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
                            background: 'linear-gradient(135deg, rgba(16, 30, 22, 0.8), rgba(12, 21, 15, 0.9))',
                            color: '#ffffff',
                            border: '2px solid #5c8e32',
                            borderRadius: '8px',
                            padding: '15px 30px',
                            fontFamily: "var(--ui-font)",
                            fontSize: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 15px rgba(134, 190, 82, 0.3), inset 0 0 10px rgba(134, 190, 82, 0.1)',
                            textShadow: '0 0 5px rgba(134, 190, 82, 0.8)',
                            letterSpacing: '1px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(22, 42, 30, 0.9), rgba(16, 30, 22, 1))';
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 0 25px rgba(134, 190, 82, 0.6), inset 0 0 15px rgba(134, 190, 82, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 30, 22, 0.8), rgba(12, 21, 15, 0.9))';
                            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.3), inset 0 0 10px rgba(134, 190, 82, 0.1)';
                        }}
                    >
                        RESUME CONSCIOUSNESS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameTipsMenu; 