"use client";

import { Button, ButtonGroup, Link } from "@nextui-org/react";
import dynamic from "next/dynamic";
import { BsDiscord, BsGithub, BsTwitterX } from "react-icons/bs";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});

export default function Footer() {
	return (
		<>
			{/*<div className="pt-5 pb-5 px-10 flex flex-col justify-center items-center md:flex-row" style={{justifyContent:"space-between", height:"max-content"}}>
				<div>
					<Link href="/">
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="logo"
							width="80"
							height="80"
							removeWrapper
						/>
					</Link>
				</div>
				<div className="flex flex-col pt-5 gap-5 items-center justify-center sm:flex-row sm:pt-0">
					<a style={{fontSize:"120%"}} className="hover:color-[#FF8000]" href="/dao/dao">DAO</a>
					<a style={{fontSize:"120%"}} className="hover:color-[#FF8000]" href="/dao/jailhouse">Jailhouse</a>
					<a style={{fontSize:"120%"}} className="hover:color-[#FF8000]" href="https://discord.com/channels/986573321023942708/1041694375702446170" target="_blank">Faucet</a>
					<a style={{fontSize:"120%"}} className="hover:color-[#FF8000]" href="/resources/docs">Docs</a>
					<a style={{fontSize:"120%"}} className="hover:color-[#FF8000]" href="/resources/bridge">Bridge</a>
				</div>
			</div>*/}
			<div className="flex flex-col-reverse items-center justify-between px-10 pb-5 md:flex-row">
				<div className="w-full text-center md:w-1/2 md:text-left">
					"Just look at the gladiators, either debased men or foreigners, and
					consider the blows they endure!" - Cicero
				</div>
				<div>
					<ButtonGroup variant="light">
						<Button
							as={Link}
							isIconOnly
							aria-label="Twitter"
							href="https://x.com/ArenaDAO"
							isExternal
						>
							<BsTwitterX />
						</Button>
						<Button
							as={Link}
							isIconOnly
							aria-label="Discord"
							href="https://discord.arenadao.org"
							isExternal
						>
							<BsDiscord />
						</Button>
						<Button
							as={Link}
							isIconOnly
							aria-label="GitHub"
							href="https://github.com/Arena-DAO"
							isExternal
						>
							<BsGithub />
						</Button>
					</ButtonGroup>
				</div>
			</div>
			<div className="border-white border-t-1 py-5 text-center">
				Copyright © 2024 Arena DAO, All rights reserved
			</div>
		</>
	);
}
