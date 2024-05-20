"use client";

import { Button, ButtonGroup, Link } from "@nextui-org/react";
import { BsDiscord, BsGithub, BsTwitterX } from "react-icons/bs";

export default function Footer() {
	return (
		<>
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
