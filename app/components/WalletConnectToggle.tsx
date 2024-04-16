"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/react";
import { BsWallet } from "react-icons/bs";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import Profile from "./Profile";

export default function WalletConnectToggle() {
	const { data: env } = useEnv();
	const chainContext = useChain(env.CHAIN);
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	if (chainContext.isWalletConnected && chainContext.address) {
		return (
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
					<Button
						variant="light"
						isLoading={cosmWasmClient === undefined}
						isIconOnly
					>
						{cosmWasmClient && (
							<Profile
								address={chainContext.address}
								cosmWasmClient={cosmWasmClient}
								justAvatar
							/>
						)}
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Profile Actions"
					onAction={(key) => {
						if (key === "wallet") {
							chainContext.openView();
						}
					}}
				>
					<DropdownItem key="wallet">Manage Wallet</DropdownItem>
					<DropdownItem
						key="profile"
						href={`${env.DAO_DAO_URL}/me`}
						target="_blank"
					>
						View Profile
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
