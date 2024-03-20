import { z } from "zod";
import AddressSchema from "./AddressSchema";
import MemberPercentageSchema from "./MemberPercentageSchema";

const DistributionSchema = z.object({
	member_percentages: MemberPercentageSchema.array().refine(
		(distributions) => {
			const totalPercentage = distributions.reduce(
				(acc, cur) => acc + cur.percentage,
				0,
			);
			return totalPercentage === 1;
		},
		{ message: "Sum of percentages must equal 1" },
	),
	remainder_addr: AddressSchema,
});

export default DistributionSchema;
