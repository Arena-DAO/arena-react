interface Env {
  GAS_PRICE: string;
  PFPK_URL: string;
  ARENA_ITEM_KEY: string;
  WAGER_MODULE_KEY: string;
  IPFS_GATEWAY: string;
  WALLETCONNECT_PROJECT_ID: string;

  // Variables specific to both .env.development and .env.production
  CHAIN: string;
  ARENA_DAO_ADDRESS: string;
  DAO_DAO_URL: string;
  OSMOSIS_URL: string;
  JUNO_API_URL: string;

  // Variables specific to .env.development
  CODE_ID_DAO_PROPOSAL_MULTIPLE: number;
  CODE_ID_DAO_PREPROPOSE_MULTIPLE: number;
  CODE_ID_DAO_CORE: number;
  CODE_ID_DAO_VOTING_CW4: number;
  CODE_ID_CW4_GROUP: number;
  CODE_ID_ARENA_CORE: number;
  CODE_ID_ESCROW: number;
  CODE_ID_WAGER_MODULE: number;
}

// Instantiate Env
const env: Env = {
  GAS_PRICE: process.env.NEXT_PUBLIC_GAS_PRICE!,
  PFPK_URL: process.env.NEXT_PUBLIC_PFPK_URL!,
  ARENA_ITEM_KEY: process.env.NEXT_PUBLIC_ARENA_ITEM_KEY!,
  WAGER_MODULE_KEY: process.env.NEXT_PUBLIC_WAGER_MODULE_KEY!,
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY!,
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

  CHAIN: process.env.NEXT_PUBLIC_CHAIN!,
  ARENA_DAO_ADDRESS: process.env.NEXT_PUBLIC_ARENA_DAO_ADDRESS!,
  DAO_DAO_URL: process.env.NEXT_PUBLIC_DAO_DAO_URL!,
  OSMOSIS_URL: process.env.NEXT_PUBLIC_OSMOSIS_URL!,
  JUNO_API_URL: process.env.NEXT_PUBLIC_JUNO_API_URL!,

  CODE_ID_DAO_PROPOSAL_MULTIPLE: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_PROPOSAL_MULTIPLE!
  ),
  CODE_ID_DAO_PREPROPOSE_MULTIPLE: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_MULTIPLE!
  ),
  CODE_ID_DAO_CORE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_DAO_CORE!),
  CODE_ID_DAO_VOTING_CW4: parseInt(
    process.env.NEXT_PUBLIC_CODE_ID_DAO_VOTING_CW4!
  ),
  CODE_ID_CW4_GROUP: parseInt(process.env.NEXT_PUBLIC_CODE_ID_CW4_GROUP!),
  CODE_ID_ARENA_CORE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ARENA_CORE!),
  CODE_ID_ESCROW: parseInt(process.env.NEXT_PUBLIC_CODE_ID_ESCROW!),
  CODE_ID_WAGER_MODULE: parseInt(process.env.NEXT_PUBLIC_CODE_ID_WAGER_MODULE!),
};

export default env;