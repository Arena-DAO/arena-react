import { Link } from "@chakra-ui/layout";
import { Button, ButtonProps, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { ReactNode } from "react";
import env from "~/config/env";
import { LinkItem } from "~/config/links";

const MENU_BUTTON_STYLE: ButtonProps = {
	variant: "ghost",
	justifyContent: "start",
	alignItems: "center",
	fontSize: "lg",
	fontWeight: "medium",
	textAlign: "start",
	colorScheme: "primary",
	px: 2,
	mb: 0,
	w: "full",
	minH: 10,
	whiteSpace: "break-spaces",
};

interface NavMenuProps {
	menuItems: LinkItem[];
}

export default function NavMenu({ menuItems }: NavMenuProps): ReactNode {
	return (
		<>
			{menuItems
				?.filter(({ env: e }) => !e || e === env.ENV)
				.map(({ label, href, target }, i) => {
					return (
						<Link
							key={i}
							as={NextLink}
							href={href}
							_hover={{ textDecoration: "none" }}
							_focus={{ outline: "none" }}
							target={target}
							className="w-100"
						>
							<Button title={label} display="flex" {...MENU_BUTTON_STYLE}>
								<Text>{label}</Text>
							</Button>
						</Link>
					);
				})}
		</>
	);
}
