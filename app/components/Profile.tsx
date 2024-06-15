"use client";

import {
	Avatar,
	Button,
	Link,
	Skeleton,
	Tooltip,
	User,
	type UserProps,
} from "@nextui-org/react";
import { BsYinYang } from "react-icons/bs";
import {
	isValidBech32Address,
	isValidContractAddress,
} from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import type { WithClient } from "~/types/util";
import { CopyAddressButton } from "./CopyAddressButton";

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
	isTooltipDisabled?: boolean;
}

const Profile = ({
	address,
	cosmWasmClient,
	hideIfInvalid = false,
	justAvatar = false,
	isTooltipDisabled = false,
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

	if (isLoading) return <Skeleton />;

	return (
		<Tooltip
			isDisabled={isTooltipDisabled}
			content={
				<div className="flex gap-4">
					<CopyAddressButton address={data?.address ?? ""} />
					{data?.address &&
						isValidContractAddress(data.address, env.BECH32_PREFIX) && (
							<Button
								as={Link}
								href={`${env.DAO_DAO_URL}/dao/${data.address}`}
								isExternal
								startContent={<BsYinYang />}
							>
								View on DAO DAO
							</Button>
						)}
				</div>
			}
			closeDelay={1000}
		>
			<User
				{...props}
				name={data?.name ?? data?.address}
				avatarProps={{
					src: data?.imageUrl,
					showFallback: true,
				}}
			/>
		</Tooltip>
	);
};

export default Profile;
