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
import { BsYinYang } from "react-icons/bs";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import {
	isValidBech32Address,
	isValidContractAddress,
} from "~/helpers/AddressHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import { CopyAddressButton } from "./CopyAddressButton";

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
	isTooltipDisabled?: boolean;
	categoryId?: string;
}

const Profile = ({
	address,
	hideIfInvalid = false,
	justAvatar = false,
	isTooltipDisabled = false,
	categoryId,
	...props
}: ProfileProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const isValid = isValidBech32Address(address, env.BECH32_PREFIX);
	const { data, isLoading } = useProfileData(address, isValid);
	const { data: rating } = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		// biome-ignore lint/style/noNonNullAssertion: Checked by enabled
		args: { msg: { rating: { addr: address, category_id: categoryId! } } },
		options: { enabled: !!categoryId },
	});

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
				<Card>
					{rating && (
						<CardHeader>
							Rating {Number.parseFloat(rating).toFixed(2)}
						</CardHeader>
					)}
					<CardFooter>
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
