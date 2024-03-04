import { z } from "zod";
import { isValidBech32Address } from "~/helpers/AddressHelpers";

const AddressSchema = z
	.string()
	.min(1, "Address is required")
	.refine((value) => isValidBech32Address(value), {
		message: "Invalid Bech32 address",
	});

export default AddressSchema;
