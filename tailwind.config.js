import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	darkMode: "class",
	plugins: [
		heroui({
			layout: {
				// Modern gaming-inspired spacing and sizing
				radius: {
					small: "4px",
					medium: "8px",
					large: "16px",
				},
				borderWidth: {
					small: "1px",
					medium: "2px",
					large: "3px",
				},
				fontSize: {
					tiny: "0.75rem",
					small: "0.875rem",
					medium: "1rem",
					large: "1.125rem",
				},
				lineHeight: {
					tiny: "1rem",
					small: "1.25rem",
					medium: "1.5rem",
					large: "1.75rem",
				},
				spacing: {
					small: "0.5rem",
					medium: "1rem",
					large: "2rem",
				},
			},
			themes: {
				light: {
					colors: {
						// Light, clean background with subtle warmth
						background: "#F9F9FB",
						foreground: "#000000",

						// Layered content backgrounds - light theme
						content1: {
							DEFAULT: "#FFFFFF",
							foreground: "#000000",
						},
						content2: {
							DEFAULT: "#F2F2F5",
							foreground: "#000000",
						},
						content3: {
							DEFAULT: "#E8E8EC",
							foreground: "#000000",
						},
						content4: {
							DEFAULT: "#DEDEE6",
							foreground: "#000000",
						},

						// Vibrant orange primary with new gradients
						primary: {
							50: "#FFF3E5",
							100: "#FFE0C2",
							200: "#FFD1A0",
							300: "#FFC27D",
							400: "#FFB35A",
							500: "#FF9E33", // Brighter orange
							600: "#FF8C1A",
							700: "#FF7A00",
							800: "#E66D00",
							900: "#CC6000",
							DEFAULT: "#FF9E33",
							foreground: "#000000",
						},

						// Deep purple secondary for accents
						secondary: {
							50: "#F2E6FF",
							100: "#E0C2FF",
							200: "#CC99FF",
							300: "#B870FF",
							400: "#A347FF",
							500: "#8F1FFF",
							600: "#7A00E6",
							700: "#6600CC",
							800: "#5200B3",
							900: "#3D0099",
							DEFAULT: "#8F1FFF",
							foreground: "#FFFFFF",
						},

						// Success color with gaming flair
						success: {
							50: "#E8FFF3",
							100: "#C2FFE0",
							200: "#99FFCC",
							300: "#70FFB8",
							400: "#47FFA3",
							500: "#1FFF8F",
							600: "#00E67A",
							700: "#00CC66",
							800: "#00B352",
							900: "#00993D",
							DEFAULT: "#1FFF8F",
							foreground: "#000000",
						},

						// Warning with orange tones
						warning: {
							50: "#FFF7E5",
							100: "#FFEBCC",
							200: "#FFDB99",
							300: "#FFCB66",
							400: "#FFBB33",
							500: "#FFAB00",
							600: "#E69900",
							700: "#CC8800",
							800: "#B37700",
							900: "#996600",
							DEFAULT: "#FFAB00",
							foreground: "#000000",
						},

						// Danger with red gaming aesthetic
						danger: {
							50: "#FFE5E5",
							100: "#FFB8B8",
							200: "#FF8C8C",
							300: "#FF5F5F",
							400: "#FF3333",
							500: "#FF0000",
							600: "#E60000",
							700: "#CC0000",
							800: "#B30000",
							900: "#990000",
							DEFAULT: "#FF3333",
							foreground: "#FFFFFF",
						},

						// Focus state with glowing effect
						focus: "#FF9E33",

						// Divider with subtle orange tint
						divider: "rgba(255, 158, 51, 0.2)",

						// Box shadow with light orange tint
						boxShadow: {
							light: "0 0 10px rgba(255, 158, 51, 0.05)",
							medium: "0 0 15px rgba(255, 158, 51, 0.1)",
							dark: "0 0 20px rgba(255, 158, 51, 0.15)",
						},
					},
					// Custom layout properties
					layout: {
						// Subtle glowing border effect for light mode
						boxShadow: "0 0 15px rgba(255, 158, 51, 0.1)",
						// Smooth transitions
						transition: {
							duration: "200ms",
							timing: "cubic-bezier(0.4, 0, 0.2, 1)",
						},
						// Modern opacity levels
						opacity: {
							disabled: "0.5",
							hover: "0.8",
						},
					},
				},
				dark: {
					colors: {
						// Rich, dark background with atmospheric depth
						background: "#0B0D14",
						foreground: "#FFFFFF",

						// Layered content backgrounds with darker tones
						content1: {
							DEFAULT: "#0A0C14",
							foreground: "#FFFFFF",
						},
						content2: {
							DEFAULT: "#10121B",
							foreground: "#FFFFFF",
						},
						content3: {
							DEFAULT: "#161824",
							foreground: "#FFFFFF",
						},
						content4: {
							DEFAULT: "#1C1F2D",
							foreground: "#FFFFFF",
						},

						// Vibrant orange primary with enhanced dark mode glow
						primary: {
							50: "#FFF3E5",
							100: "#FFE0C2",
							200: "#FFD1A0",
							300: "#FFC27D",
							400: "#FFB35A",
							500: "#FF9E33", // Brighter orange
							600: "#FF8C1A",
							700: "#FF7A00",
							800: "#E66D00",
							900: "#CC6000",
							DEFAULT: "#FF9E33",
							foreground: "#000000",
						},

						// Electric magenta secondary for dark accents
						secondary: {
							50: "#FFE5F9",
							100: "#FFC2F0",
							200: "#FF99E6",
							300: "#FF70DC",
							400: "#FF47D3",
							500: "#FF1FC9",
							600: "#E600B3",
							700: "#CC009E",
							800: "#B3008A",
							900: "#990075",
							DEFAULT: "#FF1FC9",
							foreground: "#000000",
						},

						// Success color with cyberpunk green glow
						success: {
							50: "#E5FFF0",
							100: "#C2FFE0",
							200: "#99FFD1",
							300: "#66FFC1",
							400: "#33FFB2",
							500: "#00FFA3",
							600: "#00E693",
							700: "#00CC82",
							800: "#00B372",
							900: "#009961",
							DEFAULT: "#00FFA3",
							foreground: "#000000",
						},

						// Warning with futuristic amber glow
						warning: {
							50: "#FFF9E5",
							100: "#FFF0C2",
							200: "#FFE699",
							300: "#FFDC66",
							400: "#FFD233",
							500: "#FFC800",
							600: "#E6B400",
							700: "#CCA000",
							800: "#B38C00",
							900: "#997800",
							DEFAULT: "#FFC800",
							foreground: "#000000",
						},

						// Danger with intense red gaming aesthetic
						danger: {
							50: "#FFE5E8",
							100: "#FFC2C9",
							200: "#FF99A6",
							300: "#FF7087",
							400: "#FF4768",
							500: "#FF1F49",
							600: "#E6001F",
							700: "#CC001B",
							800: "#B30018",
							900: "#990014",
							DEFAULT: "#FF1F49",
							foreground: "#FFFFFF",
						},

						// Focus state with enhanced orange glow
						focus: "#FF9E33",

						// Divider with subtle orange glow
						divider: "rgba(255, 158, 51, 0.15)",

						// Box shadow with intense orange neon tint
						boxShadow: {
							light: "0 0 10px rgba(255, 158, 51, 0.15)",
							medium: "0 0 20px rgba(255, 158, 51, 0.2)",
							dark: "0 0 30px rgba(255, 158, 51, 0.25)",
						},
					},
					// Custom layout properties
					layout: {
						// Enhanced orange neon glow box shadow
						boxShadow: "0 0 25px rgba(255, 158, 51, 0.25)",
						// Smooth transitions
						transition: {
							duration: "250ms",
							timing: "cubic-bezier(0.2, 0, 0.4, 1)",
						},
						// Modern opacity levels
						opacity: {
							disabled: "0.4",
							hover: "0.9",
						},
					},
				},
			},
		}),
	],
};
