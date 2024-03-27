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
	NavbarMenuItem,
	NavbarMenuToggle,
} from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

interface MenuItem {
	href?: string;
	label: string;
	isExternal?: boolean;
	isDropdown?: boolean;
	ariaLabel?: string;
	dropdownItems?: MenuDropdownItem[];
}

interface MenuDropdownItem {
	href?: string;
	label: string;
	description?: string;
	isExternal?: boolean;
}

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navbarItems: MenuItem[] = [
		{ href: "/compete", label: "Compete" },
		{
			label: "DAO",
			isDropdown: true,
			ariaLabel: "DAO Menu Items",
			dropdownItems: [
				{
					href: "/dao/dao",
					label: "DAO",
					description: "View the Arena DAO on DAO DAO",
				},
				{
					href: "/resources/buy",
					label: "Buy",
					description: "Get $ARENA to participate in the DAO",
				},
				{
					href: "/dao/jailhouse",
					description:
						"View jailed competitions needing action through the DAO",
					label: "Jailhouse",
				},
			],
		},
		{
			label: "Resources",
			isDropdown: true,
			ariaLabel: "Additional Resources",
			dropdownItems: [
				...(env.ENV === "development"
					? [
							{
								href: "/resources/faucet",
								label: "Faucet",
								description: "Get testnet gas to explore The Arena",
							},
						]
					: []),
				{
					href: "/resources/bridge",
					label: "Bridge",
					description:
						"Transfer funds from other chains into the Juno ecosystem",
				},
			],
		},
	];

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
					<Link href="/" onClick={() => setIsMenuOpen(false)}>
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
				{navbarItems.map((item) =>
					item.isDropdown ? (
						<Dropdown key={item.label}>
							<NavbarItem>
								<DropdownTrigger>
									<Button
										disableRipple
										className="p-0 font-bold text-medium bg-transparent data-[hover=true]:bg-transparent"
										color="primary"
										endContent={<BsChevronDown />}
										variant="light"
									>
										{item.label}
									</Button>
								</DropdownTrigger>
							</NavbarItem>
							<DropdownMenu
								aria-label={item.ariaLabel}
								itemClasses={{
									base: "gap-4",
									title: "text-primary font-semibold",
								}}
								items={item.dropdownItems}
							>
								{(dropdownItem) => (
									<DropdownItem
										as={Link}
										key={dropdownItem.label}
										description={dropdownItem.description}
										href={dropdownItem.href}
									>
										{dropdownItem.label}
									</DropdownItem>
								)}
							</DropdownMenu>
						</Dropdown>
					) : (
						<NavbarItem key={item.href}>
							<Link
								href={item.href}
								className="font-bold"
								isExternal={item.isExternal}
							>
								{item.label}
							</Link>
						</NavbarItem>
					),
				)}
			</NavbarContent>

			<NavbarContent as="div" justify="end">
				<WalletConnectToggle />
			</NavbarContent>

			<NavbarMenu>
				{navbarItems.map((item) =>
					item.isDropdown ? (
						<NavbarMenuItem key={item.label}>
							<Dropdown>
								<DropdownTrigger>
									<Button
										disableRipple
										className="p-0 w-full text-medium justify-start font-bold bg-transparent data-[hover=true]:bg-transparent"
										color="primary"
										endContent={<BsChevronDown />}
										size="lg"
										variant="light"
									>
										{item.label}
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									aria-label={item.ariaLabel}
									itemClasses={{
										base: "gap-4",
										title: "text-primary font-semibold",
									}}
									items={item.dropdownItems}
								>
									{(dropdownItem) => (
										<DropdownItem
											as={Link}
											key={dropdownItem.label}
											description={dropdownItem.description}
											href={dropdownItem.href}
											onPress={() => setIsMenuOpen(false)}
										>
											{dropdownItem.label}
										</DropdownItem>
									)}
								</DropdownMenu>
							</Dropdown>
						</NavbarMenuItem>
					) : (
						<NavbarMenuItem key={item.href}>
							<Link
								className="w-full font-bold py-1"
								href={item.href}
								size="lg"
								isExternal={item.isExternal}
								onClick={() => setIsMenuOpen(false)}
							>
								{item.label}
							</Link>
						</NavbarMenuItem>
					),
				)}
			</NavbarMenu>
		</Navbar>
	);
}
