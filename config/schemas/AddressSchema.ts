import env from "@config/env";
import { z } from "zod";
import { isValidBech32Address } from "~/helpers/AddressHelpers";

const AddressSchema = z
  .string()
  .nonempty("Address is required")
  .startsWith(env.BECH32_PREFIX, {
    message: `Address must start with the ${env.BECH32_PREFIX} prefix`,
  })
  .refine((value) => isValidBech32Address(value), {
    message: "Invalid Bech32 address",
  });

export default AddressSchema;
