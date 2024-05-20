"use client";

import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
} from "@headlessui/react";
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
import clsx from "clsx";
import dynamic from "next/dynamic";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";
import { useRouter } from "next/navigation";

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
	const router = useRouter();

	return (
		<Navbar
			onMenuOpenChange={setIsMenuOpen}
			isMenuOpen={isMenuOpen}
			className="fixed max-w-[1920px]"
		>
			<NavbarContent>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="md:hidden"
				/>
				<NavbarBrand>
					<a
						className="flex flex-row items-center justify-center"
						href="/"
						onClick={() => setIsMenuOpen(false)}
					>
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="logo"
							width="30"
							height="30"
							removeWrapper
						/>
						<p className="title ml-2 font-bold text-inherit text-primary">
							Arena DAO
						</p>
					</a>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 md:flex" justify="center">
				<a
					className="flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer"
					onClick={()=>{router.push("/compete")}}
				>
					Compete
				</a>
				<Popover className="z-50">
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-[#FF8000] data-[hover]:text-[#FF8000] hover:text-[#FF8000] focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white z-50">
								DAO
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="mt-5 z-50 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											onClick={()=>{router.push("/dao/dao")}}
										>
											<p className="font-semibold">DAO</p>
											<p className="opacity-75">
												View the Arena DAO on DAO DAO
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											onClick={()=>{router.push("/dao/jailhouse")}}
										>
											<p className="font-semibold">Jailhouse</p>
											<p className="opacity-75">
												View jailed competitions needing action through the DAO
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
				<Popover>
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
								Resources
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="mt-5 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)] z-50"
								>
									<div className="p-3">
										{env.ENV === "development" && (
											<a
												className="block rounded-lg px-3 py-2 transition hover:bg-primary"
												href="https://discord.com/channels/986573321023942708/1041694375702446170"
												target="_blank"
												rel="noreferrer"
											>
												<p className="font-semibold">Faucet</p>
												<p className="opacity-75">
													Get testnet gas to explore The Arena
												</p>
											</a>
										)}
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/resources/docs"
										>
											<p className="font-semibold">Docs</p>
											<p className="opacity-75">
												Learn more about how the Arena DAO works
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/resources/bridge"
										>
											<p className="font-semibold">Bridge</p>
											<p className="opacity-75">
												Transfer funds from other chains into the ecosystem
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
				<Popover>
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
								Socials
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="mt-5 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)] z-50"
								>
									<div className="p-3">
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://x.com/ArenaDAO"
										>
											<p className="font-semibold">Twitter</p>
											<p className="opacity-75">
												Keep updated on our twitter posts
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://discord.arenadao.org/"
										>
											<p className="font-semibold">Discord</p>
											<p className="opacity-75">
												Join our group and become a gladiator
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://github.com/Arena-DAO"
										>
											<p className="font-semibold">Github</p>
											<p className="opacity-75">
												Contribute to the DAO as a developer
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
			</NavbarContent>

			<NavbarMenu>
				<a
					className="flex items-center gap-2 font-semibold text-xl data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white"
					href="/compete"
				>
					Compete
				</a>
				<Popover className="z-50">
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-xl data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
								DAO
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="z-50 divide-y divide-white/5 rounded-xl bg-background/70 text-sm backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/dao/dao"
										>
											<p className="font-semibold">DAO</p>
											<p className="opacity-75">
												View the Arena DAO on DAO DAO
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/dao/jailhouse"
										>
											<p className="font-semibold">Jailhouse</p>
											<p className="opacity-75">
												View jailed competitions needing action through the DAO
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
				<Popover>
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-xl data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
								Resources
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="z-50 divide-y divide-white/5 rounded-xl bg-background/70 text-sm backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://discord.com/channels/986573321023942708/1041694375702446170"
											target="_blank"
											rel="noreferrer"
										>
											<p className="font-semibold">Faucet</p>
											<p className="opacity-75">
												Get testnet gas to explore The Arena
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/resources/docs"
										>
											<p className="font-semibold">Docs</p>
											<p className="opacity-75">
												Learn more about how the Arena DAO works
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/resources/bridge"
										>
											<p className="font-semibold">Bridge</p>
											<p className="opacity-75">
												Transfer funds from other chains into the ecosystem
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
				<Popover>
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-2 font-semibold text-xl data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
								Socials
								<BsChevronDown
									className={clsx("size-3", open && "rotate-180")}
								/>
							</PopoverButton>
							<Transition
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-1"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-1"
							>
								<PopoverPanel
									anchor="bottom"
									className="z-50 divide-y divide-white/5 rounded-xl bg-background/70 text-sm backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://x.com/ArenaDAO"
										>
											<p className="font-semibold">Twitter</p>
											<p className="opacity-75">
												Keep updated on our twitter posts
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://discord.arenadao.org/"
										>
											<p className="font-semibold">Discord</p>
											<p className="opacity-75">
												Join our group and become a gladiator
											</p>
										</a>
										<a
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://github.com/Arena-DAO"
										>
											<p className="font-semibold">Github</p>
											<p className="opacity-75">
												Contribute to the DAO as a developer
											</p>
										</a>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
			</NavbarMenu>
			<ColorModeSwitch />
			<WalletConnectToggle />
		</Navbar>
	);
}
