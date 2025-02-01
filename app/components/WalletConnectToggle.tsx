"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Tooltip,
} from "@heroui/react";
import { Wallet } from "lucide-react";
import { useMemo } from "react";
import { BsDiscord } from "react-icons/bs";
import { toast } from "react-toastify";
import { isValidWalletAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { useAuthStore } from "~/store/authStore";
import Profile from "./Profile";

export default function WalletConnectToggle() {
	const env = useEnv();
	const chainContext = useChain(env.CHAIN);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const menuItems = useMemo(() => {
		const discordIcon = <BsDiscord className="text-[#5865F2]" />;
		return [
			{
				key: "wallet",
				label: "Manage Wallet",
			},
			...(env.ENV === "production" &&
			!isAuthenticated &&
			chainContext.address &&
			isValidWalletAddress(chainContext.address)
				? [
						{
							key: "connect",
							label: "Connect Discord",
							icon: discordIcon,
						},
					]
				: []),
			...(isAuthenticated
				? [
						{
							key: "logout",
							label: "Logout",
							icon: discordIcon,
							href: "/oauth/logout",
						},
					]
				: []),
			{
				key: "teams",
				label: "Teams",
				href: "/user/teams",
			},
			{
				key: "registry",
				label: "Payment Registry",
				href: "/user/payment-registry",
			},
			{
				key: "competitions",
				label: "My Competitions",
				href: `/user/competitions?host=${chainContext.address}`,
			},
		];
	}, [chainContext.address, env.ENV, isAuthenticated]);

	const handleDiscordConnect = () => {
		if (!chainContext.address) {
			toast.error("Wallet must be connected");
			return; // Exit the function if no wallet is connected
		}

		// Encode the current URL and wallet address
		const redirectUri = encodeURIComponent(window.location.href);
		const walletAddress = encodeURIComponent(chainContext.address);

		// Redirect to the Lambda login endpoint with both parameters
		window.location.href = `${env.API_URL}/login?redirect_uri=${redirectUri}&wallet_address=${walletAddress}`;
	};

	if (chainContext.isWalletConnected && chainContext.address) {
		return (
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
					<Button variant="light" isIconOnly>
						<Profile
							address={chainContext.address}
							justAvatar
							isRatingDisabled
							isPopoverDisabled
						/>
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Profile Actions"
					onAction={(key) => {
						if (key === "wallet") {
							chainContext.openView();
						} else if (key === "connect") {
							handleDiscordConnect();
						}
					}}
				>
					{menuItems.map((item) => (
						<DropdownItem
							key={item.key}
							startContent={item.icon}
							href={item.href}
						>
							{item.label}
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>
		);
	}
	return (
		<Tooltip content="Connect a wallet to get started!">
			<Button
				isLoading={chainContext.isWalletConnecting}
				variant="ghost"
				color="primary"
				onPress={chainContext.openView}
				isIconOnly
			>
				<Wallet />
			</Button>
		</Tooltip>
	);
}
