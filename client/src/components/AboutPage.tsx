import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogHeader from '../common/BlogHeader';
import ShipwreckCarousel from './ShipwreckCarousel';
import GameplayFeaturesCarousel from './GameplayFeaturesCarousel';
// @ts-ignore
import { blogPosts } from '../blog/data/blogPosts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

    const isMobile = window.innerWidth <= 768;

    const UI_BRAND_FONT = "'KiwiSoda', sans-serif";
    const UI_FONT_FAMILY = "'PixelOperator', sans-serif";

    // FAQ Data
    const faqData = [
        {
            q: "WHAT IS WILDER?",
            a: "WILDER is a top-down 2D multiplayer survival MMORPG built on Solana. Buy your entry ticket with $WLDR tokens, survive the wilderness, build shelters (taxed via proof-of-burn), fight in PvP zones where death means dropping tokens, trade on the Auction House, and compete in a living economy where scarcity is enforced by smart contracts."
        },
        {
            q: "HOW DO I PLAY?",
            a: "Connect your Solana wallet, acquire $WLDR tokens, choose a username, and enter the game. You'll need to gather resources, craft equipment, manage hunger, and coordinate with other players to build bases and defend against hostile players."
        },
        {
            q: "WHAT IS THE $WLDR TOKEN?",
            a: "The $WLDR token is the native utility token of the WILDER ecosystem. It is used for buying/selling items on the Auction House, paying base taxes, and unlocking high-tier crafting systems."
        },
        {
            q: "IS THERE PvP?",
            a: "Yes! There are designated PvP zones where player combat is fully enabled. Be careful: when you die in PvP zones, you drop your items and a portion of your token stakes!"
        }
    ];

    return (
        <div style={{
            backgroundColor: '#0D0D0D',
            color: 'white',
            fontFamily: UI_FONT_FAMILY,
            minHeight: '100vh',
            paddingTop: '80px',
            overflowX: 'hidden',
        }}>
            <BlogHeader />

            {/* About Section */}
            <div style={{
                maxWidth: '1200px',
                margin: '60px auto',
                padding: '0 20px',
            }}>
                <div style={{
                    backgroundColor: 'rgba(14, 12, 10, 0.85)',
                    border: '1px solid rgba(200, 162, 60, 0.2)',
                    borderRadius: '16px',
                    padding: '40px',
                    marginBottom: '40px',
                }}>
                    <h2 style={{
                        fontFamily: UI_BRAND_FONT,
                        color: '#C8A23C',
                        fontSize: '36px',
                        marginBottom: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                    }}>
                        About WILDER
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}>
                        A brutal top-down multiplayer survival MMORPG powered by <strong>Web3 on Solana</strong>.
                        Survive the wilderness, build shelters with proof-of-burn mechanics, fight for loot in the <strong>Wilderness PvP</strong> zone,
                        trade rare items on the <strong>Auction House</strong>, and stake your claim in a world where every token burned keeps the economy alive.
                        The wild doesn't forgive. The wild doesn't forget. But those who master it... they become legends.
                    </p>
                </div>

                {/* Shipwreck / Loadout Carousel */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{
                        fontFamily: UI_BRAND_FONT,
                        color: '#C8A23C',
                        fontSize: '36px',
                        marginBottom: '24px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                    }}>
                        Survival Toolkit
                    </h2>
                    <ShipwreckCarousel />
                </div>

                {/* Gameplay Features */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{
                        fontFamily: UI_BRAND_FONT,
                        color: '#C8A23C',
                        fontSize: '36px',
                        marginBottom: '24px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                    }}>
                        Wilderness Features
                    </h2>
                    <GameplayFeaturesCarousel />
                </div>

                {/* FAQ Section */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{
                        fontFamily: UI_BRAND_FONT,
                        color: '#C8A23C',
                        fontSize: '36px',
                        marginBottom: '24px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                    }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {faqData.map((item, idx) => (
                            <div 
                                key={idx}
                                style={{
                                    border: '1px solid rgba(200, 162, 60, 0.2)',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(14, 12, 10, 0.6)',
                                    overflow: 'hidden',
                                }}
                            >
                                <button
                                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                                    style={{
                                        width: '100%',
                                        padding: '20px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#C8A23C',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        textAlign: 'left',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{item.q}</span>
                                    <FontAwesomeIcon icon={expandedFaqIndex === idx ? faChevronDown : faChevronRight} />
                                </button>
                                {expandedFaqIndex === idx && (
                                    <div style={{
                                        padding: '0 20px 20px 20px',
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        lineHeight: '1.6',
                                        fontSize: '16px',
                                    }}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                backgroundColor: 'rgba(8, 8, 8, 0.95)',
                borderTop: '1px solid rgba(200, 162, 60, 0.25)',
                padding: '40px 20px',
                textAlign: 'center',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px',
                }}>
                    <span style={{
                        fontFamily: UI_BRAND_FONT,
                        fontSize: '28px',
                        color: '#C8A23C',
                        textShadow: '2px 2px 0px #000',
                    }}>
                        WILDER
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                        © 2026 WILDER. All rights reserved.
                    </span>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <a href="https://discord.gg/tUcBzfAYfs" target="_blank" rel="noopener noreferrer" style={{ color: '#C8A23C', fontSize: '20px' }}>
                            <FontAwesomeIcon icon={faDiscord} />
                        </a>
                        <a href="https://x.com/seloslav" target="_blank" rel="noopener noreferrer" style={{ color: '#C8A23C', fontSize: '20px' }}>
                            <FontAwesomeIcon icon={faXTwitter} />
                        </a>
                        <a href="https://github.com/itsnevu/2d-game" target="_blank" rel="noopener noreferrer" style={{ color: '#C8A23C', fontSize: '20px' }}>
                            <FontAwesomeIcon icon={faGithub} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
