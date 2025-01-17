"use client";

import { useModalTheme } from "@cosmos-kit/react";
import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { BsCloudMoonFill, BsSunFill } from "react-icons/bs";

const ColorModeSwitch = () => {
	const { theme, setTheme } = useTheme();
	const { setModalTheme } = useModalTheme();

	return (
		<Switch
			size="lg"
			color="primary"
			aria-label="Color mode switch"
			startContent={<BsSunFill />}
			endContent={<BsCloudMoonFill />}
			defaultSelected={theme === "light"}
			onValueChange={(isSelected) => {
				const theme = isSelected ? "light" : "dark";
				setTheme(theme);
				setModalTheme(theme);
			}}
		/>
	);
};

export default ColorModeSwitch;
