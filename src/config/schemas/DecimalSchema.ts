import { z } from "zod";

const DecimalSchema = z
	.number()
	.min(0, { message: "Percentage must be non-negative" })
	.max(1, { message: "Percentage cannot exceed 1" });

export default DecimalSchema;
