import { DAOCard } from "@components/cards/DAOCard";
import { UserCard } from "@components/cards/UserCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Control, useWatch } from "react-hook-form";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { FormValues } from "~/pages/wager/create";

interface WagerCreateUserOrDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
  index: number;
}

export function WagerCreateUserOrDAOCard({
  cosmwasmClient,
  control,
  index,
}: WagerCreateUserOrDAOCardProps) {
  let watchAddress = useWatch({ control, name: `dues.${index}.addr` });

  if (!AddressSchema.safeParse(watchAddress).success) return <></>;
  if (watchAddress.length == 43) return <UserCard addr={watchAddress} />;
  return <DAOCard address={watchAddress} cosmwasmClient={cosmwasmClient} />;
}
