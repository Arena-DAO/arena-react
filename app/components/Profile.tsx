"use client";

import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Link,
	Skeleton,
	Tooltip,
	User,
	type UserProps,
} from "@nextui-org/react";
import { useMemo } from "react";
import { BsYinYang } from "react-icons/bs";
import { ArenaCoreQueryClient } from "~/codegen/ArenaCore.client";
import { useArenaCoreQueryExtensionQuery } from "~/codegen/ArenaCore.react-query";
import type { Rating } from "~/codegen/ArenaCore.types";
import { useCategoryContext } from "~/contexts/CategoryContext";
import {
	isValidBech32Address,
	isValidContractAddress,
} from "~/helpers/AddressHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";
import { CopyAddressButton } from "./CopyAddressButton";
import UserStatsModal from "./competition/view/components/UserStatsModal";

interface StatProps {
	moduleAddr: string;
	competitionId: string;
}

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
	isTooltipDisabled?: boolean;
	isRatingDisabled?: boolean; // Should not be checked by the WalletConnectToggle
	statProps?: StatProps;
	tooltipOpenDelay?: number;
}

const Profile = ({
	address,
	hideIfInvalid = false,
	justAvatar = false,
	isTooltipDisabled = false,
	isRatingDisabled = false,
	statProps,
	tooltipOpenDelay,
	...props
}: ProfileProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const category = useCategoryContext();

	const isValid = useMemo(
		() => isValidBech32Address(address, env.BECH32_PREFIX),
		[address, env.BECH32_PREFIX],
	);
	const isEnrollmentContract =
		address === env.ARENA_COMPETITION_ENROLLMENT_ADDRESS;
	const { data, isLoading } = useProfileData(address, isValid);
	const { data: rating } = useArenaCoreQueryExtensionQuery({
		client:
			cosmWasmClient &&
			new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS),
		args: {
			msg: {
				rating: {
					addr: address,
					category_id: category?.category_id?.toString() || "",
				},
			},
		},
		options: {
			enabled:
				isValid &&
				!!cosmWasmClient &&
				!isRatingDisabled &&
				!!category?.category_id &&
				!isEnrollmentContract,
		},
	});

	if (!isValid && hideIfInvalid) {
		return null;
	}

	if (isLoading) return <Skeleton />;

	const parsedRating = category
		? rating
			? (rating as unknown as Rating).value
			: "1500"
		: undefined;

	const tooltipContent = (
		<Card shadow="none" classNames={{ header: "pb-0", footer: "px-0 py-1" }}>
			{data?.name && justAvatar && <CardHeader>{data.name}</CardHeader>}
			{!isEnrollmentContract && parsedRating && (
				<CardBody>Rating {Number.parseFloat(parsedRating).toFixed(2)}</CardBody>
			)}
			{data?.address && (
				<CardFooter className="gap-2">
					<CopyAddressButton address={data.address} />
					{!isEnrollmentContract && (
						<>
							<Button
								as={Link}
								href={`/user/competitions?host=${data.address}`}
							>
								Competitions
							</Button>

							{isValidContractAddress(data.address, env.BECH32_PREFIX) && (
								<Button
									as={Link}
									href={`${env.DAO_DAO_URL}/dao/${data.address}`}
									isExternal
									startContent={<BsYinYang />}
								>
									View on DAO DAO
								</Button>
							)}

							{statProps && (
								<UserStatsModal userAddress={data.address} {...statProps} />
							)}
						</>
					)}
				</CardFooter>
			)}
		</Card>
	);

	if (justAvatar) {
		return (
			<Tooltip
				isDisabled={isTooltipDisabled}
				showArrow
				content={tooltipContent}
				delay={tooltipOpenDelay}
			>
				<Avatar
					className={`${props.className} aspect-square`}
					src={data?.imageUrl || undefined}
					content={data?.name ?? data?.address}
				/>
			</Tooltip>
		);
	}

	return (
		<Tooltip
			delay={tooltipOpenDelay}
			isDisabled={isTooltipDisabled}
			showArrow
			content={tooltipContent}
		>
			<User
				{...props}
				name={data?.name ?? data?.address}
				avatarProps={{
					src: data?.imageUrl || undefined,
					className: "aspect-square",
				}}
			/>
		</Tooltip>
	);
};

export default Profile;
