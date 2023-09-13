import env from "@config/env";
import { fromBech32 } from "@cosmjs/encoding";

export const isValidWalletAddress = (
  address: string,
  prefix: string = env.BECH32_PREFIX
): boolean => isValidBech32Address(address, prefix, 20);

export const isValidContractAddress = (
  address: string,
  prefix: string = env.BECH32_PREFIX
): boolean => isValidBech32Address(address, prefix, 32);

export const isValidValidatorAddress = (
  address: string,
  prefix: string = env.BECH32_PREFIX
): boolean => isValidBech32Address(address, prefix + "valoper");

// Validates any bech32 prefix, optionally requiring a specific prefix and/or
// length.
export const isValidBech32Address = (
  address: string,
  prefix: string = env.BECH32_PREFIX,
  // If passed, the address must contain this many bytes.
  length?: number
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
