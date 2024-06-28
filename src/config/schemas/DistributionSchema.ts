import { ZodIssueCode, z } from "zod";
import AddressSchema from "./AddressSchema";
import MemberPercentageSchema from "./MemberPercentageSchema";

const DistributionSchema = z
	.object({
		member_percentages: MemberPercentageSchema.array(),
		remainder_addr: AddressSchema.optional(),
	})
	.superRefine((val, ctx) => {
		if (val.member_percentages.length > 0) {
			if (val.remainder_addr?.length === 0) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					path: ["remainder_addr"],
					message: "Remainder address is required",
				});
			}
			const sum = val.member_percentages.reduce(
				(acc, cur) => acc + cur.percentage,
				0,
			);
			if (Math.abs(sum - 1) > 0.000001) {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					path: ["member_percentages"],
					message: "Sum of percentages must equal 1",
				});
			}
		}
	})
	.optional();

export default DistributionSchema;
