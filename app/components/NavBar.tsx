"use client";

import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Link,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuToggle,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { useMemo, useState } from "react";
import {
	BsAlarm,
	BsBook,
	BsChevronDown,
	BsCurrencyBitcoin,
	BsCurrencyExchange,
	BsDiscord,
	BsGithub,
	BsTwitterX,
	BsYinYang,
} from "react-icons/bs";
import { type Env, useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

// Define the menu structure
const menuConfig = (env: Env) => [
	{
		label: "DAO",
		items: [
			{
				key: "dao",
				label: "DAO",
				href: `${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`,
				description: "View the Arena DAO on DAO DAO",
				startContent: <BsYinYang />,
				target: "_blank",
			},
			{
				key: "jailhouse",
				label: "Jailhouse",
				href: "/dao/jailhouse",
				description: "View jailed competitions needing action through the DAO",
				startContent: <BsAlarm />,
			},
		],
	},
	{
		label: "Resources",
		items: [
			...(env.FAUCET_URL
				? [
						{
							key: "faucet",
							label: "Faucet",
							href: env.FAUCET_URL,
							description: "Get testnet gas to explore The Arena",
							startContent: <BsCurrencyBitcoin />,
							target: "_blank",
						},
					]
				: []),
			{
				key: "docs",
				label: "Docs",
				href: env.DOCS_URL,
				description: "Learn more about how the Arena DAO works",
				startContent: <BsBook />,
				target: "_blank",
			},
			{
				key: "bridge",
				label: "Bridge",
				href: env.IBC_FUN,
				description: "Transfer funds from other chains into the ecosystem",
				startContent: <BsCurrencyExchange />,
				target: "_blank",
			},
		],
	},
	{
		label: "Socials",
		items: [
			{
				key: "twitter",
				label: "Twitter",
				href: "https://x.com/ArenaDAO",
				description: "Stay up to date with our announcements",
				startContent: <BsTwitterX />,
				target: "_blank",
			},
			{
				key: "discord",
				label: "Discord",
				href: "https://discord.arenadao.org/",
				description: "Connect with the community",
				startContent: <BsDiscord />,
				target: "_blank",
			},
			{
				key: "github",
				label: "GitHub",
				href: "https://github.com/Arena-DAO",
				description: "View or contribute to our codebase",
				startContent: <BsGithub />,
				target: "_blank",
			},
		],
	},
];

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuItems = useMemo(() => menuConfig(env), [env]);

	return (
		<Navbar
			onMenuOpenChange={setIsMenuOpen}
			isMenuOpen={isMenuOpen}
			className="fixed"
		>
			<NavbarContent>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="md:hidden"
				/>
				<NavbarBrand>
					<Link
						className="flex cursor-pointer flex-row items-center justify-center"
						onPress={() => setIsMenuOpen(false)}
						href="/"
					>
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="logo"
							width="32"
							height="32"
							removeWrapper
						/>
						<p className="title ml-2 font-bold">Arena DAO</p>
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 md:flex" justify="center">
				<NavbarItem>
					<Link
						className="flex cursor-pointer items-center font-semibold text-sm/6"
						href="/compete"
						onPress={() => setIsMenuOpen(false)}
					>
						Compete
					</Link>
				</NavbarItem>

				{menuItems.map((menu) => (
					<Dropdown key={menu.label}>
						<NavbarItem>
							<DropdownTrigger>
								<Button
									variant="light"
									className="flex items-center font-semibold text-primary text-sm/6"
									endContent={<BsChevronDown className="size-3" />}
								>
									{menu.label}
								</Button>
							</DropdownTrigger>
						</NavbarItem>
						<DropdownMenu
							aria-label={`${menu.label} Menu`}
							itemClasses={{ title: "text-primary font-semibold" }}
						>
							{menu.items.map((item) => (
								<DropdownItem
									key={item.key}
									href={item.href}
									onPress={() => setIsMenuOpen(false)}
									description={item.description}
									startContent={item.startContent}
									target={item.target}
								>
									{item.label}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				))}
			</NavbarContent>

			<NavbarMenu>
				<NavbarItem>
					<Link
						className="ml-4 flex cursor-pointer items-center py-1 font-semibold text-xl"
						href="/compete"
					>
						Compete
					</Link>
				</NavbarItem>

				{menuItems.map((menu) => (
					<Dropdown key={menu.label}>
						<NavbarItem>
							<DropdownTrigger className="text-left">
								<Button
									variant="light"
									className="flex items-center font-semibold text-primary text-xl"
									endContent={<BsChevronDown className="size-3" />}
								>
									{menu.label}
								</Button>
							</DropdownTrigger>
						</NavbarItem>
						<DropdownMenu
							aria-label={`${menu.label} Menu`}
							itemClasses={{ title: "text-primary font-semibold" }}
						>
							{menu.items.map((item) => (
								<DropdownItem
									key={item.key}
									href={item.href}
									onPress={() => setIsMenuOpen(false)}
									description={item.description}
									startContent={item.startContent}
									target={item.target}
								>
									{item.label}
								</DropdownItem>
							))}
						</DropdownMenu>
					</Dropdown>
				))}
			</NavbarMenu>
			<ColorModeSwitch />
			<WalletConnectToggle />
		</Navbar>
	);
}
