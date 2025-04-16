"use client";

import { useChain } from "@cosmos-kit/react";
import {
	Image,
	Link,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
} from "@heroui/react";
import { Chip } from "@heroui/react";
import { Book, Coins, Droplet, Home, Lock, Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

const AppNavbar = () => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const env = useEnv();
	const { address } = useChain(env.CHAIN);
	const pathname = usePathname();

	const isActive = (href: string): boolean => {
		// For exact match
		if (pathname === href) return true;
		// For "starts with" match, but avoid matching "/" with everything
		if (href !== "/" && pathname.startsWith(href)) return true;
		return false;
	};

	const menuItems = React.useMemo(() => {
		const menu = [
			{
				key: "home",
				text: "Home",
				href: "/",
				icon: <Home width={18} height={18} />,
			},
			{
				key: "compete",
				text: "Compete",
				href: "/compete",
				icon: <Trophy width={18} height={18} />,
			},
			{
				key: "docs",
				text: "Docs",
				href: env.DOCS_URL,
				isExternal: true,
				icon: <Book width={18} height={18} />,
			},
			{
				key: "kado",
				text: "Convert Funds",
				href: "https://app.kado.money/?onPayCurrency=USD&onPayAmount=200&onRevCurrency=USDC&offPayCurrency=USDC&offRevCurrency=USD&network=NEUTRON&onToAddress=X&offFromAddress=X&cryptoList=USDC&networkList=NEUTRON&apiKey=API_KEY&product=BUY",
				isExternal: true,
				icon: <Coins width={18} height={18} />,
			},
		];

		if (env.FAUCET_URL) {
			menu.push({
				key: "faucet",
				text: "Faucet",
				href: env.FAUCET_URL,
				isExternal: true,
				icon: <Droplet width={18} height={18} />,
			});
		}

		if (address === env.ARENA_DAO_ADDRESS) {
			menu.push({
				key: "jailhouse",
				text: "Jailhouse",
				href: "/dao/jailhouse",
				icon: <Lock width={18} height={18} />,
			});
		}

		return menu;
	}, [address, env]);

	return (
		<Navbar
			onMenuOpenChange={setIsMenuOpen}
			isMenuOpen={isMenuOpen}
			className={`border-none backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${
				isMenuOpen ? "bg-background-50/80" : ""
			}`}
			classNames={{
				wrapper: "w-full max-w-7xl justify-center px-4",
				item: "hidden lg:flex",
			}}
			height="64px"
		>
			<NavbarMenuToggle
				className="transition-colors duration-200 hover:text-primary lg:hidden"
				aria-label={isMenuOpen ? "Close menu" : "Open menu"}
			/>

			<NavbarBrand className="flex items-center gap-2">
				<div className="relative flex h-10 w-10 items-center justify-center">
					<div className="absolute inset-0" />
					<Image
						src="/logo.svg"
						alt="Arena DAO logo"
						width={40}
						height={40}
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

			<NavbarContent
				className="glassmorphism hidden h-12 gap-1 rounded-xl border border-background-200/20 bg-background-50/60 px-2 backdrop-blur-md lg:flex"
				justify="center"
			>
				{menuItems.map((item) => (
					<NavbarItem key={item.key}>
						<Link
							className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium text-foreground transition-all duration-300 ${
								isActive(item.href)
									? "bg-gradient-to-r from-primary-900/30 to-primary-700/10 shadow-inner-glow"
									: "hover:bg-background-100/30"
							}`}
							href={item.href}
							underline="none"
							isExternal={item.isExternal}
						>
							<span
								className={`transition-transform duration-300 ${
									isActive(item.href) ? "text-primary" : ""
								}`}
							>
								{item.icon}
							</span>
							<span className="relative">{item.text}</span>
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>

			<NavbarContent justify="end">
				<NavbarItem className="!flex">
					<WalletConnectToggle />
				</NavbarItem>
			</NavbarContent>

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
								className={`flex w-full items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
									isActive(item.href)
										? "border-primary border-l-2 bg-gradient-to-r from-primary-900/30 to-transparent text-white"
										: "text-white/70 hover:bg-background-100/20 hover:text-white"
								}`}
								href={item.href}
								onPress={() => setIsMenuOpen(false)}
								underline="none"
								isExternal={item.isExternal}
							>
								<span
									className={
										isActive(item.href)
											? "text-glow text-primary"
											: "text-white/70"
									}
								>
									{item.icon}
								</span>
								<span className="font-medium">{item.text}</span>
							</Link>
						</NavbarMenuItem>
					))}

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
};

export default AppNavbar;
