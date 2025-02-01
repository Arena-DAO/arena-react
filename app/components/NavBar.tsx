"use client";

import {
	Chip,
	Link,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
	cn,
} from "@heroui/react";
import dynamic from "next/dynamic";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});
import { Image } from "@heroui/react";
import { Book, Coins, Droplet, House, Lock, Trophy } from "lucide-react";
import NextImage from "next/image";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import { type Env, useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

// Define the menu structure
const menuConfig = (env: Env) => {
	const menu = [
		{
			key: "home",
			text: "Home",
			href: "/",
			icon: <House />,
		},
		{
			key: "compete",
			text: "Compete",
			href: "/compete",
			icon: <Trophy />,
		},
		{
			key: "jailhouse",
			text: "Jailhouse",
			href: "/dao/jailhouse",
			icon: <Lock />,
		},
		{
			key: "docs",
			text: "Docs",
			href: env.DOCS_URL,
			isExternal: true,
			icon: <Book />,
		},
		{
			key: "kado",
			text: "Convert Funds",
			href: "https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=USDC&offPayCurrency=USDC&offRevCurrency=USD&network=NEUTRON&onToAddress=X&offFromAddress=X&cryptoList=USDC&networkList=NEUTRON&apiKey=API_KEY&product=BUY",
			isExternal: true,
			icon: <Coins />,
		},
	];

	// Conditionally add the faucet link for testnet
	if (env.FAUCET_URL) {
		menu.push({
			key: "faucet",
			text: "Faucet",
			href: env.FAUCET_URL,
			isExternal: true,
			icon: <Droplet />,
		});
	}

	return menu;
};

export default function AppNavbar() {
	const env = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuItems = useMemo(() => menuConfig(env), [env]);

	return (
		<Navbar
			onMenuOpenChange={setIsMenuOpen}
			isMenuOpen={isMenuOpen}
			classNames={{
				base: cn("border-default-100", {
					"bg-default-200/50 dark:bg-default-100/50": isMenuOpen,
				}),
				wrapper: "w-full justify-center bg-transparent",
				item: "hidden lg:flex font-semibold",
			}}
			height="60px"
		>
			<NavbarMenuToggle className="text-default-400 lg:hidden" />
			<NavbarBrand>
				<Image
					as={NextImage}
					src="/logo.svg"
					alt="logo"
					width="48"
					height="48"
					removeWrapper
					radius="none"
				/>
				<h3 className="ml-2 font-extrabold text-inherit">Arena DAO</h3>
				{env.ENV === "development" && (
					<Chip className="ml-2 hidden lg:flex" size="sm">
						testnet
					</Chip>
				)}
			</NavbarBrand>

			<NavbarContent
				className="hidden h-11 gap-6 rounded-full border-default-200/20 border-small bg-background/60 px-4 shadow-medium backdrop-blur-lg backdrop-saturate-150 lg:flex dark:bg-default-100/50"
				justify="center"
			>
				{menuItems.map((item) => (
					<NavbarItem key={item.key}>
						<Link
							as={NextLink}
							className="flex items-center gap-1 text-default-500"
							href={item.href}
							isExternal={item.isExternal}
						>
							{item.icon && item.icon}
							{item.text}
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>
			<NavbarContent justify="end">
				<NavbarItem className="!flex ml-2 gap-2">
					<ColorModeSwitch />
					<WalletConnectToggle />
				</NavbarItem>
			</NavbarContent>
			<NavbarMenu
				className="top-[calc(var(--navbar-height)_-_1px)] max-h-[70vh] bg-default-200/50 pt-6 shadow-medium backdrop-blur-lg backdrop-saturate-150 dark:bg-default-100/50"
				motionProps={{
					initial: { opacity: 0, y: -20 },
					animate: { opacity: 1, y: 0 },
					exit: { opacity: 0, y: -20 },
					transition: {
						ease: "easeInOut",
						duration: 0.2,
					},
				}}
			>
				{menuItems.map((item) => (
					<NavbarMenuItem key={item.key}>
						<Link
							as={NextLink}
							className="flex w-full items-center gap-1 text-default-500"
							href={item.href}
							size="md"
							onPress={() => setIsMenuOpen(false)}
							isExternal={item.isExternal}
						>
							{item.icon && item.icon}
							{item.text}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
