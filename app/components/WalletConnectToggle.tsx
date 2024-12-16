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
import { useEnv } from "~/hooks/useEnv";
import Profile from "./Profile";

export default function WalletConnectToggle() {
	const { data: env } = useEnv();
	const chainContext = useChain(env.CHAIN);

	const handleDiscordConnect = () => {
		// Generate and store state parameter for security
		const state = crypto.randomUUID();
		localStorage.setItem("discord_oauth_state", state);
		localStorage.setItem("discord_oauth_redirect", window.location.href);

		// Redirect to the Lambda login endpoint
		window.location.href = `${env.API_URL}/login?state=${state}`;
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
			onClick={chainContext.openView}
			isIconOnly
		>
			<BsWallet />
		</Button>
	);
}
