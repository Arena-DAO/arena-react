"use client";

import {
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
} from "@headlessui/react";
import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarMenu,
	NavbarMenuToggle,
	Link,
} from "@nextui-org/react";
import clsx from "clsx";
import dynamic from "next/dynamic";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { useEnv } from "~/hooks/useEnv";
import WalletConnectToggle from "./WalletConnectToggle";

export default function AppNavbar() {
	const { data: env } = useEnv();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

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
					<Link
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
					</Link>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent className="hidden gap-4 md:flex" justify="center">
				<Link
					className="flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white"
					href="/compete"
				>
					Compete
				</Link>
				<Popover className="z-50">
					{({ open }) => (
						<>
							<PopoverButton className="z-50 flex items-center gap-2 font-semibold text-sm/6 data-[active]:text-[#FF8000] data-[hover]:text-[#FF8000] hover:text-[#FF8000] focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white">
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
									className="z-50 mt-5 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
											isExternal
										>
											<p className="font-semibold">DAO</p>
											<p className="opacity-75">
												View the Arena DAO on DAO DAO
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/dao/jailhouse"
										>
											<p className="font-semibold">Jailhouse</p>
											<p className="opacity-75">
												View jailed competitions needing action through the DAO
											</p>
										</Link>
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
									className="z-50 mt-5 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										{env.FAUCET_URL && (
											<Link
												className="block rounded-lg px-3 py-2 transition hover:bg-primary"
												href={env.FAUCET_URL}
												isExternal
											>
												<p className="font-semibold">Faucet</p>
												<p className="opacity-75">
													Get testnet gas to explore The Arena
												</p>
											</Link>
										)}
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={env.DOCS_URL}
											isExternal
										>
											<p className="font-semibold">Docs</p>
											<p className="opacity-75">
												Learn more about how the Arena DAO works
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={env.IBC_FUN}
											isExternal
										>
											<p className="font-semibold">Bridge</p>
											<p className="opacity-75">
												Transfer funds from other chains into the ecosystem
											</p>
										</Link>
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
									className="z-50 mt-5 divide-y divide-white/5 rounded-xl bg-background/70 text-sm/6 backdrop-blur-lg backdrop-saturate-150 [--anchor-gap:var(--spacing-5)]"
								>
									<div className="p-3">
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://x.com/ArenaDAO"
											isExternal
										>
											<p className="font-semibold">Twitter</p>
											<p className="opacity-75">
												Stay up to date with our announcements
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://discord.arenadao.org/"
											isExternal
										>
											<p className="font-semibold">Discord</p>
											<p className="opacity-75">Connect with the community</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://github.com/Arena-DAO"
											isExternal
										>
											<p className="font-semibold">GitHub</p>
											<p className="opacity-75">
												View or contribute to our codebase
											</p>
										</Link>
									</div>
								</PopoverPanel>
							</Transition>
						</>
					)}
				</Popover>
			</NavbarContent>

			<NavbarMenu>
				<Link
					className="flex items-center gap-2 font-semibold text-xl data-[active]:text-primary data-[hover]:text-primary hover:text-primary focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white"
					href="/compete"
				>
					Compete
				</Link>
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
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
											isExternal
										>
											<p className="font-semibold">DAO</p>
											<p className="opacity-75">
												View the Arena DAO on DAO DAO
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="/dao/jailhouse"
										>
											<p className="font-semibold">Jailhouse</p>
											<p className="opacity-75">
												View jailed competitions needing action through the DAO
											</p>
										</Link>
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
										{env.FAUCET_URL && (
											<Link
												className="block rounded-lg px-3 py-2 transition hover:bg-primary"
												href={env.FAUCET_URL}
												isExternal
											>
												<p className="font-semibold">Faucet</p>
												<p className="opacity-75">
													Get testnet gas to explore The Arena
												</p>
											</Link>
										)}
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={env.DOCS_URL}
											isExternal
										>
											<p className="font-semibold">Docs</p>
											<p className="opacity-75">
												Learn more about how the Arena DAO works
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href={env.IBC_FUN}
											isExternal
										>
											<p className="font-semibold">Bridge</p>
											<p className="opacity-75">
												Transfer funds from other chains into the ecosystem
											</p>
										</Link>
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
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://x.com/ArenaDAO"
											isExternal
										>
											<p className="font-semibold">Twitter</p>
											<p className="opacity-75">
												Stay up to date with our announcements
											</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://discord.arenadao.org/"
											isExternal
										>
											<p className="font-semibold">Discord</p>
											<p className="opacity-75">Connect with the community</p>
										</Link>
										<Link
											className="block rounded-lg px-3 py-2 transition hover:bg-primary"
											href="https://github.com/Arena-DAO"
											isExternal
										>
											<p className="font-semibold">GitHub</p>
											<p className="opacity-75">
												View or contribute to our codebase
											</p>
										</Link>
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
