"use client";

import { Avatar, Skeleton, User, type UserProps } from "@nextui-org/react";
import { isValidBech32Address } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import type { WithClient } from "~/types/util";

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
}

const Profile = ({
	address,
	cosmWasmClient,
	hideIfInvalid = false,
	justAvatar = false,
	...props
}: WithClient<ProfileProps>) => {
	const { data: env } = useEnv();
	const isValid = isValidBech32Address(address, env.BECH32_PREFIX);
	const { data, isLoading } = useProfileData(address, cosmWasmClient, isValid);

	if (!isValid && hideIfInvalid) {
		return null;
	}

	if (justAvatar) {
		return (
			<Skeleton isLoaded={!isLoading}>
				<Avatar showFallback src={data?.imageUrl} />
			</Skeleton>
		);
	}

	return (
		<Skeleton isLoaded={!isLoading}>
			<User
				{...props}
				name={data?.name ?? data?.address}
				avatarProps={{
					src: data?.imageUrl,
					showFallback: true,
				}}
			/>
		</Skeleton>
	);
};

export default Profile;
