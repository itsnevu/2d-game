import { Connection, PublicKey, Keypair, AccountInfo, Context } from '@solana/web3.js';
import axios from 'axios';
import WebSocket, { RawData } from 'ws';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
const SPACETIME_URL = process.env.SPACETIME_URL || 'http://127.0.0.1:3000';
const SPACETIME_WS_URL = process.env.SPACETIME_WS_URL || 'ws://127.0.0.1:3000';
const DATABASE_NAME = process.env.DATABASE_NAME || 'broth-bullets-local';

// Admin relayer keypair
const ADMIN_KEYPAIR_SECRET = process.env.ADMIN_KEYPAIR_SECRET
    ? Uint8Array.from(JSON.parse(process.env.ADMIN_KEYPAIR_SECRET))
    : new Uint8Array(64); // Fallback mock
const adminKeypair = Keypair.fromSecretKey(ADMIN_KEYPAIR_SECRET);

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

console.log('=== Web3 Relayer Bridge Started ===');
console.log(`Connected to Solana RPC: ${SOLANA_RPC_URL}`);
console.log(`Connected to SpacetimeDB: ${SPACETIME_URL}`);
console.log(`Admin public key: ${adminKeypair.publicKey.toBase58()}`);

/**
 * 1. Listening to Solana transactions (Deposit -> SpacetimeDB enter_wilderness)
 */
async function watchSolanaEvents() {
    // Escrow account public key (PDA derived from our Anchor program)
    const ESCROW_VAULT_ADDRESS = new PublicKey(
        process.env.ESCROW_VAULT_ADDRESS || 'EscrowVaultAddress11111111111111111111111'
    );

    console.log(`Watching Solana Escrow Vault address: ${ESCROW_VAULT_ADDRESS.toBase58()}`);

    connection.onAccountChange(
        ESCROW_VAULT_ADDRESS,
        async (accountInfo: AccountInfo<Buffer>, context: Context) => {
            console.log('[Solana] Escrow account state changed. Parsing transaction...');
            
            // In a real implementation:
            // - Fetch the latest transactions for the vault account.
            // - Parse the Anchor CPI logs to extract player_identity and deposit_amount.
            // - Send POST to SpacetimeDB enter_wilderness reducer.
            
            // Simulation log:
            console.log(`[Solana] Current vault lamports/token balance: ${accountInfo.lamports}`);
        },
        'confirmed'
    );
}

/**
 * 2. Listening to SpacetimeDB events (Player Death -> Solana settle_wilderness_defeat)
 */
async function watchSpacetimeDBEvents() {
    const wsUrl = `${SPACETIME_WS_URL}/v1/database/${DATABASE_NAME}/subscribe`;
    console.log(`Subscribing to SpacetimeDB events: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('[SpacetimeDB WS] WebSocket connection established.');
        // Subscribe to Player and DeathMarker table updates
        const subscriptionMessage = {
            subscribe: {
                queries: [
                    'SELECT * FROM player',
                    'SELECT * FROM death_marker'
                ]
            }
        };
        ws.send(JSON.stringify(subscriptionMessage));
    });

    ws.on('message', async (data: RawData) => {
        try {
            const msg = JSON.parse(data.toString());
            
            // SpacetimeDB subscription returns updates when table data changes
            if (msg.table_row_update) {
                const { table_name, action, row } = msg.table_row_update;
                
                if (table_name === 'death_marker' && action === 'INSERT') {
                    // Extract death coordinates and killer info
                    const [player_id, pos_x, pos_y, timestamp, killer_id, cause] = row;
                    
                    console.log(`[SpacetimeDB] Player death detected: Player ${player_id} killed by ${killer_id} at (${pos_x}, ${pos_y})`);
                    
                    // Check if death happened in the Wilderness Zone (pos_x >= 4000)
                    if (pos_x >= 4000.0 && killer_id) {
                        console.log('[SpacetimeDB] Death occurred in Wilderness PvP! Resolving on-chain bounty...');
                        await settleOnChainDefeat(player_id, killer_id);
                    }
                }
            }
        } catch (err) {
            console.error('[SpacetimeDB WS] Error parsing message:', err);
        }
    });

    ws.on('error', (err: Error) => {
        console.error('[SpacetimeDB WS] Connection error:', err);
    });

    ws.on('close', () => {
        console.log('[SpacetimeDB WS] Connection closed. Reconnecting in 5s...');
        setTimeout(watchSpacetimeDBEvents, 5000);
    });
}

/**
 * Settle Wilderness PvP staked tokens on Solana
 */
async function settleOnChainDefeat(defeatedPlayerId: string, killerId: string) {
    console.log(`[Solana Relayer] Triggering settle_wilderness_defeat transaction...`);
    console.log(`Defeated Player Identity: ${defeatedPlayerId}`);
    console.log(`Killer Player Identity: ${killerId}`);

    try {
        // In a real implementation:
        // - Build the transaction calling our Anchor program's settle_wilderness_defeat instruction.
        // - Sign the transaction with adminKeypair.
        // - Send the transaction using Solana Connection client.
        
        // Mock Solana Transaction send:
        const txSignature = 'MOCK_TX_SIGNATURE_55h7x98djd8s8d8s8df8s8d8fs8d8s8f8df8s';
        console.log(`[Solana] Successfully settled PvP defeat on-chain. TX: ${txSignature}`);
        
    } catch (error) {
        console.error('[Solana] Error sending settlement transaction:', error);
    }
}

// Start Relayers
watchSolanaEvents();
watchSpacetimeDBEvents();
