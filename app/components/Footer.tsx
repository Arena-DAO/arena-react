"use client";

import {
	Button,
	ButtonGroup,
	Link,
	Navbar,
	NavbarContent,
	Switch,
} from "@nextui-org/react";
import { useTheme } from "next-themes";
import {
	BsCloudMoonFill,
	BsDiscord,
	BsGithub,
	BsSunFill,
	BsTwitterX,
} from "react-icons/bs";

export default function Footer() {
	const { setTheme } = useTheme();

	return (
		<Navbar as="footer">
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
				<Switch
					size="lg"
					color="primary"
					startContent={<BsSunFill />}
					endContent={<BsCloudMoonFill />}
					onValueChange={(isSelected) =>
						setTheme(isSelected ? "light" : "dark")
					}
				/>
			</NavbarContent>
		</Navbar>
	);
}
