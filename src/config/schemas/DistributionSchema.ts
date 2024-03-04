import { z } from "zod";
import AddressSchema from "./AddressSchema";
import DecimalSchema from "./DecimalSchema";

const DistributionSchema = z
	.object({
		addr: AddressSchema,
		percentage: DecimalSchema,
	})
	.array()
	.refine(
		(distributions) => {
			const totalPercentage = distributions.reduce(
				(acc, cur) => acc + cur.percentage,
				0,
			);
			return totalPercentage === 1;
		},
		{ message: "Sum of percentages must equal 1" },
	);

export default DistributionSchema;
