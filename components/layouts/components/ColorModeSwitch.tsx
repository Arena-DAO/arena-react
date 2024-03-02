import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ColorModeSwitch() {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<IconButton
			aria-label="Toggle color mode"
			variant="outline"
			icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
			onClick={toggleColorMode}
			mt="2"
		/>
	);
}
