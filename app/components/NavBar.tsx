"use client";

import {
	Link,
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
} from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import NextLink from "next/link";
import { useState } from "react";
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navbarItems = [
		{ href: "/", label: "Home" },
		{ href: "/compete", label: "Compete" },
		...(env.ENV === "development"
			? [{ href: "/faucet", label: "Faucet" }]
			: []),
		...(env.ENV === "production"
			? [{ href: env.OSMOSIS_URL, label: "Buy", isExternal: true }]
			: []),
	];

	return (
		<Navbar onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen}>
			<NavbarContent>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="md:hidden"
				/>
				<NavbarBrand>
					<Link
						isExternal
						href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
					>
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="logo"
							width="30"
							height="30"
							removeWrapper
						/>
						<p className="font-bold text-inherit ml-2">Arena DAO</p>
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden md:flex gap-4" justify="center">
				{navbarItems.map((item) => (
					<NavbarItem key={item.href}>
						<Link
							as={NextLink}
							href={item.href}
							className="font-bold"
							isExternal={item.isExternal}
						>
							{item.label}
						</Link>
					</NavbarItem>
				))}
			</NavbarContent>

			<NavbarContent as="div" justify="end">
				<WalletConnectToggle />
			</NavbarContent>

			<NavbarMenu>
				{navbarItems.map((item) => (
					<NavbarMenuItem key={item.href}>
						<Link
							as={NextLink}
							className="w-full font-bold"
							href={item.href}
							size="lg"
							isExternal={item.isExternal}
							onClick={() => setIsMenuOpen(false)}
						>
							{item.label}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
