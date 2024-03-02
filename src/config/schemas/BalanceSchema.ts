import { z } from "zod";
import AddressSchema from "./AddressSchema";
import AmountSchema from "./AmountSchema";

const BalanceSchema = z.object({
	cw20: z.array(
		z.object({
			address: AddressSchema,
			amount: AmountSchema,
		}),
	),
	cw721: z.array(
		z.object({
			address: AddressSchema,
			token_ids: z.array(z.string().nonempty()).min(1),
		}),
	),
	native: z.array(
		z.object({
			denom: z.string().nonempty(),
			amount: AmountSchema,
		}),
	),
});

export default BalanceSchema;
