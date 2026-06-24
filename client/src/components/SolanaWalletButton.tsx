import React, { useState } from 'react';

interface SolanaWalletButtonProps {
    onConnect?: (publicKey: string) => void;
}

export const SolanaWalletButton: React.FC<SolanaWalletButtonProps> = ({ onConnect }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);
        // Simulate Phantom/Solflare wallet extension connection
        setTimeout(() => {
            const mockAddress = 'V1beGameAddress1111111111111111111111111';
            setWalletAddress(mockAddress);
            setConnecting(false);
            if (onConnect) {
                onConnect(mockAddress);
            }
        }, 1200);
    };

    const handleDisconnect = () => {
        setWalletAddress(null);
    };

    return (
        <button
            onClick={walletAddress ? handleDisconnect : handleConnect}
            style={{
                background: walletAddress 
                    ? 'linear-gradient(135deg, rgba(92, 142, 50, 0.2), rgba(220, 38, 38, 0.3))' 
                    : 'linear-gradient(135deg, rgba(153, 50, 204, 0.4), rgba(72, 61, 139, 0.6))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                padding: '10px 18px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(153, 50, 204, 0.4)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
        >
            {connecting 
                ? 'Connecting...' 
                : walletAddress 
                    ? `Wallet: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` 
                    : 'Connect Solana Wallet'}
        </button>
    );
};
