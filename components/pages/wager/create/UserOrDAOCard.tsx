import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Control, useWatch } from "react-hook-form";
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

  return (
    <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchAddress} />
  );
}
