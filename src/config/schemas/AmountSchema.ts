import { z } from "zod";

const AmountSchema = z
	.string()
	.refine((value) => !Number.isNaN(parseFloat(value)), {
		message: "Amount must be a valid number",
	})
	.refine((value) => parseFloat(value) > 0, {
		message: "Amount must be positive",
	});

export default AmountSchema;
