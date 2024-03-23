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

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navbarItems = [
		{ href: "/compete", label: "Compete" },
		...(env.ENV === "development"
			? [{ href: "/faucet", label: "Faucet" }]
			: []),
		...(env.ENV === "production"
			? [{ href: env.OSMOSIS_URL, label: "Buy", isExternal: true }]
			: []),
		{
			label: "DAO",
			isDropdown: true,
			ariaLabel: "DAO Menu Items",
			dropdownItems: [
				{
					href: `${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}/proposals`,
					label: "Participate",
					description: "Go to the Arena DAO's proposals page",
					isExternal: true,
				},
				{
					href: "/jailhouse",
					description:
						"View jailed competitions needing action through the DAO",
					label: "Jailhouse",
				},
			],
		},
	];

	return (
		<Navbar onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen}>
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
										target={dropdownItem.isExternal ? "_blank" : ""}
										rel={dropdownItem.isExternal ? "noopener noreferrer" : ""}
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
											target={dropdownItem.isExternal ? "_blank" : ""}
											rel={dropdownItem.isExternal ? "noopener noreferrer" : ""}
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
