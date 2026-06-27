import React from 'react';

interface GameMenuButtonProps {
    onClick: () => void;
}

const GameMenuButton: React.FC<GameMenuButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '15px',
                left: '15px',
                zIndex: 999,
                background: 'linear-gradient(135deg, #101e16, #0c150f)',
                color: '#86be52',
                border: '2px solid #5c8e32',
                borderRadius: '8px',
                padding: '10px 12px',
                fontFamily: "'PixelOperator', monospace",
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.1)',
                transition: 'all 0.3s ease',
                textShadow: '0 0 8px rgba(134, 190, 82, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                width: '44px',
                height: '44px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #16291d, #101e16)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(134, 190, 82, 0.45), inset 0 0 15px rgba(134, 190, 82, 0.2)';
                e.currentTarget.style.textShadow = '0 0 12px rgba(196, 232, 156, 1), 0 0 20px rgba(134, 190, 82, 0.45)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #101e16, #0c150f)';
                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(134, 190, 82, 0.45), inset 0 0 10px rgba(134, 190, 82, 0.1)';
                e.currentTarget.style.textShadow = '0 0 8px rgba(134, 190, 82, 0.45)';
            }}
            aria-label="Open game menu"
        >
            {/* Hamburger icon - three horizontal lines */}
            <span style={{
                display: 'block',
                width: '18px',
                height: '2px',
                backgroundColor: '#86be52',
                borderRadius: '1px',
                boxShadow: '0 0 4px rgba(134, 190, 82, 0.45)',
            }} />
            <span style={{
                display: 'block',
                width: '18px',
                height: '2px',
                backgroundColor: '#86be52',
                borderRadius: '1px',
                boxShadow: '0 0 4px rgba(134, 190, 82, 0.45)',
            }} />
            <span style={{
                display: 'block',
                width: '18px',
                height: '2px',
                backgroundColor: '#86be52',
                borderRadius: '1px',
                boxShadow: '0 0 4px rgba(134, 190, 82, 0.45)',
            }} />
        </button>
    );
};

export default GameMenuButton;
