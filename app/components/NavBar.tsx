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
		},
		{
			key: "compete",
			text: "Compete",
			href: "/compete",
		},
		{
			key: "jailhouse",
			text: "Jailhouse",
			href: "/dao/jailhouse",
		},
		{
			key: "docs",
			text: "Docs",
			href: env.DOCS_URL,
			isExternal: true,
		},
	];

	// Conditionally add the faucet link for testnet
	if (env.FAUCET_URL) {
		menu.push({
			key: "faucet",
			text: "Faucet",
			href: env.FAUCET_URL,
			isExternal: true,
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
				item: "hidden md:flex font-semibold",
			}}
			height="60px"
		>
			<NavbarMenuToggle className="text-default-400 md:hidden" />
			<NavbarBrand>
				<div className="rounded-full bg-foreground text-background">
					<Image
						as={NextImage}
						src="/logo.png"
						alt="logo"
						width="48"
						height="48"
						removeWrapper
						radius="none"
					/>
				</div>
				<h3 className="ml-2 font-bold text-inherit">Arena DAO</h3>
				{env.ENV === "development" && (
					<Chip className="ml-2 hidden md:flex" size="sm">
						testnet
					</Chip>
				)}
			</NavbarBrand>

			<NavbarContent
				className="hidden h-11 gap-6 rounded-full border-default-200/20 border-small bg-background/60 px-4 shadow-medium backdrop-blur-md backdrop-saturate-150 md:flex dark:bg-default-100/50"
				justify="center"
			>
				{menuItems.map((item) => (
					<NavbarItem key={item.key}>
						<Link
							as={NextLink}
							className="text-default-500"
							href={item.href}
							isExternal={item.isExternal}
						>
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
				className="top-[calc(var(--navbar-height)_-_1px)] max-h-[70vh] bg-default-200/50 pt-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
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
							className="w-full text-default-500"
							href={item.href}
							size="md"
							onPress={() => setIsMenuOpen(false)}
							isExternal={item.isExternal}
						>
							{item.text}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
