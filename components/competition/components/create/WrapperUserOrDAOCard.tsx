import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { useWatch } from "react-hook-form";
import { FormComponentProps } from "../../CreateCompetitionForm";

interface WrapperUserOrDAOCardProps extends FormComponentProps {
  index: number;
}

export function WrapperUserOrDAOCard({
  cosmwasmClient,
  control,
  index,
}: WrapperUserOrDAOCardProps) {
  let watchAddress = useWatch({ control, name: `dues.${index}.addr` });

  return (
    <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={watchAddress} />
  );
}
