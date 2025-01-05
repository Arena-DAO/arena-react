import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx,mjs}",
		"./src/**/*.{js,ts,jsx,tsx,mdx,mjs}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx,mjs}",
	],
	theme: {
		extend: {},
	},
	darkMode: "class",
	plugins: [
		nextui({
			layout: {
				fontSize: {
					large: "1.6rem",
				},
			},
			themes: {
				dark: {
					extend: "dark",
					colors: {
						danger: {
							DEFAULT: "#C22A28",
						},
						background: {
							50: "#1A1A1A",
							100: "#333333",
							200: "#4D4D4D",
							300: "#666666",
							400: "#808080",
							500: "#999999",
							600: "#B3B3B3",
							700: "#CCCCCC",
							800: "#E6E6E6",
							900: "#F2F2F2",
							foreground: "#FFFFFF",
							DEFAULT: "#1A1A1A",
						},
						primary: {
							50: "#FFB266",
							100: "#FFA64D",
							200: "#FF9933",
							300: "#FF8C1A",
							400: "#FF8000",
							500: "#E67300",
							600: "#CC6600",
							700: "#B35900",
							800: "#994D00",
							900: "#804000",
							foreground: "#FFFFFF",
							DEFAULT: "#FF8000",
						},
					},
				},
				light: {
					extend: "light",
					colors: {
						hover: "#000",
						danger: {
							DEFAULT: "#C22A28",
							foreground: "#000000",
						},
						background: {
							50: "#F9F9F9",
							100: "#F2F2F2",
							200: "#E6E6E6",
							300: "#D9D9D9",
							400: "#CCCCCC",
							500: "#BFBFBF",
							600: "#B3B3B3",
							700: "#A6A6A6",
							800: "#999999",
							900: "#8C8C8C",
							foreground: "#000000",
							DEFAULT: "#FFFFFF",
						},
						primary: {
							50: "#FFF5EB",
							100: "#FFE6CC",
							200: "#FFD9B3",
							300: "#FFCC99",
							400: "#FFBF80",
							500: "#FFB266",
							600: "#FFA64D",
							700: "#FF9933",
							800: "#FF8C1A",
							900: "#FF8000",
							foreground: "#FFFFFF",
							DEFAULT: "#FF8000",
						},
					},
				},
			},
		}),
	],
};
