import { fromBech32 } from "@cosmjs/encoding";

export const isValidWalletAddress = (
	address: string,
	prefix?: string,
): boolean => isValidBech32Address(address, prefix, 20);

export const isValidContractAddress = (
	address: string,
	prefix?: string,
): boolean => isValidBech32Address(address, prefix, 32);

// Validates any bech32 prefix, optionally requiring a specific prefix and/or
// length.
export const isValidBech32Address = (
	address: string,
	prefix?: string,
	length?: number,
): boolean => {
	try {
		const decoded = fromBech32(address);

		if (prefix && decoded.prefix !== prefix) {
			return false;
		}

		if (length !== undefined && decoded.data.length !== length) {
			return false;
		}

		return true;
	} catch (err) {
		return false;
	}
};
