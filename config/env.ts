interface Env {
  BECH32_PREFIX: string;
  GAS_PRICE: string;
  PFPK_URL: string;
  IPFS_GATEWAY: string;
  WALLETCONNECT_PROJECT_ID: string;
  BECH32_WALLET_LENGTH: number;
  BECH32_CONTRACT_LENGTH: number;
  DEFAULT_TEAM_VOTING_DURATION_TIME: number;
  PAGINATION_LIMIT: number;

  // Variables specific to both .env.development and .env.production
  CHAIN: string;
  DEFAULT_NATIVE: string;
  ENV: string;

  // Variables specific to .env.development
  CODE_ID_DAO_PROPOSAL_SINGLE: number;
  CODE_ID_DAO_PREPROPOSE_SINGLE: number;
  CODE_ID_DAO_CORE: number;
  CODE_ID_DAO_VOTING_CW4: number;
  CODE_ID_CW4_GROUP: number;
  CODE_ID_ARENA_CORE: number;
  CODE_ID_ESCROW: number;
  CODE_ID_WAGER_MODULE: number;
  ARENA_DAO_ADDRESS: string;
  ARENA_CORE_ADDRESS: string;
  ARENA_WAGER_MODULE_ADDRESS: string;
  ARENA_LEAGUE_MODULE_ADDRESS: string;
  DAO_DAO_URL: string;
  OSMOSIS_URL: string;
  JUNO_API_URL: string;
  FAUCET_URL: string | undefined;
}

// Instantiate Env
const env: Env = {
  BECH32_PREFIX: process.env.NEXT_PUBLIC_BECH32_PREFIX!,
  GAS_PRICE: process.env.NEXT_PUBLIC_GAS_PRICE!,
  PFPK_URL: process.env.NEXT_PUBLIC_PFPK_URL!,
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY!,
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  BECH32_CONTRACT_LENGTH: parseInt(
    process.env.NEXT_PUBLIC_BECH32_CONTRACT_LENGTH!
  ),
  BECH32_WALLET_LENGTH: parseInt(process.env.NEXT_PUBLIC_BECH32_WALLET_LENGTH!),
  DEFAULT_TEAM_VOTING_DURATION_TIME: parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_TEAM_VOTING_DURATION_TIME!
  ),
  PAGINATION_LIMIT: parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT!),

  DEFAULT_NATIVE: process.env.NEXT_PUBLIC_DEFAULT_NATIVE!,
  CHAIN: process.env.NEXT_PUBLIC_CHAIN!,
  ENV: process.env.NEXT_PUBLIC_ENV!,

  CODE_ID_DAO_PROPOSAL_SINGLE: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_PROPOSAL_SINGLE!
  ),
  CODE_ID_DAO_PREPROPOSE_SINGLE: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_SINGLE!
  ),
  CODE_ID_DAO_CORE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_DAO_CORE!),
  CODE_ID_DAO_VOTING_CW4: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_VOTING_CW4!
  ),
  CODE_ID_CW4_GROUP: parseInt(process.env.NEXT_PUBLIC_CODE_ID_CW4_GROUP!),
  CODE_ID_ARENA_CORE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ARENA_CORE!),
  CODE_ID_ESCROW: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ESCROW!),
  CODE_ID_WAGER_MODULE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_WAGER_MODULE!),
  ARENA_DAO_ADDRESS: process.env.NEXT_PUBLIC_ARENA_DAO_ADDRESS!,
  ARENA_CORE_ADDRESS: process.env.NEXT_PUBLIC_ARENA_CORE_ADDRESS!,
  ARENA_WAGER_MODULE_ADDRESS: process.env.NEXT_PUBLIC_ARENA_WAGER_MODULE_ADDRESS!,
  ARENA_LEAGUE_MODULE_ADDRESS: process.env.NEXT_PUBLIC_ARENA_LEAGUE_MODULE_ADDRESS!,
  DAO_DAO_URL: process.env.NEXT_PUBLIC_DAO_DAO_URL!,
  OSMOSIS_URL: process.env.NEXT_PUBLIC_OSMOSIS_URL!,
  JUNO_API_URL: process.env.NEXT_PUBLIC_JUNO_API_URL!,
  FAUCET_URL: process.env.NEXT_PUBLIC_FAUCET_URL,
};

export default env;
