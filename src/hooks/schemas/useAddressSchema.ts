import { z } from "zod";
import { isValidBech32Address } from "~/helpers/AddressHelpers";
import { useEnv } from "../useEnv";

export const useAddressSchema = () => {
	const { data: env } = useEnv();
	return z
		.string()
		.min(1, "Address is required")
		.startsWith(env.BECH32_PREFIX, {
			message: `Address must start with the ${env.BECH32_PREFIX} prefix`,
		})
		.refine((value) => isValidBech32Address(value), {
			message: "Invalid Bech32 address",
		});
};
