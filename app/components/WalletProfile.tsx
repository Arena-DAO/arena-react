"use client";

import { Skeleton, User } from "@nextui-org/react";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useProfileData } from "~/hooks/useProfile";
import { WithClient } from "~/types/util";

interface ProfileProps {
	address: string;
}

const WalletProfileComponent = ({
	address,
	cosmWasmClient,
}: WithClient<ProfileProps>) => {
	const { data, isLoading } = useProfileData(address, cosmWasmClient);

	return (
		<Skeleton isLoaded={!isLoading}>
			<User
				name={data?.name ?? data?.address}
				avatarProps={{
					src: data?.imageUrl,
				}}
			/>
		</Skeleton>
	);
};

export default function WalletProfile(props: ProfileProps) {
	const { data } = useCosmWasmClient();

	return (
		<>{data && <WalletProfileComponent cosmWasmClient={data} {...props} />}</>
	);
}
