import { z } from "zod";

const Uint128Schema = z.coerce
	.bigint()
	.nonnegative()
	.transform((x) => x.toString());

export default Uint128Schema;
