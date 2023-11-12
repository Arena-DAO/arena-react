import { z } from "zod";
import AddressSchema from "./AddressSchema";
import BalanceSchema from "./BalanceSchema";

const DueSchema = z
  .object({
    addr: AddressSchema,
    balance: BalanceSchema,
  })
  .superRefine((value, context) => {
    if (
      value.balance.cw20.length == 0 &&
      value.balance.cw721.length == 0 &&
      value.balance.native.length == 0
    ) {
      context.addIssue({
        path: ["balance"],
        code: z.ZodIssueCode.custom,
        message: "Due balance cannot be empty",
      });
    }
  });

export default DueSchema;
