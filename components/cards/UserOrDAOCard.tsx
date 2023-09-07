import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AddressSchema } from "~/helpers/SchemaHelpers";
import { DAOCard } from "./DAOCard";
import { UserCard } from "./UserCard";

interface UserOrDAOCardProps {
  cosmwasmClient: CosmWasmClient;
  address: string;
}

export function UserOrDAOCard({ cosmwasmClient, address }: UserOrDAOCardProps) {
  if (!AddressSchema.safeParse(address).success) return null;
  if (address.length == 43) return <UserCard addr={address} />;
  return <DAOCard address={address} cosmwasmClient={cosmwasmClient} />;
}
