import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Control, useWatch } from "react-hook-form";
import { FormValues } from "./ProposalPromptModal";

interface ProposalPromptUserOrDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  control: Control<FormValues>;
  index: number;
}

export function ProposalPromptUserOrDAOCard({
  cosmwasmClient,
  control,
  index,
}: ProposalPromptUserOrDAOCardProps) {
  let watchAddress = useWatch({ control, name: `distribution.${index}.addr` });

  return (
    <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchAddress} />
  );
}
