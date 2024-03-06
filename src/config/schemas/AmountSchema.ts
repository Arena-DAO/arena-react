import { z } from "zod";

const Uint128Schema = z.bigint().nonnegative();

export default Uint128Schema;
