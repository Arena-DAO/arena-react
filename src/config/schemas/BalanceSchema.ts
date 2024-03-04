import { z } from "zod";
import AddressSchema from "./AddressSchema";
import Uint128Schema from "./AmountSchema";

const BalanceSchema = z.object({
	cw20: z.array(
		z.object({
			address: AddressSchema,
			amount: Uint128Schema,
		}),
	),
	cw721: z.array(
		z.object({
			address: AddressSchema,
			token_ids: z.array(z.string().min(1, "Token Id is required")).min(1),
		}),
	),
	native: z.array(
		z.object({
			denom: z.string().min(1, "Denom is required"),
			amount: Uint128Schema,
		}),
	),
});

export default BalanceSchema;
