import { DAOCard } from "@components/cards/DAOCard";
import { AddressSchema } from "@config/schemas";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Control, useWatch } from "react-hook-form";
import { FormValues } from "~/pages/wager/create";

interface WagerCreateDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
}

export function WagerCreateDAOCard({
  cosmwasmClient,
  control,
}: WagerCreateDAOCardProps) {
  let watchDAOAddress = useWatch({ control, name: "dao_address" });

  if (!AddressSchema.safeParse(watchDAOAddress).success) return null;
  return <DAOCard address={watchDAOAddress} cosmwasmClient={cosmwasmClient} />;
}
