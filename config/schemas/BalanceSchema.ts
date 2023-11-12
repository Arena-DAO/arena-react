import { z } from "zod";
import AmountSchema from "./AmountSchema";
import AddressSchema from "./AddressSchema";

const BalanceSchema = z.object({
  cw20: z.array(
    z.object({
      address: AddressSchema,
      amount: AmountSchema,
    })
  ),
  cw721: z.array(
    z.object({
      address: AddressSchema,
      token_ids: z.array(z.string().nonempty()).min(1),
    })
  ),
  native: z.array(
    z.object({
      denom: z.string().nonempty(),
      amount: AmountSchema,
    })
  ),
});

export default BalanceSchema;
