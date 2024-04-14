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

export default function Footer() {
	return (
		<Navbar as="footer" className="fixed top-auto bottom-0 left-0">
			<NavbarContent>
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
						href="https://discord.gg/ECmVAFvuuR"
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
			</NavbarContent>
			<NavbarContent as="div" justify="end">
				<ColorModeSwitch />
			</NavbarContent>
		</Navbar>
	);
}
