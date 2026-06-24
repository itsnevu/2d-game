use spacetimedb::{ReducerContext, Identity, Timestamp, Table, log};
use crate::Player;
use crate::items::InventoryItem;
use crate::items::ItemDefinition;
use crate::models::ItemLocation;
use crate::shelter::Shelter;

// Import table traits for ctx.db access
use crate::player;
use crate::shelter::shelter;
use crate::items::inventory_item;
use crate::items::item_definition;
use crate::auction_item;

// === Scholarship / Rental Reducers ===

#[spacetimedb::reducer]
pub fn register_scholar(ctx: &ReducerContext, scholar_identity: Identity, share_ratio: f32) -> Result<(), String> {
    let owner_identity = ctx.sender();
    
    if share_ratio < 0.0 || share_ratio > 1.0 {
        return Err("Rasio bagi hasil harus di antara 0.0 dan 1.0".to_string());
    }
    
    let mut scholar = ctx.db.player().identity().find(scholar_identity)
        .ok_or_else(|| "Akun Scholar tidak ditemukan".to_string())?;
        
    scholar.owner_identity = Some(owner_identity);
    scholar.gold_share_ratio = share_ratio;
    
    ctx.db.player().identity().update(scholar);
    
    log::info!("[Scholarship] Owner {:?} registered Scholar {:?} with ratio {:.2}", owner_identity, scholar_identity, share_ratio);
    
    Ok(())
}

#[spacetimedb::reducer]
pub fn end_scholar_rental(ctx: &ReducerContext, scholar_identity: Identity) -> Result<(), String> {
    let sender = ctx.sender();
    
    let mut scholar = ctx.db.player().identity().find(scholar_identity)
        .ok_or_else(|| "Akun Scholar tidak ditemukan".to_string())?;
        
    if scholar.identity != sender && scholar.owner_identity != Some(sender) {
        return Err("Anda tidak memiliki akses untuk mengakhiri kontrak sewa ini".to_string());
    }
    
    let old_owner = scholar.owner_identity;
    scholar.owner_identity = None;
    scholar.gold_share_ratio = 1.0;
    
    ctx.db.player().identity().update(scholar);
    
    log::info!("[Scholarship] Rental ended for Scholar {:?} (former owner: {:?})", scholar_identity, old_owner);
    
    Ok(())
}

/// Reducer to sell resources for gold, applying scholarship split if active
#[spacetimedb::reducer]
pub fn sell_item_for_gold(ctx: &ReducerContext, item_instance_id: u64, quantity_to_sell: u32) -> Result<(), String> {
    let sender = ctx.sender();
    
    // Find the player
    let mut player = ctx.db.player().identity().find(sender)
        .ok_or_else(|| "Pemain tidak ditemukan".to_string())?;
        
    // Find the item in player's possession
    let mut item = ctx.db.inventory_item().iter()
        .find(|i| i.instance_id == item_instance_id && match &i.location {
            ItemLocation::Inventory(data) => data.owner_id == sender,
            ItemLocation::Hotbar(data) => data.owner_id == sender,
            _ => false,
        })
        .ok_or_else(|| "Item tidak ditemukan di tas Anda".to_string())?;
        
    if item.quantity < quantity_to_sell || quantity_to_sell == 0 {
        return Err("Jumlah item yang ingin dijual tidak valid".to_string());
    }
    
    // Find the item definition to get its value
    let item_def = ctx.db.item_definition().id().find(item.item_def_id)
        .ok_or_else(|| "Definisi item tidak ditemukan".to_string())?;
        
    // Calculate gold value per item (simple heuristic based on category/name)
    let gold_per_unit = match item_def.name.as_str() {
        "Wood" => 1,
        "Stone" => 2,
        "Plant Fiber" => 1,
        "Charcoal" => 3,
        "Animal Bone" => 5,
        "Honeycomb" => 10,
        "Honey" => 15,
        _ => 1, // Default fallback
    };
    
    let total_gold = (gold_per_unit as u64) * (quantity_to_sell as u64);
    
    // Deduct items
    if item.quantity == quantity_to_sell {
        ctx.db.inventory_item().instance_id().delete(item_instance_id);
    } else {
        item.quantity -= quantity_to_sell;
        ctx.db.inventory_item().instance_id().update(item);
    }
    
    // Process gold distribution (Scholarship split)
    if let Some(owner_id) = player.owner_identity {
        // If they are a scholar, split the earnings
        let scholar_share = ((total_gold as f32) * player.gold_share_ratio).round() as u64;
        let owner_share = total_gold.saturating_sub(scholar_share);
        
        // Update scholar balance
        player.gold_balance += scholar_share;
        ctx.db.player().identity().update(player);
        
        // Update owner balance
        if let Some(mut owner) = ctx.db.player().identity().find(owner_id) {
            owner.gold_balance += owner_share;
            ctx.db.player().identity().update(owner);
        }
        
        log::info!(
            "[Scholarship Split] Scholar {:?} sold {}x '{}' for {} Gold. Scholar gets: {}, Owner ({:?}) gets: {}",
            sender, quantity_to_sell, item_def.name, total_gold, scholar_share, owner_id, owner_share
        );
    } else {
        // Normal player gets 100%
        player.gold_balance += total_gold;
        ctx.db.player().identity().update(player);
        
        log::info!("Player {:?} sold {}x '{}' for {} Gold.", sender, quantity_to_sell, item_def.name, total_gold);
    }
    
    Ok(())
}

// === PvP Taruhan / Wilderness Bounty Reducers ===

// Wilderness boundary: X coordinate >= 4000.0 (simulated Wilderness zone)
pub fn is_in_wilderness(pos_x: f32, _pos_y: f32) -> bool {
    pos_x >= 4000.0
}

#[spacetimedb::reducer]
pub fn enter_wilderness(ctx: &ReducerContext, bounty_amount: u64) -> Result<(), String> {
    let sender = ctx.sender();
    
    if bounty_amount == 0 {
        return Err("Jumlah taruhan harus lebih dari 0".to_string());
    }
    
    let mut player = ctx.db.player().identity().find(sender)
        .ok_or_else(|| "Pemain tidak ditemukan".to_string())?;
        
    if player.gold_balance < bounty_amount {
        return Err("Saldo emas Anda tidak mencukupi untuk masuk ke Wilderness".to_string());
    }
    
    // Deduct from balance and add to staked bounty
    player.gold_balance -= bounty_amount;
    player.staked_bounty += bounty_amount;
    ctx.db.player().identity().update(player);
    
    log::info!("Player {:?} staked {} Gold bounty and entered Wilderness.", sender, bounty_amount);
    
    Ok(())
}

#[spacetimedb::reducer]
pub fn exit_wilderness(ctx: &ReducerContext) -> Result<(), String> {
    let sender = ctx.sender();
    
    let mut player = ctx.db.player().identity().find(sender)
        .ok_or_else(|| "Pemain tidak ditemukan".to_string())?;
        
    if is_in_wilderness(player.position_x, player.position_y) {
        return Err("Anda tidak bisa keluar dari taruhan selama masih berada di dalam zona Wilderness".to_string());
    }
    
    let reclaim_amount = player.staked_bounty;
    if reclaim_amount > 0 {
        player.staked_bounty = 0;
        player.gold_balance += reclaim_amount;
        ctx.db.player().identity().update(player);
        log::info!("Player {:?} reclaimed {} Gold staked bounty after leaving Wilderness.", sender, reclaim_amount);
    }
    
    Ok(())
}

// === Auction House Reducers ===

#[spacetimedb::reducer]
pub fn list_item_for_auction(
    ctx: &ReducerContext, 
    item_instance_id: u64, 
    quantity: u32, 
    starting_price: u64, 
    duration_secs: u64
) -> Result<(), String> {
    let sender = ctx.sender();
    
    if starting_price == 0 || quantity == 0 || duration_secs == 0 {
        return Err("Parameter lelang tidak valid".to_string());
    }
    
    // Find the item in player's possession
    let mut item = ctx.db.inventory_item().iter()
        .find(|i| i.instance_id == item_instance_id && match &i.location {
            ItemLocation::Inventory(data) => data.owner_id == sender,
            ItemLocation::Hotbar(data) => data.owner_id == sender,
            _ => false,
        })
        .ok_or_else(|| "Item tidak ditemukan di tas Anda".to_string())?;
        
    if item.quantity < quantity {
        return Err("Jumlah item di tas tidak mencukupi".to_string());
    }
    
    let item_def = ctx.db.item_definition().id().find(item.item_def_id)
        .ok_or_else(|| "Definisi item tidak ditemukan".to_string())?;
        
    // Take items from player
    let item_data = item.item_data.clone().unwrap_or_default();
    if item.quantity == quantity {
        ctx.db.inventory_item().instance_id().delete(item_instance_id);
    } else {
        item.quantity -= quantity;
        ctx.db.inventory_item().instance_id().update(item);
    }
    
    // Create Auction item
    let end_time = Timestamp::from_micros_since_unix_epoch(
        ctx.timestamp.to_micros_since_unix_epoch() + (duration_secs * 1000 * 1000) as i64
    );
    
    let auction = crate::AuctionItem {
        id: 0,
        seller: sender,
        item_name: item_def.name.clone(),
        item_data,
        quantity,
        starting_price,
        highest_bid: 0,
        highest_bidder: None,
        end_time,
        is_claimed: false,
    };
    
    ctx.db.auction_item().try_insert(auction)?;
    
    log::info!("Player {:?} listed {}x '{}' for auction starting at {} Gold.", sender, quantity, item_def.name, starting_price);
    
    Ok(())
}

#[spacetimedb::reducer]
pub fn place_bid(ctx: &ReducerContext, auction_id: u64, bid_amount: u64) -> Result<(), String> {
    let sender = ctx.sender();
    
    let mut auction = ctx.db.auction_item().id().find(auction_id)
        .ok_or_else(|| "Lelang tidak ditemukan".to_string())?;
        
    if auction.is_claimed || ctx.timestamp >= auction.end_time {
        return Err("Lelang sudah berakhir".to_string());
    }
    
    if auction.seller == sender {
        return Err("Anda tidak bisa menawar barang Anda sendiri".to_string());
    }
    
    let min_bid = if auction.highest_bid == 0 {
        auction.starting_price
    } else {
        auction.highest_bid + 1
    };
    
    if bid_amount < min_bid {
        return Err(format!("Tawaran minimal adalah {} Gold", min_bid));
    }
    
    // Check bidder's gold balance
    let mut bidder = ctx.db.player().identity().find(sender)
        .ok_or_else(|| "Pemain tidak ditemukan".to_string())?;
        
    if bidder.gold_balance < bid_amount {
        return Err("Saldo emas Anda tidak mencukupi untuk melakukan bid".to_string());
    }
    
    // Refund the previous highest bidder
    if let Some(prev_bidder_id) = auction.highest_bidder {
        if let Some(mut prev_bidder) = ctx.db.player().identity().find(prev_bidder_id) {
            prev_bidder.gold_balance += auction.highest_bid;
            ctx.db.player().identity().update(prev_bidder);
        }
    }
    
    // Lock the new bid amount from bidder
    bidder.gold_balance -= bid_amount;
    ctx.db.player().identity().update(bidder);
    
    // Update auction state
    auction.highest_bid = bid_amount;
    auction.highest_bidder = Some(sender);
    ctx.db.auction_item().id().update(auction);
    
    log::info!("Player {:?} placed a bid of {} Gold on auction ID {}.", sender, bid_amount, auction_id);
    
    Ok(())
}

#[spacetimedb::reducer]
pub fn claim_auction_rewards(ctx: &ReducerContext, auction_id: u64) -> Result<(), String> {
    let sender = ctx.sender();
    
    let mut auction = ctx.db.auction_item().id().find(auction_id)
        .ok_or_else(|| "Lelang tidak ditemukan".to_string())?;
        
    if ctx.timestamp < auction.end_time {
        return Err("Lelang belum berakhir".to_string());
    }
    
    if auction.is_claimed {
        return Err("Barang/Emas sudah di-claim sebelumnya".to_string());
    }
    
    if auction.highest_bidder.is_none() {
        // No bids placed: seller claims their items back
        if auction.seller != sender {
            return Err("Hanya penjual yang bisa mengambil kembali barang yang tidak terjual".to_string());
        }
        
        // Find empty slot for return
        let empty_slot = crate::player_inventory::find_first_empty_inventory_slot(ctx, sender)
            .ok_or_else(|| "Tas Anda penuh untuk menampung pengembalian barang".to_string())?;
            
        let item_def = ctx.db.item_definition().iter().find(|id| id.name == auction.item_name)
            .ok_or_else(|| "Definisi item tidak ditemukan".to_string())?;
            
        let returned_item = InventoryItem {
            instance_id: 0,
            item_def_id: item_def.id,
            quantity: auction.quantity,
            location: ItemLocation::Inventory(crate::models::InventoryLocationData {
                owner_id: sender,
                slot_index: empty_slot,
            }),
            item_data: Some(auction.item_data.clone()),
        };
        
        ctx.db.inventory_item().try_insert(returned_item)?;
        auction.is_claimed = true;
        ctx.db.auction_item().id().update(auction);
        
        log::info!("Seller {:?} reclaimed their unsold items for auction ID {}.", sender, auction_id);
    } else {
        let bidder_id = auction.highest_bidder.unwrap();
        
        if sender == auction.seller {
            // Seller claims the highest bid amount (95% to seller, 5% fee burned/treasury)
            let fee = (auction.highest_bid as f64 * 0.05).round() as u64;
            let net_earnings = auction.highest_bid.saturating_sub(fee);
            
            let mut seller = ctx.db.player().identity().find(sender)
                .ok_or_else(|| "Penjual tidak ditemukan".to_string())?;
                
            seller.gold_balance += net_earnings;
            ctx.db.player().identity().update(seller);
            
            // Deliver the item to the buyer
            let empty_slot = crate::player_inventory::find_first_empty_inventory_slot(ctx, bidder_id)
                .ok_or_else(|| "Tas pembeli penuh, minta pembeli mengosongkan tasnya dulu".to_string())?;
                
            let item_def = ctx.db.item_definition().iter().find(|id| id.name == auction.item_name)
                .ok_or_else(|| "Definisi item tidak ditemukan".to_string())?;
                
            let bought_item = InventoryItem {
                instance_id: 0,
                item_def_id: item_def.id,
                quantity: auction.quantity,
                location: ItemLocation::Inventory(crate::models::InventoryLocationData {
                    owner_id: bidder_id,
                    slot_index: empty_slot,
                }),
                item_data: Some(auction.item_data.clone()),
            };
            
            ctx.db.inventory_item().try_insert(bought_item)?;
            
            auction.is_claimed = true;
            ctx.db.auction_item().id().update(auction);
            
            log::info!(
                "Seller {:?} claimed earnings of {} Gold (net) from auction ID {}. Item delivered to buyer {:?}.",
                sender, net_earnings, auction_id, bidder_id
            );
        } else if sender == bidder_id {
            // Buyer claims item
            let empty_slot = crate::player_inventory::find_first_empty_inventory_slot(ctx, sender)
                .ok_or_else(|| "Tas Anda penuh untuk menampung barang pembelian".to_string())?;
                
            let item_def = ctx.db.item_definition().iter().find(|id| id.name == auction.item_name)
                .ok_or_else(|| "Definisi item tidak ditemukan".to_string())?;
                
            let bought_item = InventoryItem {
                instance_id: 0,
                item_def_id: item_def.id,
                quantity: auction.quantity,
                location: ItemLocation::Inventory(crate::models::InventoryLocationData {
                    owner_id: sender,
                    slot_index: empty_slot,
                }),
                item_data: Some(auction.item_data.clone()),
            };
            
            ctx.db.inventory_item().try_insert(bought_item)?;
            
            // Deliver money to seller
            let fee = (auction.highest_bid as f64 * 0.05).round() as u64;
            let net_earnings = auction.highest_bid.saturating_sub(fee);
            if let Some(mut seller) = ctx.db.player().identity().find(auction.seller) {
                seller.gold_balance += net_earnings;
                ctx.db.player().identity().update(seller);
            }
            
            auction.is_claimed = true;
            let seller_id = auction.seller;
            let item_name = auction.item_name.clone();
            ctx.db.auction_item().id().update(auction);
            
            log::info!(
                "Buyer {:?} claimed item '{}' from auction ID {}. Seller {:?} received earnings.",
                sender, item_name, auction_id, seller_id
            );
        } else {
            return Err("Anda tidak memiliki keterkaitan dengan lelang ini".to_string());
        }
    }
    
    Ok(())
}

// === Pajak Shelter Reducers ===

#[spacetimedb::reducer]
pub fn pay_shelter_tax(ctx: &ReducerContext, shelter_id: u32, gold_amount: u64) -> Result<(), String> {
    let sender = ctx.sender();
    
    if gold_amount == 0 {
        return Err("Jumlah emas tidak valid".to_string());
    }
    
    let mut shelter = ctx.db.shelter().id().find(shelter_id)
        .ok_or_else(|| "Shelter tidak ditemukan".to_string())?;
        
    if shelter.placed_by != sender {
        return Err("Hanya pemilik shelter yang bisa membayar pajak lahan".to_string());
    }
    
    let mut player = ctx.db.player().identity().find(sender)
        .ok_or_else(|| "Pemain tidak ditemukan".to_string())?;
        
    if player.gold_balance < gold_amount {
        return Err("Saldo emas Anda tidak mencukupi untuk membayar pajak".to_string());
    }
    
    // Deduct and burn gold
    player.gold_balance -= gold_amount;
    ctx.db.player().identity().update(player);
    
    // 1 Gold = 10 seconds of expiry extension (adjustable)
    let extension_micros = gold_amount * 10 * 1000 * 1000;
    
    let current_expiry = shelter.tax_expiry_time.to_micros_since_unix_epoch();
    let base_time = if current_expiry < ctx.timestamp.to_micros_since_unix_epoch() {
        ctx.timestamp.to_micros_since_unix_epoch()
    } else {
        current_expiry
    };
    
    shelter.tax_expiry_time = Timestamp::from_micros_since_unix_epoch(base_time + extension_micros as i64);
    ctx.db.shelter().id().update(shelter);
    
    log::info!("Player {:?} paid {} Gold tax for shelter ID {}. New expiry set.", sender, gold_amount, shelter_id);
    
    Ok(())
}

#[spacetimedb::reducer]
pub fn debug_setup_test_state(ctx: &ReducerContext, scholar_identity: Identity) -> Result<(), String> {
    let sender = ctx.sender();
    
    // 1. Give sender some gold
    if let Some(mut player) = ctx.db.player().identity().find(sender) {
        player.gold_balance = 1000;
        ctx.db.player().identity().update(player);
    }
    
    // 2. Link scholar with 70% share ratio
    if let Some(mut scholar) = ctx.db.player().identity().find(scholar_identity) {
        scholar.owner_identity = Some(sender);
        scholar.gold_share_ratio = 0.70;
        ctx.db.player().identity().update(scholar);
    }
    
    // 3. Give sender a Wood item to sell (item_def_id: 1 represents Wood, let's verify if definition exists)
    let wood_def = ctx.db.item_definition().iter().find(|id| id.name == "Wood");
    let item_def_id = match wood_def {
        Some(def) => def.id,
        None => 1, // Fallback
    };
    
    let test_item = InventoryItem {
        instance_id: 1001,
        item_def_id,
        quantity: 10,
        location: ItemLocation::Inventory(crate::models::InventoryLocationData {
            owner_id: sender,
            slot_index: 0,
        }),
        item_data: None,
    };
    
    // Remove if already exists
    ctx.db.inventory_item().instance_id().delete(1001);
    ctx.db.inventory_item().try_insert(test_item)?;
    
    // 4. Give sender a second item for auction
    let test_item_auc = InventoryItem {
        instance_id: 1002,
        item_def_id,
        quantity: 5,
        location: ItemLocation::Inventory(crate::models::InventoryLocationData {
            owner_id: sender,
            slot_index: 1,
        }),
        item_data: None,
    };
    
    ctx.db.inventory_item().instance_id().delete(1002);
    ctx.db.inventory_item().try_insert(test_item_auc)?;
    
    // 5. Create a test shelter for the sender
    let test_shelter = Shelter {
        id: 99,
        pos_x: 100.0,
        pos_y: 100.0,
        chunk_index: 0,
        placed_by: sender,
        placed_at: ctx.timestamp,
        health: 1000.0,
        max_health: 1000.0,
        is_destroyed: false,
        destroyed_at: None,
        last_hit_time: None,
        last_damaged_by: None,
        terrain_variant: 0,
        tax_expiry_time: Timestamp::from_micros_since_unix_epoch(
            ctx.timestamp.to_micros_since_unix_epoch() - 10 * 1000 * 1000 // Expired 10 seconds ago
        ),
    };
    
    // Remove if exists
    ctx.db.shelter().id().delete(99);
    ctx.db.shelter().try_insert(test_shelter)?;
    
    Ok(())
}
