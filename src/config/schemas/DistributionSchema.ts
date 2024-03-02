import { z } from "zod";
import AddressSchema from "./AddressSchema";

const DistributionSchema = z
	.object({
		addr: AddressSchema,
		shares: z
			.string()
			.min(1, { message: "Shares are required" })
			.refine((value) => !Number.isNaN(parseInt(value)), {
				message: "Shares must be a valid number",
			}),
	})
	.array();

export default DistributionSchema;
