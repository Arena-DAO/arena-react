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
	User,
	type UserProps,
} from "@heroui/react";
import { memo, useMemo } from "react";
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
	justAvatar?: boolean;
	isPopoverDisabled?: boolean;
	isRatingDisabled?: boolean;
	statProps?: StatProps;
}

const CardContent = memo(
	({
		data,
		isEnrollmentContract,
		parsedRating,
		statProps,
	}: {
		data: ReturnType<typeof useProfileData>["data"];
		isEnrollmentContract: boolean;
		parsedRating?: string;
		statProps?: StatProps;
	}) => (
		<Card
			shadow="none"
			className="min-w-64"
			classNames={{ footer: "px-0 py-1" }}
		>
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
	),
);

CardContent.displayName = "ProfileCardContent";

const Profile = ({
	address,
	justAvatar = false,
	isPopoverDisabled = false,
	isRatingDisabled = false,
	statProps,
	...props
}: ProfileProps) => {
	// All hooks must be called unconditionally at the top
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const category = useCategoryContext();

	// Validate address against current chain's prefix
	const isValid = useMemo(
		() => Boolean(address) && isValidBech32Address(address, env.BECH32_PREFIX),
		[address, env.BECH32_PREFIX],
	);

	// Check if this is the enrollment contract address
	const isEnrollmentContract = useMemo(
		() => address === env.ARENA_COMPETITION_ENROLLMENT_ADDRESS,
		[address, env.ARENA_COMPETITION_ENROLLMENT_ADDRESS],
	);

	// Fetch profile data - always call this hook regardless of isValid
	const { data: profileData, error: profileError } = useProfileData(
		address,
		isValid,
	);

	// Always calculate this - the enabled option in the query will prevent the actual fetch
	const shouldFetchRating = useMemo(
		() =>
			isValid &&
			Boolean(cosmWasmClient) &&
			!isRatingDisabled &&
			Boolean(category?.category_id) &&
			!isEnrollmentContract,
		[
			isValid,
			cosmWasmClient,
			isRatingDisabled,
			category?.category_id,
			isEnrollmentContract,
		],
	);

	// Always call this hook with appropriate enabled option
	const { data: ratingData } = useArenaCoreQueryExtensionQuery({
		client: useMemo(
			() =>
				cosmWasmClient && env?.ARENA_CORE_ADDRESS
					? new ArenaCoreQueryClient(cosmWasmClient, env.ARENA_CORE_ADDRESS)
					: undefined,
			[cosmWasmClient, env?.ARENA_CORE_ADDRESS],
		),
		args: {
			msg: {
				rating: {
					addr: address || "",
					category_id: category?.category_id?.toString() || "",
				},
			},
		},
		options: {
			enabled: shouldFetchRating,
			retry: 1,
		},
	});

	// Calculate rating display value
	const parsedRating = useMemo(
		() =>
			category && ratingData
				? (ratingData as unknown as Rating).value
				: undefined,
		[category, ratingData],
	);

	// Memoize UI elements to avoid recreating them on every render
	const avatarElement = useMemo(() => {
		if (profileError && !profileData) {
			return (
				<Avatar
					className={`${props.className || ""} aspect-square bg-danger`}
					fallback={<AvatarIcon />}
					alt="Error loading profile"
					radius="full"
				/>
			);
		}

		return (
			<Avatar
				className={`${props.className || ""} aspect-square`}
				src={profileData?.imageUrl || undefined}
				content={profileData?.name ?? address?.slice(0, 6)}
				showFallback
				fallback={<AvatarIcon />}
				alt={profileData?.name || "User avatar"}
				radius="full"
			/>
		);
	}, [profileData, profileError, address, props.className]);

	const userElement = useMemo(() => {
		if (profileError && !profileData) {
			return (
				<User
					{...props}
					name="Error loading profile"
					className="cursor-not-allowed opacity-75"
					avatarProps={{
						className: `${props.className || ""} bg-danger aspect-square`,
						fallback: <AvatarIcon />,
						showFallback: true,
						alt: "Error loading profile",
						radius: "full",
					}}
				/>
			);
		}

		return (
			<User
				{...props}
				name={
					profileData?.name ??
					(address ? `${address.slice(0, 12)}...` : "Unknown")
				}
				className="cursor-pointer"
				avatarProps={{
					src: profileData?.imageUrl || undefined,
					className: `${props.className || ""} aspect-square`,
					fallback: <AvatarIcon />,
					showFallback: true,
					alt: profileData?.name || "User avatar",
					radius: "full",
				}}
			/>
		);
		// biome-ignore lint/correctness/useExhaustiveDependencies: Needed
	}, [profileData, profileError, address, props]);

	// Build popover content
	const popoverContent = useMemo(() => {
		if (isPopoverDisabled) return null;
		return (
			<CardContent
				data={profileData}
				isEnrollmentContract={isEnrollmentContract}
				parsedRating={parsedRating}
				statProps={statProps}
			/>
		);
	}, [
		profileData,
		isEnrollmentContract,
		parsedRating,
		statProps,
		isPopoverDisabled,
	]);

	// Early return if we shouldn't render
	if (!isValid) {
		return null;
	}

	// Render based on view mode
	if (justAvatar) {
		return isPopoverDisabled ? (
			avatarElement
		) : (
			<Popover placement="bottom">
				<PopoverTrigger>{avatarElement}</PopoverTrigger>
				<PopoverContent>{popoverContent}</PopoverContent>
			</Popover>
		);
	}

	return isPopoverDisabled ? (
		userElement
	) : (
		<Popover placement="bottom">
			<PopoverTrigger>{userElement}</PopoverTrigger>
			<PopoverContent>{popoverContent}</PopoverContent>
		</Popover>
	);
};

export default memo(Profile);
