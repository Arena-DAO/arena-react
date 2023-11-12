import { z } from "zod";

const Uint128Schema = z.number().positive();

export default Uint128Schema;
