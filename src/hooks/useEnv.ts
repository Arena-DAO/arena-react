import { useQuery } from "@tanstack/react-query";

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
	ARENA_TAX: number;

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
	FAUCET_URL?: string;
}

const checkEnv = (key: string | undefined): string => {
	if (key === undefined || key === null) {
		throw new Error(`Environment variable ${key} is missing`);
	}
	return key;
};

const checkEnvNumber = (key: string | undefined): number => {
	const string = checkEnv(key);
	const value = parseInt(string);
	if (Number.isNaN(value)) {
		throw new Error(`Environment variable ${key} is not a number`);
	}
	return value;
};

function getEnv(): Env {
	return {
		BECH32_PREFIX: checkEnv(process.env.NEXT_PUBLIC_BECH32_PREFIX),
		GAS_PRICE: checkEnv(process.env.NEXT_PUBLIC_GAS_PRICE),
		PFPK_URL: checkEnv(process.env.NEXT_PUBLIC_PFPK_URL),
		IPFS_GATEWAY: checkEnv(process.env.NEXT_PUBLIC_IPFS_GATEWAY),
		WALLETCONNECT_PROJECT_ID: checkEnv(
			process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
		),
		BECH32_WALLET_LENGTH: checkEnvNumber(
			process.env.NEXT_PUBLIC_BECH32_WALLET_LENGTH,
		),
		BECH32_CONTRACT_LENGTH: checkEnvNumber(
			process.env.NEXT_PUBLIC_BECH32_CONTRACT_LENGTH,
		),
		DEFAULT_TEAM_VOTING_DURATION_TIME: checkEnvNumber(
			process.env.NEXT_PUBLIC_DEFAULT_TEAM_VOTING_DURATION_TIME,
		),
		PAGINATION_LIMIT: checkEnvNumber(process.env.NEXT_PUBLIC_PAGINATION_LIMIT),
		ARENA_TAX: checkEnvNumber(process.env.NEXT_PUBLIC_ARENA_TAX),
		CHAIN: checkEnv(process.env.NEXT_PUBLIC_CHAIN),
		DEFAULT_NATIVE: checkEnv(process.env.NEXT_PUBLIC_DEFAULT_NATIVE),
		ENV: checkEnv(process.env.NEXT_PUBLIC_ENV),
		CODE_ID_DAO_PROPOSAL_SINGLE: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_DAO_PROPOSAL_SINGLE,
		),
		CODE_ID_DAO_PREPROPOSE_SINGLE: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_DAO_PREPROPOSE_SINGLE,
		),
		CODE_ID_DAO_CORE: checkEnvNumber(process.env.NEXT_PUBLIC_CODE_ID_DAO_CORE),
		CODE_ID_DAO_VOTING_CW4: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_DAO_VOTING_CW4,
		),
		CODE_ID_CW4_GROUP: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_CW4_GROUP,
		),
		CODE_ID_ARENA_CORE: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_ARENA_CORE,
		),
		CODE_ID_ESCROW: checkEnvNumber(process.env.NEXT_PUBLIC_CODE_ID_ESCROW),
		CODE_ID_WAGER_MODULE: checkEnvNumber(
			process.env.NEXT_PUBLIC_CODE_ID_WAGER_MODULE,
		),
		ARENA_DAO_ADDRESS: checkEnv(process.env.NEXT_PUBLIC_ARENA_DAO_ADDRESS),
		ARENA_CORE_ADDRESS: checkEnv(process.env.NEXT_PUBLIC_ARENA_CORE_ADDRESS),
		ARENA_WAGER_MODULE_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_WAGER_MODULE_ADDRESS,
		),
		ARENA_LEAGUE_MODULE_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_LEAGUE_MODULE_ADDRESS,
		),
		DAO_DAO_URL: checkEnv(process.env.NEXT_PUBLIC_DAO_DAO_URL),
		OSMOSIS_URL: checkEnv(process.env.NEXT_PUBLIC_OSMOSIS_URL),
		JUNO_API_URL: checkEnv(process.env.NEXT_PUBLIC_JUNO_API_URL),
		FAUCET_URL: process.env.NEXT_PUBLIC_FAUCET_URL,
	};
}

export const useEnv = () => {
	return useQuery(["env"], () => getEnv(), {
		initialData: getEnv(),
	});
};
