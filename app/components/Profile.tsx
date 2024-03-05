"use client";

import { Skeleton, User } from "@nextui-org/react";
import { isValidBech32Address } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import { WithClient } from "~/types/util";

interface ProfileProps {
	address: string;
	hideIfInvalid?: boolean;
}

const Profile = ({
	address,
	cosmWasmClient,
	hideIfInvalid = false,
}: WithClient<ProfileProps>) => {
	const { data: env } = useEnv();
	const isValid = isValidBech32Address(address, env.BECH32_PREFIX);
	const { data, isLoading } = useProfileData(address, cosmWasmClient, isValid);

	if (!isValid && hideIfInvalid) {
		return null;
	}
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

export default Profile;
