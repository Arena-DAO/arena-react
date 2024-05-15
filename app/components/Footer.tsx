"use client";

import {
	Button,
	ButtonGroup,
	Link,
	Navbar,
	NavbarContent,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import { BsDiscord, BsGithub, BsTwitterX } from "react-icons/bs";
const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});
import NextImage from "next/image";
import { Image } from "@nextui-org/react";

export default function Footer() {
	return (
		<>
			<div className="pt-20 pb-5 flex flex-row" style={{maxWidth:"1280px", margin:"auto", justifyContent:"space-between", height:"max-content"}}>
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
				<div className="flex flex-col">
					<p className="pb-4" style={{fontSize:"120%"}}>DAO</p>
					<Link className="hover:color-[#FF8000]" style={{fontSize:"100%", color:"white"}} href="/dao/dao">DAO</Link>
					<Link className="hover:color-[#FF8000]" style={{fontSize:"100%", color:"white"}} href="/dao/jailhouse">Jailhouse</Link>
				</div>
				<div className="flex flex-col">
					<p className="pb-4" style={{fontSize:"120%"}}>Resources</p>
					<Link className="hover:color-[#FF8000]" style={{fontSize:"100%", color:"white"}} href="https://discord.com/channels/986573321023942708/1041694375702446170" target="_blank">Faucet</Link>
					<Link className="hover:color-[#FF8000]" style={{fontSize:"100%", color:"white"}} href="/resources/docs">Docs</Link>
					<Link className="hover:color-[#FF8000]" style={{fontSize:"100%", color:"white"}} href="/resources/bridge">Bridge</Link>
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
			<div className="text-center py-5 border-white border-t-1">
				Copyright © 2024 Arena DAO, All rights reserved
			</div>
		</>
	);
}
