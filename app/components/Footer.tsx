"use client";

import { Button, ButtonGroup, Link } from "@heroui/react";
import dynamic from "next/dynamic";
import { BsDiscord, BsGithub, BsTwitterX, BsYinYang } from "react-icons/bs";
import { useEnv } from "~/hooks/useEnv";

const ColorModeSwitch = dynamic(() => import("./ColorModeSwitch"), {
	ssr: false,
});

export default function Footer() {
	const env = useEnv();
	return (
		<footer className="w-full px-6 py-4">
			<div className="flex flex-col gap-2">
				<div className="flex flex-col-reverse items-center justify-between gap-4 md:flex-row">
					<ColorModeSwitch />
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
						<Button
							as={Link}
							isIconOnly
							aria-label="DAO DAO"
							href={`${env.DAO_DAO_URL}/dao/${env.ARENA_DAO_ADDRESS}`}
							isExternal
						>
							<BsYinYang />
						</Button>
					</ButtonGroup>
				</div>
				<div className="text-center text-default-400 text-xs">
					Copyright © {new Date().getFullYear()} Arena DAO, All rights reserved
				</div>
			</div>
		</footer>
	);
}
