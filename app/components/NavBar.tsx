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
	NavbarMenu,
	NavbarMenuToggle,
} from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
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

interface DynamicNavbarItem {
	item: MenuItem;
	setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
	dropdownButtonClass: string;
	linkClass: string;
}

const DynamicNavbarItem = ({
	item,
	setIsMenuOpen,
	dropdownButtonClass,
	linkClass,
}: DynamicNavbarItem) => {
	if (item.isDropdown)
		return (
			<Dropdown>
				<DropdownTrigger>
					<Button
						disableRipple
						className={dropdownButtonClass}
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
							target={dropdownItem.isExternal ? "_blank" : undefined}
						>
							{dropdownItem.label}
						</DropdownItem>
					)}
				</DropdownMenu>
			</Dropdown>
		);
	return (
		<Link
			className={linkClass}
			href={item.href}
			size="lg"
			isExternal={item.isExternal}
			onClick={() => setIsMenuOpen(false)}
		>
			{item.label}
		</Link>
	);
};

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navbarItems: MenuItem[] = [
		{ href: "/compete", label: "Compete" },
		{
			label: "DAO",
			isDropdown: true,
			ariaLabel: "DAO Menu",
			dropdownItems: [
				{
					href: "/dao/dao",
					label: "DAO",
					description: "View the Arena DAO on DAO DAO",
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
								// biome-ignore lint/style/noNonNullAssertion: dev env has this populated
								href: env.FAUCET_URL!,
								label: "Faucet",
								description: "Get testnet gas to explore The Arena",
								isExternal: true,
							},
						]
					: []),
				{
					href: "/resources/docs",
					label: "Docs",
					description: "Learn more about how the Arena DAO works",
				},
				{
					href: "/resources/bridge",
					label: "Bridge",
					description: "Transfer funds from other chains into the ecosystem",
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
						<p className="ml-2 font-bold text-inherit">Arena DAO</p>
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 md:flex" justify="center">
				{navbarItems.map((item) => (
					<DynamicNavbarItem
						key={item.label}
						item={item}
						setIsMenuOpen={setIsMenuOpen}
						dropdownButtonClass="bg-transparent p-0 font-bold text-medium data-[hover=true]:bg-transparent"
						linkClass="font-bold"
					/>
				))}
			</NavbarContent>

			<NavbarContent as="div" justify="end">
				<WalletConnectToggle />
			</NavbarContent>

			<NavbarMenu>
				{navbarItems.map((item) => (
					<DynamicNavbarItem
						key={item.label}
						item={item}
						setIsMenuOpen={setIsMenuOpen}
						dropdownButtonClass="w-full justify-start bg-transparent p-0 font-bold text-medium data-[hover=true]:bg-transparent"
						linkClass="w-full py-1 font-bold"
					/>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
