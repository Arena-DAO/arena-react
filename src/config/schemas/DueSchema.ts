import { z } from "zod";
import AddressSchema from "./AddressSchema";
import BalanceSchema from "./BalanceSchema";

const DueSchema = z
	.object({
		addr: AddressSchema,
		balance: BalanceSchema,
	})
	.refine(
		(data) => {
			return (
				(data.balance.cw20 && data.balance.cw20.length > 0) ||
				(data.balance.cw721 && data.balance.cw721.length > 0) ||
				(data.balance.native && data.balance.native.length > 0)
			);
		},
		{
			message:
				"At least one of cw20, cw721, or native must be provided and not empty",
		},
	);

export default DueSchema;
