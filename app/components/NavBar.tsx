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
import { useState } from "react";
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
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

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
							width="30"
							height="30"
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

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-sm/6"
								endContent={<BsChevronDown className="size-3" />}
							>
								DAO
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="DAO Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="dao"
							description="View the Arena DAO on DAO DAO"
							href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
							onPress={() => setIsMenuOpen(false)}
							startContent={<BsYinYang />}
							target="_blank"
						>
							DAO
						</DropdownItem>
						<DropdownItem
							key="jailhouse"
							href="/dao/jailhouse"
							onPress={() => setIsMenuOpen(false)}
							description="View jailed competitions needing action through the DAO"
							startContent={<BsAlarm />}
						>
							Jailhouse
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-sm/6"
								endContent={<BsChevronDown className="size-3" />}
							>
								Resources
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="Resources Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="faucet"
							hidden={!env.FAUCET_URL}
							href={env.FAUCET_URL}
							onPress={() => setIsMenuOpen(false)}
							description="Get testnet gas to explore The Arena"
							startContent={<BsCurrencyBitcoin />}
							target="_blank"
						>
							Faucet
						</DropdownItem>
						<DropdownItem
							key="docs"
							description="Learn more about how the Arena DAO works"
							href={env.DOCS_URL}
							onPress={() => setIsMenuOpen(false)}
							startContent={<BsBook />}
							target="_blank"
						>
							Docs
						</DropdownItem>
						<DropdownItem
							key="bridge"
							href={env.IBC_FUN}
							onPress={() => setIsMenuOpen(false)}
							description="Transfer funds from other chains into the ecosystem"
							startContent={<BsCurrencyExchange />}
							target="_blank"
						>
							Bridge
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-sm/6"
								endContent={<BsChevronDown className="size-3" />}
							>
								Socials
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="Socials Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="twitter"
							href="https://x.com/ArenaDAO"
							onPress={() => setIsMenuOpen(false)}
							description="Stay up to date with our announcements"
							startContent={<BsTwitterX />}
							target="_blank"
						>
							Twitter
						</DropdownItem>
						<DropdownItem
							key="discord"
							href="https://discord.arenadao.org/"
							onPress={() => setIsMenuOpen(false)}
							description="Connect with the community"
							startContent={<BsDiscord />}
							target="_blank"
						>
							Discord
						</DropdownItem>
						<DropdownItem
							key="github"
							href="https://github.com/Arena-DAO"
							onPress={() => setIsMenuOpen(false)}
							description="View or contribute to our codebase"
							startContent={<BsGithub />}
							target="_blank"
						>
							GitHub
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
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

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger className="text-left">
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-xl"
								endContent={<BsChevronDown className="size-3" />}
							>
								DAO
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="DAO Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="dao"
							href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
							onPress={() => setIsMenuOpen(false)}
							description="View the Arena DAO on DAO DAO"
							startContent={<BsYinYang />}
							target="_blank"
						>
							DAO
						</DropdownItem>
						<DropdownItem
							key="jailhouse"
							href="/dao/jailhouse"
							onPress={() => setIsMenuOpen(false)}
							description="View jailed competitions needing action through the DAO"
							startContent={<BsAlarm />}
						>
							Jailhouse
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-xl"
								endContent={<BsChevronDown className="size-3" />}
							>
								Resources
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="Resources Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="faucet"
							hidden={!env.FAUCET_URL}
							href={env.FAUCET_URL}
							onPress={() => setIsMenuOpen(false)}
							description="Get testnet gas to explore The Arena"
							startContent={<BsCurrencyBitcoin />}
							target="_blank"
						>
							Faucet
						</DropdownItem>
						<DropdownItem
							key="docs"
							href={env.DOCS_URL}
							onPress={() => setIsMenuOpen(false)}
							description="Learn more about how the Arena DAO works"
							startContent={<BsBook />}
							target="_blank"
						>
							Docs
						</DropdownItem>
						<DropdownItem
							key="bridge"
							href={env.IBC_FUN}
							onPress={() => setIsMenuOpen(false)}
							description="Transfer funds from other chains into the ecosystem"
							startContent={<BsCurrencyExchange />}
							target="_blank"
						>
							Bridge
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				<Dropdown>
					<NavbarItem>
						<DropdownTrigger>
							<Button
								variant="light"
								className="flex items-center font-semibold text-primary text-xl"
								endContent={<BsChevronDown className="size-3" />}
							>
								Socials
							</Button>
						</DropdownTrigger>
					</NavbarItem>
					<DropdownMenu
						aria-label="Socials Menu"
						itemClasses={{ title: "text-primary font-semibold" }}
					>
						<DropdownItem
							key="twitter"
							description="Stay up to date with our announcements"
							href="https://x.com/ArenaDAO"
							onPress={() => setIsMenuOpen(false)}
							startContent={<BsTwitterX />}
							target="_blank"
						>
							Twitter
						</DropdownItem>
						<DropdownItem
							key="discord"
							description="Connect with the community"
							href="https://discord.arenadao.org/"
							onPress={() => setIsMenuOpen(false)}
							startContent={<BsDiscord />}
							target="_blank"
						>
							Discord
						</DropdownItem>
						<DropdownItem
							key="github"
							href="https://github.com/Arena-DAO"
							description="View or contribute to our codebase"
							onPress={() => setIsMenuOpen(false)}
							startContent={<BsGithub />}
							target="_blank"
						>
							GitHub
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</NavbarMenu>
			<ColorModeSwitch />
			<WalletConnectToggle />
		</Navbar>
	);
}
