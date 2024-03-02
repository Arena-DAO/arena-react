import { CardProps } from "@chakra-ui/card";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AddressSchema } from "~/config/schemas";
import { DAOCard } from "./DAOCard";
import { UserCard } from "./UserCard";

interface UserOrDAOCardProps extends CardProps {
	cosmwasmClient: CosmWasmClient;
	address: string;
	subLink?: string;
}

export function UserOrDAOCard({
	cosmwasmClient,
	address,
	subLink,
	...cardProps
}: UserOrDAOCardProps) {
	if (!AddressSchema.safeParse(address).success) return null;
	if (address.length === 43) return <UserCard addr={address} {...cardProps} />;
	return (
		<DAOCard
			address={address}
			cosmwasmClient={cosmwasmClient}
			subLink={subLink}
			{...cardProps}
		/>
	);
}
