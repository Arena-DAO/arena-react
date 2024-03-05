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
						className="h-full"
						isLoading={cosmWasmClient === undefined}
					>
						{cosmWasmClient && (
							<Profile
								address={chainContext.address}
								cosmWasmClient={cosmWasmClient}
							/>
						)}
					</Button>
				</DropdownTrigger>
				<DropdownMenu aria-label="Profile Actions">
					<DropdownItem key="wallet" onClick={chainContext.openView}>
						Manage Wallet
					</DropdownItem>
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
			startContent={<BsWallet />}
			isLoading={chainContext.isWalletConnecting}
			variant="ghost"
			color="primary"
			onClick={chainContext.openView}
		>
			Connect Wallet
		</Button>
	);
}
