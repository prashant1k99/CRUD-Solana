#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod crudapp {
    use super::*;

    pub fn create_general_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [owner.key().as_ref(), title.as_bytes() ],
        bump,
        space = ANCHOR_DISCRIMINATOR_SIZE + JournalEntryState::INIT_SPACE,
        payer = owner
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,

    #[max_len(50)]
    pub title: String,

    #[max_len(500)]
    pub message: String,
}
