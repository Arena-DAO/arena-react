"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/react";
import { BsDiscord, BsWallet } from "react-icons/bs";
import { toast } from "react-toastify";
import { useEnv } from "~/hooks/useEnv";
import Profile from "./Profile";

export default function WalletConnectToggle() {
	const { data: env } = useEnv();
	const chainContext = useChain(env.CHAIN);

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
							isTooltipDisabled
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
					disabledKeys={env.ENV === "production" ? [] : ["connect"]}
				>
					<DropdownItem key="wallet">Manage Wallet</DropdownItem>
					<DropdownItem
						key="connect"
						startContent={<BsDiscord className="text-[#5865F2]" />}
					>
						Connect Discord
					</DropdownItem>
					<DropdownItem key="registry" href={"/user/payment-registry"}>
						Payment Registry
					</DropdownItem>
					<DropdownItem
						key="competitions"
						href={`/user/competitions?host=${chainContext.address}`}
					>
						My Competitions
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		);
	}
	return (
		<Button
			isLoading={chainContext.isWalletConnecting}
			variant="ghost"
			color="primary"
			onPress={chainContext.openView}
			isIconOnly
		>
			<BsWallet />
		</Button>
	);
}
