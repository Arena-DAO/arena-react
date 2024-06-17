"use client";

import {
	Avatar,
	Button,
	Card,
	CardFooter,
	CardHeader,
	Link,
	Skeleton,
	Tooltip,
	User,
	type UserProps,
} from "@nextui-org/react";
import { useState } from "react";
import { BsYinYang } from "react-icons/bs";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import {
	isValidBech32Address,
	isValidContractAddress,
} from "~/helpers/AddressHelpers";
import { useCategory } from "~/hooks/useCategory";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import { CopyAddressButton } from "./CopyAddressButton";

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
	isTooltipDisabled?: boolean;
	isRatingDisabled?: boolean; // Should not be checked by the WalletConnectToggle
}

const Profile = ({
	address,
	hideIfInvalid = false,
	justAvatar = false,
	isTooltipDisabled = false,
	isRatingDisabled = false,
	...props
}: ProfileProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { data: category } = useCategory();

	const [isValid] = useState(isValidBech32Address(address, env.BECH32_PREFIX));
	const { data, isLoading } = useProfileData(address, isValid);
	const { data: rating } = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: {
			msg: {
				rating: {
					addr: address,
					// biome-ignore lint/style/noNonNullAssertion: Checked by enabled query
					category_id: category?.category_id?.toString()!,
				},
			},
		},
		options: {
			enabled: !isRatingDisabled && typeof category?.category_id === "number",
		},
	});

	if (!isValid && hideIfInvalid) {
		return null;
	}

	if (isLoading) return <Skeleton />;

	if (justAvatar) {
		return (
			<Avatar src={data?.imageUrl} content={data?.name ?? data?.address} />
		);
	}

	return (
		<Tooltip
			isDisabled={isTooltipDisabled}
			showArrow
			content={
				<Card shadow="none" classNames={{ body: "p-0", footer: "px-0 py-1" }}>
					{category?.category_id && (
						<CardHeader>
							Rating {Number.parseFloat(rating ?? "1500").toFixed(2)}
						</CardHeader>
					)}
					<CardFooter className="gap-2">
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
					</CardFooter>
				</Card>
			}
		>
			<User
				{...props}
				name={data?.name ?? data?.address}
				avatarProps={{
					src: data?.imageUrl,
				}}
			/>
		</Tooltip>
	);
};

export default Profile;
