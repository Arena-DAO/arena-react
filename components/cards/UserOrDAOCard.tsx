import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DAOCard } from "./DAOCard";
import { UserCard } from "./UserCard";
import { CardProps } from "@chakra-ui/card";
import { AddressSchema } from "@config/schemas";

interface UserOrDAOCardProps extends CardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
}

export function UserOrDAOCard({
  cosmwasmClient,
  address,
  ...cardProps
}: UserOrDAOCardProps) {
  if (!AddressSchema.safeParse(address).success) return null;
  if (address.length == 43) return <UserCard addr={address} {...cardProps} />;
  return (
    <DAOCard address={address} cosmwasmClient={cosmwasmClient} {...cardProps} />
  );
}
