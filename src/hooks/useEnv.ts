import { useQuery } from "@tanstack/react-query";

export interface Env {
	BECH32_PREFIX: string;
	PFPK_URL: string;
	API_URL: string;
	DISCORD_API_URL: string;
	WALLETCONNECT_PROJECT_ID: string;
	BECH32_WALLET_LENGTH: number;
	BECH32_CONTRACT_LENGTH: number;
	DEFAULT_TEAM_VOTING_DURATION_TIME: number;
	PAGINATION_LIMIT: number;
	IBC_FUN: string;
	JACKAL_PATH: string;

	CHAIN: string;
	DEFAULT_NATIVE: string;
	ENV: string;
	CODE_ID_ESCROW: number;
	CODE_ID_GROUP: number;
	ARENA_DAO_ADDRESS: string;
	ARENA_CORE_ADDRESS: string;
	ARENA_WAGER_MODULE_ADDRESS: string;
	ARENA_LEAGUE_MODULE_ADDRESS: string;
	ARENA_TOURNAMENT_MODULE_ADDRESS: string;
	ARENA_COMPETITION_ENROLLMENT_ADDRESS: string;
	ARENA_ABC_ADDRESS: string;
	ARENA_ABC_SUPPLY_DENOM: string;
	ARENA_ABC_RESERVE_DENOM: string;
	ARENA_PAYMENT_REGISTRY_ADDRESS: string;
	ARENA_TOKEN_GATEWAY_ADDRESS: string;
	ARENA_DISCORD_IDENTITY_ADDRESS?: string;
	DAO_DAO_URL: string;
	DOCS_URL: string;
	RPC_URL: string;
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
	const value = Number.parseInt(string);
	if (Number.isNaN(value)) {
		throw new Error(`Environment variable ${key} is not a number`);
	}
	return value;
};

function getEnv(): Env {
	return {
		DISCORD_API_URL: checkEnv(process.env.NEXT_PUBLIC_DISCORD_API_URL),
		ARENA_DISCORD_IDENTITY_ADDRESS:
			process.env.NEXT_PUBLIC_ARENA_DISCORD_IDENTITY_ADDRESS,
		IBC_FUN: checkEnv(process.env.NEXT_PUBLIC_IBC_FUN),
		API_URL: checkEnv(process.env.NEXT_PUBLIC_API_URL),
		BECH32_PREFIX: checkEnv(process.env.NEXT_PUBLIC_BECH32_PREFIX),
		PFPK_URL: checkEnv(process.env.NEXT_PUBLIC_PFPK_URL),
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
		CHAIN: checkEnv(process.env.NEXT_PUBLIC_CHAIN),
		DEFAULT_NATIVE: checkEnv(process.env.NEXT_PUBLIC_DEFAULT_NATIVE),
		ENV: checkEnv(process.env.NEXT_PUBLIC_ENV),
		JACKAL_PATH: checkEnv(process.env.NEXT_PUBLIC_JACKAL_PATH),
		CODE_ID_ESCROW: checkEnvNumber(process.env.NEXT_PUBLIC_CODE_ID_ESCROW),
		CODE_ID_GROUP: checkEnvNumber(process.env.NEXT_PUBLIC_CODE_ID_GROUP),
		ARENA_DAO_ADDRESS: checkEnv(process.env.NEXT_PUBLIC_ARENA_DAO_ADDRESS),
		ARENA_CORE_ADDRESS: checkEnv(process.env.NEXT_PUBLIC_ARENA_CORE_ADDRESS),
		ARENA_WAGER_MODULE_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_WAGER_MODULE_ADDRESS,
		),
		ARENA_LEAGUE_MODULE_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_LEAGUE_MODULE_ADDRESS,
		),
		ARENA_TOURNAMENT_MODULE_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_TOURNAMENT_MODULE_ADDRESS,
		),
		ARENA_COMPETITION_ENROLLMENT_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		),
		ARENA_ABC_ADDRESS: checkEnv(process.env.NEXT_PUBLIC_ARENA_ABC_ADDRESS),
		ARENA_ABC_SUPPLY_DENOM: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_ABC_SUPPLY_DENOM,
		),
		ARENA_ABC_RESERVE_DENOM: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_ABC_RESERVE_DENOM,
		),
		ARENA_PAYMENT_REGISTRY_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_PAYMENT_REGISTRY_ADDRESS,
		),
		ARENA_TOKEN_GATEWAY_ADDRESS: checkEnv(
			process.env.NEXT_PUBLIC_ARENA_TOKEN_GATEWAY_ADDRESS,
		),
		DAO_DAO_URL: checkEnv(process.env.NEXT_PUBLIC_DAO_DAO_URL),
		DOCS_URL: checkEnv(process.env.NEXT_PUBLIC_DOCS_URL),
		RPC_URL: checkEnv(process.env.NEXT_PUBLIC_RPC_URL),
		FAUCET_URL: process.env.NEXT_PUBLIC_FAUCET_URL,
	};
}

export const useEnv = () => {
	return useQuery(["env"], () => getEnv(), {
		initialData: getEnv(),
		staleTime: Number.POSITIVE_INFINITY,
		cacheTime: Number.POSITIVE_INFINITY,
	});
};
