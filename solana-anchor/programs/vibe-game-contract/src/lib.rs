use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

declare_id!("V1beGameContract1111111111111111111111111");

#[program]
pub mod vibe_game_contract {
    use super::*;

    /// Initialize the program configuration with the custom token mint and treasury wallet
    pub fn initialize(ctx: Context<Initialize>, treasury_bump: u8) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.admin.key();
        config.token_mint = ctx.accounts.token_mint.key();
        config.treasury_vault = ctx.accounts.treasury_vault.key();
        config.treasury_bump = treasury_bump;
        Ok(())
    }

    /// Player stakes token to enter the Wilderness PvP zone
    pub fn enter_wilderness(ctx: Context<EnterWilderness>, amount: u64) -> Result<()> {
        msg!("Player {} entering Wilderness staking {} tokens", ctx.accounts.player.key(), amount);
        
        // Transfer tokens from player to program escrow vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.player_token_account.to_account_info(),
            to: ctx.accounts.escrow_vault.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Record the staked amount in the player state account
        let player_state = &mut ctx.accounts.player_state;
        player_state.player = ctx.accounts.player.key();
        player_state.staked_amount = player_state.staked_amount.checked_add(amount).unwrap();
        player_state.is_in_wilderness = true;

        Ok(())
    }

    /// Player exits Wilderness and reclaims their staked bounty (if safe/alive)
    /// Requires relayer/oracle signature to verify player is safely out of Wilderness
    pub fn exit_wilderness(ctx: Context<ExitWilderness>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        let amount = player_state.staked_amount;
        
        require!(amount > 0, GameError::NoStakedBounty);
        require!(player_state.is_in_wilderness, GameError::NotInWilderness);

        msg!("Player {} reclaiming staked bounty of {} tokens", ctx.accounts.player.key(), amount);

        // Reset state
        player_state.staked_amount = 0;
        player_state.is_in_wilderness = false;

        // Transfer tokens back from escrow vault to player
        let signer_seeds = &[
            b"escrow".as_ref(),
            &[ctx.accounts.config.treasury_bump],
        ];
        let signer = &[&signer_seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    /// Settle a PvP death in Wilderness: 70% to killer, 20% burned, 10% to treasury
    /// Callable only by the admin/relayer after validating game state
    pub fn settle_wilderness_defeat(ctx: Context<SettleWildernessDefeat>) -> Result<()> {
        let defeated_state = &mut ctx.accounts.defeated_player_state;
        let staked = defeated_state.staked_amount;
        
        require!(staked > 0, GameError::NoStakedBounty);

        msg!("Settling Wilderness defeat for {} staked tokens", staked);

        // Reset defeated player's staked balance
        defeated_state.staked_amount = 0;
        defeated_state.is_in_wilderness = false;

        // Calculate distribution
        let reward_amount = ((staked as f64) * 0.70) as u64;
        let burn_amount = ((staked as f64) * 0.20) as u64;
        let treasury_amount = staked.saturating_sub(reward_amount).saturating_sub(burn_amount);

        let signer_seeds = &[
            b"escrow".as_ref(),
            &[ctx.accounts.config.treasury_bump],
        ];
        let signer = &[&signer_seeds[..]];
        let cpi_program = ctx.accounts.token_program.to_account_info();

        // 1. Transfer 70% to killer
        let cpi_transfer_killer = Transfer {
            from: ctx.accounts.escrow_vault.to_account_info(),
            to: ctx.accounts.killer_token_account.to_account_info(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        let cpi_ctx_killer = CpiContext::new_with_signer(cpi_program.clone(), cpi_transfer_killer, signer);
        token::transfer(cpi_ctx_killer, reward_amount)?;

        // 2. Transfer 10% to treasury
        if treasury_amount > 0 {
            let cpi_transfer_treasury = Transfer {
                from: ctx.accounts.escrow_vault.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
                authority: ctx.accounts.escrow_vault.to_account_info(),
            };
            let cpi_ctx_treasury = CpiContext::new_with_signer(cpi_program.clone(), cpi_transfer_treasury, signer);
            token::transfer(cpi_ctx_treasury, treasury_amount)?;
        }

        // 3. Burn 20%
        if burn_amount > 0 {
            let cpi_burn = Burn {
                mint: ctx.accounts.token_mint.to_account_info(),
                from: ctx.accounts.escrow_vault.to_account_info(),
                authority: ctx.accounts.escrow_vault.to_account_info(),
            };
            let cpi_ctx_burn = CpiContext::new_with_signer(cpi_program, cpi_burn, signer);
            token::burn(cpi_ctx_burn, burn_amount)?;
        }

        Ok(())
    }

    /// Pay shelter tax: 100% of tokens are instantly burned
    pub fn pay_shelter_tax(ctx: Context<PayShelterTax>, amount: u64) -> Result<()> {
        msg!("Player {} paying shelter land tax. Burning {} tokens", ctx.accounts.player.key(), amount);

        // Transfer player tokens to temporary burn account (or burn directly from player wallet)
        let cpi_burn = Burn {
            mint: ctx.accounts.token_mint.to_account_info(),
            from: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_burn);
        token::burn(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 32 + 32 + 1)]
    pub config: Account<'info, ProgramConfig>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = admin,
        token::mint = token_mint,
        token::authority = treasury_vault,
        seeds = [b"escrow".as_ref()],
        bump
    )]
    pub treasury_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct EnterWilderness<'info> {
    #[account(mut)]
    pub config: Account<'info, ProgramConfig>,
    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 32 + 8 + 1,
        seeds = [b"player_state".as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"escrow".as_ref()], bump = config.treasury_bump)]
    pub escrow_vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExitWilderness<'info> {
    pub config: Account<'info, ProgramConfig>,
    #[account(mut, seeds = [b"player_state".as_ref(), player.key().as_ref()], bump)]
    pub player_state: Account<'info, PlayerState>,
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"escrow".as_ref()], bump = config.treasury_bump)]
    pub escrow_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SettleWildernessDefeat<'info> {
    pub config: Account<'info, ProgramConfig>,
    #[account(mut, seeds = [b"player_state".as_ref(), defeated_player.key().as_ref()], bump)]
    pub defeated_player_state: Account<'info, PlayerState>,
    pub defeated_player: AccountInfo<'info>,
    #[account(mut)]
    pub killer_token_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"escrow".as_ref()], bump = config.treasury_bump)]
    pub escrow_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub admin: Signer<'info>, // Only relayer/admin can trigger settlement
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PayShelterTax<'info> {
    pub player: Signer<'info>,
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct ProgramConfig {
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub treasury_vault: Pubkey,
    pub treasury_bump: u8,
}

#[account]
pub struct PlayerState {
    pub player: Pubkey,
    pub staked_amount: u64,
    pub is_in_wilderness: bool,
}

#[error_code]
pub enum GameError {
    #[msg("Pemain tidak memiliki taruhan/bounty yang terpasang.")]
    NoStakedBounty,
    #[msg("Pemain tidak sedang berada di dalam Wilderness.")]
    NotInWilderness,
}
