import React, { useState, useMemo } from 'react';
import { useGameConnection } from '../contexts/GameConnectionContext';
import { useLocalPlayer, useUITable, useWorldTable } from '../engine/react/selectors';
import { Identity } from 'spacetimedb';
import './Web3HubPanel.css';

type SubTab = 'wilderness' | 'auction' | 'scholarship' | 'tax';

export const Web3HubPanel: React.FC = () => {
  const { connection, isConnected, dbIdentity } = useGameConnection();
  const playerIdentity = dbIdentity;
  const localPlayer = useLocalPlayer(playerIdentity?.toHexString() ?? null);

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('wilderness');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Table Subscriptions
  const playersTable = useWorldTable<Map<string, any>>('players');
  const sheltersTable = useWorldTable<Map<string, any>>('shelters');
  const auctionItemsTable = useUITable<Map<string, any>>('auction_items') || new Map();
  const inventoryItems = useUITable<any[]>('inventory_items') || [];
  const itemDefinitions = useUITable<any[]>('item_definitions') || [];

  // Local Player Info
  const goldBalance = localPlayer ? Number(localPlayer.goldBalance) : 0;
  const stakedBounty = localPlayer ? Number(localPlayer.stakedBounty) : 0;
  const isInWildernessZone = localPlayer ? (localPlayer.positionX >= 4000.0) : false;

  // Wilderness PvP State & Logic
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [isProcessingWilderness, setIsProcessingWilderness] = useState(false);

  const handleEnterWilderness = async () => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    if (stakeAmount <= 0) {
      setError('Staking amount must be greater than 0.');
      return;
    }
    if (goldBalance < stakeAmount) {
      setError('Insufficient gold balance.');
      return;
    }
    setIsProcessingWilderness(true);
    try {
      await (connection.reducers as any).enterWilderness({ bountyAmount: BigInt(stakeAmount) });
      setSuccess(`Successfully staked ${stakeAmount} gold for Wilderness entry.`);
    } catch (err: any) {
      setError(err?.toString() || 'Failed to enter Wilderness.');
    } finally {
      setIsProcessingWilderness(false);
    }
  };

  const handleExitWilderness = async () => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    if (isInWildernessZone) {
      setError('Cannot reclaim bounty while inside the Wilderness zone. Move to safety first.');
      return;
    }
    setIsProcessingWilderness(true);
    try {
      await (connection.reducers as any).exitWilderness({});
      setSuccess('Successfully exited Wilderness and reclaimed your staked bounty.');
    } catch (err: any) {
      setError(err?.toString() || 'Failed to exit Wilderness.');
    } finally {
      setIsProcessingWilderness(false);
    }
  };

  // Auction House State & Logic
  const [auctionSubTab, setAuctionSubTab] = useState<'browse' | 'create' | 'claims'>('browse');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string>('');
  const [auctionQty, setAuctionQty] = useState<number>(1);
  const [startingPrice, setStartingPrice] = useState<number>(10);
  const [auctionDuration, setAuctionDuration] = useState<number>(3600); // 1 hour default
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [activeBidAuctionId, setActiveBidAuctionId] = useState<string | null>(null);
  const [isProcessingAuction, setIsProcessingAuction] = useState(false);

  // Fetch all player items in inventory that can be listed
  const playerItems = useMemo(() => {
    if (!playerIdentity) return [];
    return inventoryItems.filter((item: any) => {
      const location = item.location;
      if (!location || !('value' in location)) return false;
      const ownerId = (location.value as any).ownerId;
      const isOwned = ownerId && playerIdentity && (ownerId === playerIdentity || ownerId.toString() === playerIdentity.toString());
      return isOwned && (location.tag === 'Inventory' || location.tag === 'Hotbar');
    });
  }, [inventoryItems, playerIdentity]);

  // Fetch active auctions
  const activeAuctions = useMemo(() => {
    return Array.from(auctionItemsTable.values()).filter((auc: any) => !auc.isClaimed);
  }, [auctionItemsTable]);

  // Fetch ended/claimable auctions related to player
  const claimableAuctions = useMemo(() => {
    if (!playerIdentity) return [];
    const playerHex = playerIdentity.toHexString();
    return Array.from(auctionItemsTable.values()).filter((auc: any) => {
      const isSeller = auc.seller?.toHexString() === playerHex;
      const isHighestBidder = auc.highestBidder?.toHexString() === playerHex;
      const isExpired = Date.now() >= Number(auc.endTime?.microsSinceUnixEpoch ?? 0) / 1000;
      return (isSeller || isHighestBidder) && (auc.isClaimed === false && (isExpired || auc.highestBidder === null));
    });
  }, [auctionItemsTable, playerIdentity]);

  const handleListAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection || !connection.reducers || !selectedInventoryItem) return;
    setError(null);
    setSuccess(null);
    setIsProcessingAuction(true);

    try {
      const itemId = BigInt(selectedInventoryItem);
      await (connection.reducers as any).listItemForAuction({
        itemInstanceId: itemId,
        quantity: auctionQty,
        startingPrice: BigInt(startingPrice),
        durationSecs: BigInt(auctionDuration)
      });
      setSuccess('Successfully listed item for auction.');
      setSelectedInventoryItem('');
      setAuctionQty(1);
      setStartingPrice(10);
    } catch (err: any) {
      setError(err?.toString() || 'Failed to list item.');
    } finally {
      setIsProcessingAuction(false);
    }
  };

  const handlePlaceBid = async (auctionId: string) => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    if (bidAmount <= 0) {
      setError('Bid amount must be greater than 0.');
      return;
    }
    setIsProcessingAuction(true);

    try {
      await (connection.reducers as any).placeBid({
        auctionId: BigInt(auctionId),
        bidAmount: BigInt(bidAmount)
      });
      setSuccess(`Successfully placed bid of ${bidAmount} Gold.`);
      setActiveBidAuctionId(null);
      setBidAmount(0);
    } catch (err: any) {
      setError(err?.toString() || 'Failed to place bid.');
    } finally {
      setIsProcessingAuction(false);
    }
  };

  const handleClaimAuction = async (auctionId: string) => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    setIsProcessingAuction(true);

    try {
      await (connection.reducers as any).claimAuctionRewards({
        auctionId: BigInt(auctionId)
      });
      setSuccess('Successfully claimed auction rewards/return.');
    } catch (err: any) {
      setError(err?.toString() || 'Failed to claim rewards.');
    } finally {
      setIsProcessingAuction(false);
    }
  };

  // Scholarship State & Logic
  const [scholarIdInput, setScholarIdInput] = useState('');
  const [shareRatioInput, setShareRatioInput] = useState<number>(70);
  const [isProcessingScholarship, setIsProcessingScholarship] = useState(false);

  // Get active scholar sponsored by this player, or active owner sponsoring this player
  const scholarshipInfo = useMemo(() => {
    if (!playerIdentity) return null;
    const playerHex = playerIdentity.toHexString();

    const isScholarOfSomeOwner = localPlayer?.ownerIdentity ? localPlayer.ownerIdentity : null;
    const isOwnerOfSomeScholar = Array.from(playersTable.values()).find(
      (p: any) => p.ownerIdentity?.toHexString() === playerHex
    );

    return {
      sponsoredBy: isScholarOfSomeOwner,
      sponsoring: isOwnerOfSomeScholar,
      ratio: localPlayer?.goldShareRatio ?? 1.0
    };
  }, [playersTable, playerIdentity, localPlayer]);

  const handleRegisterScholar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection || !connection.reducers || !scholarIdInput) return;
    setError(null);
    setSuccess(null);
    setIsProcessingScholarship(true);

    try {
      const scholarIdentity = Identity.fromString(scholarIdInput);
      const ratio = shareRatioInput / 100.0;
      await (connection.reducers as any).registerScholar({
        scholarIdentity,
        shareRatio: ratio
      });
      setSuccess(`Successfully registered Scholar ${scholarIdInput.substring(0, 8)}... with ${shareRatioInput}% share.`);
      setScholarIdInput('');
    } catch (err: any) {
      setError(err?.toString() || 'Failed to register scholar.');
    } finally {
      setIsProcessingScholarship(false);
    }
  };

  const handleEndScholarRental = async (targetId: Identity) => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    setIsProcessingScholarship(true);

    try {
      await (connection.reducers as any).endScholarRental({
        scholarIdentity: targetId
      });
      setSuccess('Rental contract terminated successfully.');
    } catch (err: any) {
      setError(err?.toString() || 'Failed to end rental.');
    } finally {
      setIsProcessingScholarship(false);
    }
  };

  // Shelter Tax State & Logic
  const [shelterTaxAmount, setShelterTaxAmount] = useState<number>(50);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [isProcessingTax, setIsProcessingTax] = useState(false);

  // Filter shelters owned by player
  const playerShelters = useMemo(() => {
    if (!playerIdentity) return [];
    const playerHex = playerIdentity.toHexString();
    return Array.from(sheltersTable.values()).filter(
      (s: any) => s.placedBy?.toHexString() === playerHex && !s.isDestroyed
    );
  }, [sheltersTable, playerIdentity]);

  const handlePayTax = async (shelterId: number) => {
    if (!connection || !connection.reducers) return;
    setError(null);
    setSuccess(null);
    if (goldBalance < shelterTaxAmount) {
      setError('Insufficient gold balance.');
      return;
    }
    setIsProcessingTax(true);

    try {
      await (connection.reducers as any).payShelterTax({
        shelterId,
        goldAmount: BigInt(shelterTaxAmount)
      });
      setSuccess(`Successfully paid ${shelterTaxAmount} Gold in shelter tax (tokens burned).`);
      setSelectedShelterId(null);
    } catch (err: any) {
      setError(err?.toString() || 'Failed to pay shelter tax.');
    } finally {
      setIsProcessingTax(false);
    }
  };

  // Utility helper for formatting identities
  const formatIdentity = (id: any) => {
    if (!id) return 'None';
    const hex = typeof id === 'string' ? id : id.toHexString();
    return `${hex.substring(0, 6)}...${hex.substring(58)}`;
  };

  const getDefName = (defId: any) => {
    const def = itemDefinitions.find((d: any) => d.id === defId);
    return def ? def.name : 'Unknown Item';
  };

  return (
    <div className="web3-panel">
      <div className="web3-panel-header">
        <h2 className="web3-panel-title">WEB3 PORTAL</h2>
        <div className="web3-gold-badge">
          {goldBalance.toLocaleString()} Gold
        </div>
      </div>

      <div className="web3-subtabs">
        <button
          className={`web3-subtab ${activeSubTab === 'wilderness' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('wilderness'); setError(null); setSuccess(null); }}
        >
          WILDERNESS PVP
        </button>
        <button
          className={`web3-subtab ${activeSubTab === 'auction' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('auction'); setError(null); setSuccess(null); }}
        >
          AUCTION HOUSE
        </button>
        <button
          className={`web3-subtab ${activeSubTab === 'scholarship' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('scholarship'); setError(null); setSuccess(null); }}
        >
          SCHOLARSHIP
        </button>
        <button
          className={`web3-subtab ${activeSubTab === 'tax' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('tax'); setError(null); setSuccess(null); }}
        >
          SHELTER TAX
        </button>
      </div>

      <div className="web3-panel-body">
        {/* Status Messages */}
        {error && <div className="web3-status-box danger">{error}</div>}
        {success && <div className="web3-status-box safe">{success}</div>}

        {/* 1. Wilderness PvP Zone */}
        {activeSubTab === 'wilderness' && (
          <div>
            <div className="web3-card">
              <h3 className="web3-card-title">Wilderness PvP Staking</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#ccc' }}>
                To enter the Wilderness PvP zone, you must stake game tokens (Gold) as your bounty. 
                If you die in the Wilderness, <strong>70%</strong> goes to the killer, <strong>20% is burned</strong>, 
                and <strong>10%</strong> goes to the game treasury.
              </p>

              <div style={{ marginTop: '20px' }} className={`web3-status-box ${isInWildernessZone ? 'danger' : 'safe'}`}>
                {isInWildernessZone 
                  ? 'Currently inside Wilderness PvP Zone! Staked bounty is vulnerable.'
                  : 'Currently outside Wilderness. Your assets are safe.'}
              </div>

              <div className="web3-form-group" style={{ marginTop: '20px' }}>
                <label className="web3-label">Active Staked Bounty</label>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e5c158', fontFamily: 'monospace' }}>
                  {stakedBounty} Gold
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150px' }}>
                  <label className="web3-label">Stake Amount</label>
                  <input
                    type="number"
                    className="web3-input"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    disabled={isProcessingWilderness}
                  />
                </div>
                <button
                  className="web3-btn"
                  style={{ alignSelf: 'flex-end', height: '38px' }}
                  onClick={handleEnterWilderness}
                  disabled={isProcessingWilderness || goldBalance < stakeAmount}
                >
                  {isProcessingWilderness ? 'Staking...' : 'Stake & Enter'}
                </button>
                {stakedBounty > 0 && (
                  <button
                    className="web3-btn web3-btn-secondary"
                    style={{ alignSelf: 'flex-end', height: '38px' }}
                    onClick={handleExitWilderness}
                    disabled={isProcessingWilderness || isInWildernessZone}
                  >
                    Unstake Bounty
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Auction House */}
        {activeSubTab === 'auction' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                className={`web3-btn ${auctionSubTab === 'browse' ? '' : 'web3-btn-secondary'}`}
                onClick={() => setAuctionSubTab('browse')}
              >
                Browse Auctions
              </button>
              <button
                className={`web3-btn ${auctionSubTab === 'create' ? '' : 'web3-btn-secondary'}`}
                onClick={() => setAuctionSubTab('create')}
              >
                Create Listing
              </button>
              <button
                className={`web3-btn ${auctionSubTab === 'claims' ? '' : 'web3-btn-secondary'}`}
                onClick={() => setAuctionSubTab('claims')}
              >
                My Claims ({claimableAuctions.length})
              </button>
            </div>

            {/* Sub-tab: Browse */}
            {auctionSubTab === 'browse' && (
              <div>
                {activeAuctions.length === 0 ? (
                  <div className="web3-empty">No active items for auction at the moment.</div>
                ) : (
                  <div className="web3-grid">
                    {activeAuctions.map((auc: any) => {
                      const isSeller = playerIdentity && auc.seller?.toHexString() === playerIdentity.toHexString();
                      const timeRemainingMs = Number(auc.endTime?.microsSinceUnixEpoch ?? 0) / 1000 - Date.now();
                      const isExpired = timeRemainingMs <= 0;

                      return (
                        <div key={auc.id?.toString()} className="web3-item-card">
                          <div className="web3-item-header">
                            <span className="web3-item-name">{auc.itemName}</span>
                            <span className="web3-item-qty">x{auc.quantity}</span>
                          </div>
                          <div className="web3-item-details">
                            <div className="web3-detail-row">
                              <span>Seller:</span>
                              <span className="web3-detail-val">{formatIdentity(auc.seller)}</span>
                            </div>
                            <div className="web3-detail-row">
                              <span>Start Price:</span>
                              <span className="web3-detail-val gold">{auc.startingPrice} Gold</span>
                            </div>
                            <div className="web3-detail-row">
                              <span>Highest Bid:</span>
                              <span className="web3-detail-val gold">{auc.highestBid > 0 ? `${auc.highestBid} Gold` : 'No bids'}</span>
                            </div>
                            <div className="web3-detail-row">
                              <span>Bidder:</span>
                              <span className="web3-detail-val">{auc.highestBidder ? formatIdentity(auc.highestBidder) : 'None'}</span>
                            </div>
                            <div className="web3-detail-row">
                              <span>Time Left:</span>
                              <span className="web3-detail-val" style={{ color: isExpired ? '#ff6b6b' : '#10b981' }}>
                                {isExpired ? 'Expired' : `${Math.ceil(timeRemainingMs / 60000)} mins`}
                              </span>
                            </div>
                          </div>

                          {!isExpired && !isSeller && (
                            <button
                              className="web3-btn"
                              onClick={() => {
                                setActiveBidAuctionId(auc.id?.toString());
                                setBidAmount(auc.highestBid > 0 ? Number(auc.highestBid) + 1 : Number(auc.startingPrice));
                              }}
                            >
                              Place Bid
                            </button>
                          )}
                          {isSeller && <span style={{ textAlign: 'center', fontSize: '11px', color: '#777' }}>Your Listing</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab: Create Auction */}
            {auctionSubTab === 'create' && (
              <form onSubmit={handleListAuction} className="web3-card" style={{ maxWidth: '500px' }}>
                <h3 className="web3-card-title">List Item for Auction</h3>

                <div className="web3-form-group">
                  <label className="web3-label">Select Item</label>
                  <select
                    className="web3-select"
                    value={selectedInventoryItem}
                    onChange={(e) => setSelectedInventoryItem(e.target.value)}
                    required
                  >
                    <option value="">-- Choose an item --</option>
                    {playerItems.map((item: any) => (
                      <option key={item.instanceId?.toString()} value={item.instanceId?.toString()}>
                        {getDefName(item.itemDefId)} (x{item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="web3-form-row">
                  <div className="web3-form-group">
                    <label className="web3-label">Quantity to Sell</label>
                    <input
                      type="number"
                      className="web3-input"
                      min={1}
                      value={auctionQty}
                      onChange={(e) => setAuctionQty(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="web3-form-group">
                    <label className="web3-label">Starting Price (Gold)</label>
                    <input
                      type="number"
                      className="web3-input"
                      min={1}
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="web3-form-group">
                  <label className="web3-label">Duration</label>
                  <select
                    className="web3-select"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(Number(e.target.value))}
                  >
                    <option value={60}>1 Minute (Test)</option>
                    <option value={900}>15 Minutes</option>
                    <option value={3600}>1 Hour</option>
                    <option value={86400}>24 Hours</option>
                  </select>
                </div>

                <button type="submit" className="web3-btn" disabled={isProcessingAuction || !selectedInventoryItem}>
                  {isProcessingAuction ? 'Listing...' : 'Create Listing'}
                </button>
              </form>
            )}

            {/* Sub-tab: My Claims */}
            {auctionSubTab === 'claims' && (
              <div className="web3-card">
                <h3 className="web3-card-title">Completed Auctions & Claims</h3>
                {claimableAuctions.length === 0 ? (
                  <div className="web3-empty">No claimable auctions or returns found.</div>
                ) : (
                  <div className="web3-table-wrapper">
                    <table className="web3-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Qty</th>
                          <th>Highest Bid</th>
                          <th>Winner</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimableAuctions.map((auc: any) => {
                          const isSeller = playerIdentity && auc.seller?.toHexString() === playerIdentity.toHexString();
                          const hasBids = auc.highestBidder !== null;
                          const isWinner = playerIdentity && auc.highestBidder?.toHexString() === playerIdentity.toHexString();

                          return (
                            <tr key={auc.id?.toString()}>
                              <td>{auc.itemName}</td>
                              <td>{auc.quantity}</td>
                              <td>{auc.highestBid > 0 ? `${auc.highestBid} Gold` : 'No Bids'}</td>
                              <td>{auc.highestBidder ? formatIdentity(auc.highestBidder) : 'N/A'}</td>
                              <td>
                                {isSeller 
                                  ? (hasBids ? 'Sold (Claim Gold)' : 'Unsold (Return Item)') 
                                  : (isWinner ? 'Won (Claim Item)' : 'Ended')}
                              </td>
                              <td>
                                <button
                                  className="web3-btn"
                                  onClick={() => handleClaimAuction(auc.id?.toString())}
                                  disabled={isProcessingAuction}
                                >
                                  Claim
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Scholarship Portal */}
        {activeSubTab === 'scholarship' && (
          <div>
            {/* Owner Section: Register a Scholar */}
            <div className="web3-card">
              <h3 className="web3-card-title">Sponsor a Scholar (For Land/Account Owners)</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#ccc', marginBottom: '20px' }}>
                Register a scholar account to play using your setup. 
                Any gold they generate from selling raw materials will be automatically split between you and them.
              </p>

              <form onSubmit={handleRegisterScholar} style={{ maxWidth: '500px' }}>
                <div className="web3-form-group">
                  <label className="web3-label">Scholar Account Identity (Hex)</label>
                  <input
                    type="text"
                    className="web3-input"
                    placeholder="Enter scholar identity..."
                    value={scholarIdInput}
                    onChange={(e) => setScholarIdInput(e.target.value)}
                    required
                  />
                </div>

                <div className="web3-form-group">
                  <label className="web3-label">Scholar Gold Share Ratio ({shareRatioInput}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={shareRatioInput}
                    onChange={(e) => setShareRatioInput(Number(e.target.value))}
                    style={{ accentColor: '#e5c158', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Owner: {100 - shareRatioInput}%</span>
                    <span>Scholar: {shareRatioInput}%</span>
                  </div>
                </div>

                <button type="submit" className="web3-btn" disabled={isProcessingScholarship || !scholarIdInput}>
                  {isProcessingScholarship ? 'Registering...' : 'Register Scholar'}
                </button>
              </form>
            </div>

            {/* Current Active Contracts */}
            <div className="web3-card">
              <h3 className="web3-card-title">Active Scholarship Agreements</h3>
              {scholarshipInfo ? (
                <div>
                  {scholarshipInfo.sponsoredBy ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Sponsoring Owner</div>
                        <div style={{ fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>{scholarshipInfo.sponsoredBy.toHexString()}</div>
                        <div style={{ fontSize: '12px', color: '#e5c158', marginTop: '4px' }}>Your Share: {(scholarshipInfo.ratio * 100).toFixed(0)}%</div>
                      </div>
                      <button
                        className="web3-btn web3-btn-danger"
                        onClick={() => playerIdentity && handleEndScholarRental(playerIdentity)}
                        disabled={isProcessingScholarship}
                      >
                        Resign
                      </button>
                    </div>
                  ) : null}

                  {scholarshipInfo.sponsoring ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Active Scholar</div>
                        <div style={{ fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>{scholarshipInfo.sponsoring.identity?.toHexString()}</div>
                        <div style={{ fontSize: '12px', color: '#e5c158', marginTop: '4px' }}>Scholar Share: {(scholarshipInfo.sponsoring.goldShareRatio * 100).toFixed(0)}%</div>
                      </div>
                      <button
                        className="web3-btn web3-btn-danger"
                        onClick={() => handleEndScholarRental(scholarshipInfo.sponsoring.identity)}
                        disabled={isProcessingScholarship}
                      >
                        Terminate Rental
                      </button>
                    </div>
                  ) : null}

                  {!scholarshipInfo.sponsoredBy && !scholarshipInfo.sponsoring && (
                    <div className="web3-empty">No active rental agreements found.</div>
                  )}
                </div>
              ) : (
                <div className="web3-empty">No active rental agreements found.</div>
              )}
            </div>
          </div>
        )}

        {/* 4. Shelter Land Registry & Tax */}
        {activeSubTab === 'tax' && (
          <div>
            <div className="web3-card">
              <h3 className="web3-card-title">Shelter Registry (Proof of Burn Land Taxes)</h3>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#ccc', marginBottom: '20px' }}>
                Your shelters require building maintenance taxes. Paying tax burns Gold permanently, extending the expiration time. 
                If a shelter's tax expires, it decays and can be destroyed.
              </p>

              {playerShelters.length === 0 ? (
                <div className="web3-empty">You do not own any active shelters. Place a shelter in the world first.</div>
              ) : (
                <div className="web3-table-wrapper">
                  <table className="web3-table">
                    <thead>
                      <tr>
                        <th>Shelter ID</th>
                        <th>Coordinates</th>
                        <th>Health</th>
                        <th>Tax Expires At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerShelters.map((sh: any) => {
                        const expiryMs = Number(sh.taxExpiryTime?.microsSinceUnixEpoch ?? 0) / 1000;
                        const isExpired = expiryMs <= Date.now();
                        const timeString = isExpired 
                          ? 'EXPIRED' 
                          : new Date(expiryMs).toLocaleString();

                        return (
                          <tr key={sh.id}>
                            <td>#{sh.id}</td>
                            <td>X: {Math.round(sh.posX)}, Y: {Math.round(sh.posY)}</td>
                            <td>{Math.round(sh.health)} / {Math.round(sh.maxHealth)} HP</td>
                            <td style={{ color: isExpired ? '#ef4444' : '#10b981', fontWeight: isExpired ? 'bold' : 'normal' }}>
                              {timeString}
                            </td>
                            <td>
                              <button
                                className="web3-btn"
                                onClick={() => setSelectedShelterId(sh.id)}
                              >
                                Pay Tax
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bid Modal Overlay */}
      {activeBidAuctionId && (
        <div className="web3-modal-overlay">
          <div className="web3-modal">
            <div className="web3-modal-header">Place a Bid</div>
            <div className="web3-form-group">
              <label className="web3-label">Bid Amount (Gold)</label>
              <input
                type="number"
                className="web3-input"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <div className="web3-modal-actions">
              <button
                className="web3-btn web3-btn-secondary"
                onClick={() => setActiveBidAuctionId(null)}
                disabled={isProcessingAuction}
              >
                Cancel
              </button>
              <button
                className="web3-btn"
                onClick={() => handlePlaceBid(activeBidAuctionId)}
                disabled={isProcessingAuction}
              >
                {isProcessingAuction ? 'Bidding...' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Tax Modal Overlay */}
      {selectedShelterId !== null && (
        <div className="web3-modal-overlay">
          <div className="web3-modal">
            <div className="web3-modal-header">Pay Shelter Tax (Burn Tokens)</div>
            <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '16px' }}>
              Paying tax extensions costs Gold, which will be permanently burned from your wallet.
            </p>
            <div className="web3-form-group">
              <label className="web3-label">Tax Payment (Gold)</label>
              <input
                type="number"
                className="web3-input"
                value={shelterTaxAmount}
                onChange={(e) => setShelterTaxAmount(Number(e.target.value))}
                min={10}
                required
              />
              <span style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                1 Gold = 10 seconds extension
              </span>
            </div>
            <div className="web3-modal-actions">
              <button
                className="web3-btn web3-btn-secondary"
                onClick={() => setSelectedShelterId(null)}
                disabled={isProcessingTax}
              >
                Cancel
              </button>
              <button
                className="web3-btn"
                onClick={() => handlePayTax(selectedShelterId)}
                disabled={isProcessingTax || goldBalance < shelterTaxAmount}
              >
                {isProcessingTax ? 'Processing...' : 'Pay & Burn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Web3HubPanel;
