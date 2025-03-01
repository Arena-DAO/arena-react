"use client";

import { useChain } from "@cosmos-kit/react";
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
import { Image } from "@heroui/react";
import { Book, Coins, Droplet, House, Lock, Trophy } from "lucide-react";
import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { type Env, useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

// Define the menu structure
const menuConfig = (address: string | undefined, env: Env) => {
	const menu = [
		{
			key: "home",
			text: "Home",
			href: "/",
			icon: <House size={18} />,
		},
		{
			key: "compete",
			text: "Compete",
			href: "/compete",
			icon: <Trophy size={18} />,
		},
		{
			key: "docs",
			text: "Docs",
			href: env.DOCS_URL,
			isExternal: true,
			icon: <Book size={18} />,
		},
		{
			key: "kado",
			text: "Convert Funds",
			href: "https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=USDC&offPayCurrency=USDC&offRevCurrency=USD&network=NEUTRON&onToAddress=X&offFromAddress=X&cryptoList=USDC&networkList=NEUTRON&apiKey=API_KEY&product=BUY",
			isExternal: true,
			icon: <Coins size={18} />,
		},
	];

	if (env.FAUCET_URL) {
		menu.push({
			key: "faucet",
			text: "Faucet",
			href: env.FAUCET_URL,
			isExternal: true,
			icon: <Droplet size={18} />,
		});
	}

	if (address === env.ARENA_DAO_ADDRESS) {
		menu.push({
			key: "jailhouse",
			text: "Jailhouse",
			href: "/dao/jailhouse",
			icon: <Lock size={18} />,
		});
	}

	return menu;
};

export default function AppNavbar() {
	const env = useEnv();
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { address } = useChain(env.CHAIN);
	const menuItems = useMemo(() => menuConfig(address, env), [address, env]);

	// Check if a menu item is active
	const isActive = (href: string) => {
		if (href === "/") {
			return pathname === "/";
		}
		return pathname.startsWith(href);
	};

	return (
		<Navbar
			onMenuOpenChange={setIsMenuOpen}
			isMenuOpen={isMenuOpen}
			classNames={{
				base: cn(
					"border-none backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
					{
						"bg-background-50/80": isMenuOpen,
					},
				),
				wrapper: "w-full max-w-7xl justify-center px-4",
				item: "hidden lg:flex",
			}}
			height="64px"
		>
			{/* Mobile menu toggle with glow effect */}
			<NavbarMenuToggle
				className="transition-colors duration-200 hover:text-primary lg:hidden"
				aria-label={isMenuOpen ? "Close menu" : "Open menu"}
			/>

			{/* Brand section with logo and name */}
			<NavbarBrand className="flex items-center gap-2">
				<div className="relative flex h-10 w-10 items-center justify-center">
					<div className="absolute inset-0" />
					<Image
						as={NextImage}
						src="/logo.svg"
						alt="Arena DAO logo"
						width="40"
						height="40"
						removeWrapper
						radius="none"
						className="relative z-10"
					/>
				</div>
				<h3 className="font-extrabold">Arena DAO</h3>
				{env.ENV === "development" && (
					<Chip
						className="ml-1 hidden bg-background-100 lg:flex"
						size="sm"
						radius="sm"
					>
						testnet
					</Chip>
				)}
			</NavbarBrand>

			{/* Desktop navigation items */}
			<NavbarContent
				className="glassmorphism hidden h-12 gap-1 rounded-xl border border-background-200/20 bg-background-50/60 px-2 backdrop-blur-md lg:flex"
				justify="center"
			>
				{menuItems.map((item) => (
					<NavbarItem key={item.key}>
						<Link
							as={NextLink}
							className={cn(
								"flex items-center gap-2 rounded-full px-4 py-2 font-medium text-foreground transition-all duration-300",
								isActive(item.href)
									? "bg-gradient-to-r from-primary-900/30 to-primary-700/10 shadow-inner-glow"
									: "hover:bg-background-100/30",
							)}
							href={item.href}
							isExternal={item.isExternal}
							underline="none"
						>
							<span
								className={cn("transition-transform duration-300", {
									"text-primary": isActive(item.href),
								})}
							>
								{item.icon}
							</span>
							<span className="relative">{item.text}</span>
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>

			{/* Wallet connect section */}
			<NavbarContent justify="end">
				<NavbarItem className="!flex">
					<div className="relative">
						<div
							className={cn(
								"absolute inset-0 rounded-full transition-opacity duration-300",
								"opacity-0 shadow-glow blur-xs hover:opacity-100",
							)}
						/>
						<WalletConnectToggle />
					</div>
				</NavbarItem>
			</NavbarContent>

			{/* Mobile menu */}
			<NavbarMenu
				className="top-[calc(var(--navbar-height)_-_1px)] max-h-[80vh] animate-slide-down border-background-100/20 border-t bg-background-50/90 pt-6 backdrop-blur-xl"
				motionProps={{
					initial: { opacity: 0, y: -10 },
					animate: { opacity: 1, y: 0 },
					exit: { opacity: 0, y: -10 },
					transition: {
						ease: "easeInOut",
						duration: 0.2,
					},
				}}
			>
				<div className="flex flex-col gap-2 px-2">
					{menuItems.map((item) => (
						<NavbarMenuItem key={item.key} className="py-1">
							<Link
								as={NextLink}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg p-3 transition-all duration-300",
									isActive(item.href)
										? "border-primary border-l-2 bg-gradient-to-r from-primary-900/30 to-transparent text-white"
										: "text-white/70 hover:bg-background-100/20 hover:text-white",
								)}
								href={item.href}
								onPress={() => setIsMenuOpen(false)}
								isExternal={item.isExternal}
								underline="none"
							>
								<span
									className={cn(
										isActive(item.href)
											? "text-glow text-primary"
											: "text-white/70",
									)}
								>
									{item.icon}
								</span>
								<span className="font-medium">{item.text}</span>
							</Link>
						</NavbarMenuItem>
					))}

					{/* Mobile environment indicator */}
					{env.ENV === "development" && (
						<div className="mx-3 mt-4">
							<Chip
								className="border border-primary-800/50 bg-background-100/50 text-primary"
								size="sm"
								radius="sm"
							>
								testnet
							</Chip>
						</div>
					)}
				</div>
			</NavbarMenu>
		</Navbar>
	);
}
