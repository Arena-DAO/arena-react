"use client";

import { Button, ButtonGroup, Link } from "@nextui-org/react";
import { BsDiscord, BsGithub, BsTwitterX } from "react-icons/bs";

export default function Footer() {
	return (
		<>
			<div className="flex flex-col-reverse items-center justify-between px-10 md:flex-row">
				<div
					className="w-full text-center text-small md:w-1/2 md:text-left"
					translate="no"
				>
					"Audendo virtus crescit, tardando timor." - Publilius Syrus
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
			<div className="pb-5 text-center text-xs italic">
				Copyright © 2024 Arena DAO, All rights reserved
			</div>
		</>
	);
}
