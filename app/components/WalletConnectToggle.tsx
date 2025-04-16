"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownSection,
	DropdownTrigger,
	Tooltip,
	useDisclosure,
} from "@heroui/react";
import { LogOut, Split, Swords, Users, Vote, Wallet } from "lucide-react";
import type React from "react";
import { type Key, useMemo } from "react";
import { BsDiscord } from "react-icons/bs";
import { isValidWalletAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useAuthStore } from "~/store/authStore";
import Profile from "./Profile";
import TeamViewModal from "./TeamViewModal";

// Define type for menu sections
type MenuSection = {
	title: string;
	items: {
		key: string;
		label: string;
		icon: React.ReactNode;
		description?: string;
		href?: string;
	}[];
};

export default function WalletConnectToggle() {
	const env = useEnv();
	const chainContext = useChain(env.CHAIN);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const { isOpen, onOpen, onClose } = useDisclosure();

	// Extract wallet address for cleaner code
	const walletAddress = chainContext.address;
	const isWalletConnected = chainContext.isWalletConnected && walletAddress;
	const isWalletConnecting = chainContext.isWalletConnecting;

	// Organize menu items by section
	const menuSections: MenuSection[] = useMemo(() => {
		// Account section
		const accountSection: MenuSection = {
			title: "Account",
			items: [
				{
					key: "wallet",
					label: "Manage Wallet",
					icon: <Wallet />,
				},
			],
		};

		// Add Discord connection item if applicable
		if (
			env.ENV === "production" &&
			!isAuthenticated &&
			walletAddress &&
			isValidWalletAddress(walletAddress)
		) {
			accountSection.items.push({
				key: "connect",
				label: "Connect Discord",
				icon: <BsDiscord className="mx-1 text-[#5865F2]" />,
				description: "Set your profile",
			});
		}

		// Add logout item if authenticated
		if (isAuthenticated) {
			accountSection.items.push({
				key: "logout",
				label: "Logout",
				icon: <LogOut className="text-red-500" />,
				href: "/oauth/logout",
			});
		}

		// Activities section
		const activitiesSection: MenuSection = {
			title: "Your Actions",
			items: [
				{
					key: "teams",
					label: "My Teams",
					href: "/user/teams",
					icon: <Users className="text-blue-600" />,
					description: "Manage your teams",
				},
				{
					key: "registry",
					label: "Payment Registry",
					href: `/user/payment-registry?addr=${walletAddress}`,
					icon: <Split className="text-green-600" />,
					description: "Define payment flows",
				},
				{
					key: "competitions",
					label: "My Competitions",
					href: `/user/competitions?host=${walletAddress}`,
					icon: <Swords className="text-purple-600" />,
					description: "View your hosted competitions",
				},
			],
		};

		// Special actions section
		const specialSection: MenuSection = {
			title: "Team Actions",
			items: [
				{
					key: "teamView",
					label: "Team View",
					icon: <Vote size={18} className="text-yellow-500" />,
					description: "Perform actions as a team",
				},
			],
		};

		return [accountSection, activitiesSection, specialSection];
	}, [walletAddress, env.ENV, isAuthenticated]);

	const handleDiscordConnect = () => {
		if (!walletAddress) {
			throw new Error("Wallet must be connected");
		}

		// Encode the current URL and wallet address
		const redirectUri = encodeURIComponent(window.location.href);
		const encodedWalletAddress = encodeURIComponent(walletAddress);

		// Redirect to the Lambda login endpoint with both parameters
		window.location.href = `${env.API_URL}/login?redirect_uri=${redirectUri}&wallet_address=${encodedWalletAddress}`;
	};

	const handleMenuAction = (key: Key) => {
		switch (key) {
			case "wallet":
				chainContext.openView();
				break;
			case "connect":
				handleDiscordConnect();
				break;
			case "teamView":
				onOpen();
				break;
		}
	};

	// Render connected wallet UI
	if (isWalletConnected) {
		return (
			<>
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button variant="light" isIconOnly>
							<Profile
								address={walletAddress}
								justAvatar
								isRatingDisabled
								isPopoverDisabled
							/>
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Profile Actions"
						onAction={handleMenuAction}
						itemClasses={{
							base: "gap-2",
						}}
					>
						{menuSections.map((section, sectionIndex) => (
							<DropdownSection
								key={`section-${
									// biome-ignore lint/suspicious/noArrayIndexKey: best option
									sectionIndex
								}`}
								title={section.title}
								showDivider={sectionIndex !== menuSections.length - 1}
							>
								{section.items.map((item) => (
									<DropdownItem
										key={item.key}
										startContent={item.icon}
										href={item.href}
										description={item.description}
									>
										{item.label}
									</DropdownItem>
								))}
							</DropdownSection>
						))}
					</DropdownMenu>
				</Dropdown>

				{/* Team View Modal */}
				<TeamViewModal isOpen={isOpen} onClose={onClose} />
			</>
		);
	}

	// Render connect wallet button
	return (
		<Tooltip content="Connect a wallet to get started!">
			<Button
				isLoading={isWalletConnecting}
				variant="ghost"
				color="primary"
				onPress={chainContext.openView}
				isIconOnly
			>
				<Wallet size={20} />
			</Button>
		</Tooltip>
	);
}
