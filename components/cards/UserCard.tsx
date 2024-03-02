import { Card, CardBody, CardFooter, CardProps } from "@chakra-ui/card";
import { Avatar, Skeleton, Text } from "@chakra-ui/react";
import { CopyAddressButton } from "@components/buttons/CopyAddressButton";
import { BsPerson } from "react-icons/bs";
import { AddressSchema } from "~/config/schemas";
import { useProfileData } from "~/hooks/useProfileData";

interface UserCardProps extends CardProps {
	addr: string;
}

export function UserCard({ addr, ...cardProps }: UserCardProps) {
	const isEnabled = AddressSchema.safeParse(addr).success;
	const { data, isLoading, isError } = useProfileData(addr, isEnabled);

	if (isError || !isEnabled) {
		return null;
	}

	return (
		<Skeleton isLoaded={!isLoading}>
			<Card
				direction="row"
				px="4"
				overflow="hidden"
				alignItems="center"
				{...cardProps}
			>
				<Avatar
					src={data?.nft?.imageUrl}
					marginRight="3"
					name={data?.name || undefined}
					icon={<BsPerson />}
				/>
				<CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
					<Text>{data?.name ?? addr}</Text>
				</CardBody>
				<CardFooter>
					<CopyAddressButton addr={addr} aria-label="Copy Address" />
				</CardFooter>
			</Card>
		</Skeleton>
	);
}
