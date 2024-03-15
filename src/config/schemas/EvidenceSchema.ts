import { z } from "zod";

const EvidenceSchema = z
	.object({
		content: z.string().min(1, { message: "Content is required" }),
	})
	.array()
	.min(1, { message: "Evidence is required" });

export default EvidenceSchema;
