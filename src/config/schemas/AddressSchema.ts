import { z } from "zod";
import { isValidBech32Address } from "~/helpers/AddressHelpers";

const AddressSchema = z
	.string()
	.min(1, "Address is required")
	.refine(
		(value) =>
			isValidBech32Address(value, process.env.NEXT_PUBLIC_BECH32_PREFIX),
		{
			message: process.env.NEXT_PUBLIC_BECH32_PREFIX
				? `Invalid ${process.env.NEXT_PUBLIC_BECH32_PREFIX} Bech32 address`
				: "Invalid Bech32 address",
		},
	);

export default AddressSchema;

export const AddressFormSchema = z.object({
	address: AddressSchema,
});

export type AddressFormValues = z.infer<typeof AddressFormSchema>;
