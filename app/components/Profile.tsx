"use client";

import {
	Avatar,
	AvatarIcon,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Link,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
	User,
	type UserProps,
} from "@heroui/react";
import { useMemo } from "react";
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
import TeamMembersModal from "./TeamMembersModal";
import UserStatsModal from "./competition/view/components/UserStatsModal";

interface StatProps {
	moduleAddr: string;
	competitionId: string;
}

export interface ProfileProps extends Omit<UserProps, "name"> {
	address: string;
	hideIfInvalid?: boolean;
	justAvatar?: boolean;
	isPopoverDisabled?: boolean;
	isRatingDisabled?: boolean; // Should not be checked by the WalletConnectToggle
	statProps?: StatProps;
}

const Profile = ({
	address,
	hideIfInvalid = false,
	justAvatar = false,
	isPopoverDisabled = false,
	isRatingDisabled = false,
	statProps,
	...props
}: ProfileProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
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

	const parsedRating = category
		? rating
			? (rating as unknown as Rating).value
			: "1500"
		: undefined;

	const popoverContent = useMemo(() => {
		if (isPopoverDisabled) return null;
		return (
			<Card shadow="none" classNames={{ footer: "px-0 py-1" }}>
				{data?.name && (
					<CardHeader>
						{data.link ? (
							<Link isExternal showAnchorIcon href={data.link}>
								{data.name}
							</Link>
						) : (
							<>{data.name}</>
						)}
					</CardHeader>
				)}
				{!isEnrollmentContract && parsedRating && (
					<CardBody className="pt-0">
						Rating {Number.parseFloat(parsedRating).toFixed(2)}
					</CardBody>
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

								{isValidContractAddress(data.address) && (
									<TeamMembersModal daoAddress={data.address} />
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
	}, [data, isEnrollmentContract, parsedRating, statProps, isPopoverDisabled]);

	// Common elements
	const avatarElement = (
		<Avatar
			className={`${props.className} aspect-square`}
			src={data?.imageUrl || undefined}
			content={data?.name ?? data?.address}
			showFallback
			fallback={<AvatarIcon />}
			alt=" "
		/>
	);

	const userElement = (
		<User
			{...props}
			name={data?.name ?? data?.address}
			className="cursor-pointer"
			avatarProps={{
				src: data?.imageUrl || undefined,
				className: `${props.className} aspect-square`,
				fallback: <AvatarIcon />,
				showFallback: true,
				alt: " ",
			}}
		/>
	);

	if (isLoading) return <Skeleton />;

	// Conditional rendering logic
	if (justAvatar) {
		return isPopoverDisabled ? (
			avatarElement
		) : (
			<Popover>
				<PopoverTrigger>{avatarElement}</PopoverTrigger>
				<PopoverContent>{popoverContent}</PopoverContent>
			</Popover>
		);
	}

	return isPopoverDisabled ? (
		userElement
	) : (
		<Popover>
			<PopoverTrigger>{userElement}</PopoverTrigger>
			<PopoverContent>{popoverContent}</PopoverContent>
		</Popover>
	);
};

export default Profile;
