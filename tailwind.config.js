import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const sharedColors = {
	primary: {
		50: "#FFF3E5",
		100: "#FFE0C2",
		200: "#FFD1A0",
		300: "#FFC27D",
		400: "#FFB35A",
		500: "#FF9E33",
		600: "#FF8C1A",
		700: "#FF7A00",
		800: "#E66D00",
		900: "#CC6000",
		DEFAULT: "#FF9E33",
		foreground: "#000000",
	},
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
	warning: {
		50: "#FFF7E5",
		100: "#FFEEC2",
		200: "#FFE699",
		300: "#FFDD70",
		400: "#FFD447",
		500: "#FFCC1F",
		600: "#E6B800",
		700: "#CCA300",
		800: "#B38F00",
		900: "#997A00",
		DEFAULT: "#FFCC1F",
		foreground: "#000000",
	},
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
};

export default {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				glow: "glow 2s ease-in-out infinite alternate",
				float: "float 6s ease-in-out infinite",
				shine: "shine 2.5s linear infinite",
			},
			keyframes: {
				glow: {
					"0%": { boxShadow: "0 0 5px rgba(255, 158, 51, 0.3)" },
					"100%": { boxShadow: "0 0 20px rgba(255, 158, 51, 0.6)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
				shine: {
					"0%": { backgroundPosition: "200% 0" },
					"100%": { backgroundPosition: "-200% 0" },
				},
			},
			backdropFilter: {
				none: "none",
				blur: "blur(20px)",
			},
			backgroundImage: {
				"grid-pattern":
					"linear-gradient(to right, rgba(255, 158, 51, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 158, 51, 0.05) 1px, transparent 1px)",
				"dot-pattern":
					"radial-gradient(rgba(255, 158, 51, 0.1) 1px, transparent 1px)",
				"gradient-shine":
					"linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
			},
			backgroundSize: {
				grid: "20px 20px",
				dot: "20px 20px",
				shine: "200% 100%",
			},
		},
	},
	darkMode: "class",
	plugins: [
		heroui({
			layout: {
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
						background: "#F9F9FB",
						foreground: "#000000",
						content1: { DEFAULT: "#FFFFFF", foreground: "#000000" },
						content2: { DEFAULT: "#F2F2F5", foreground: "#000000" },
						content3: { DEFAULT: "#E8E8EC", foreground: "#000000" },
						content4: { DEFAULT: "#DEDEE6", foreground: "#000000" },
						...sharedColors,
						focus: "#FF9E33",
						divider: "rgba(255, 158, 51, 0.2)",
					},
					components: {
						button: {
							shadow: "0 4px 14px 0 rgba(255, 158, 51, 0.2)",
							textTransform: "none",
						},
						card: {
							shadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
							borderWeight: "light",
						},
						chip: {
							shadow: "0 2px 8px rgba(255, 158, 51, 0.15)",
						},
						tooltip: {
							shadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
						},
						progress: {
							trackColor: "rgba(255, 158, 51, 0.1)",
						},
					},
				},
				dark: {
					colors: {
						background: "#0D0D0F",
						foreground: "#FFFFFF",
						content1: { DEFAULT: "#1A1A1D", foreground: "#FFFFFF" },
						content2: { DEFAULT: "#2A2A2E", foreground: "#FFFFFF" },
						content3: { DEFAULT: "#3A3A3F", foreground: "#FFFFFF" },
						content4: { DEFAULT: "#4A4A51", foreground: "#FFFFFF" },
						...sharedColors,
						focus: "#FF9E33",
						divider: "rgba(255, 158, 51, 0.15)",
					},
					components: {
						button: {
							shadow: "0 4px 14px 0 rgba(255, 158, 51, 0.3)",
							textTransform: "none",
						},
						card: {
							shadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
							borderWeight: "light",
						},
						chip: {
							shadow: "0 2px 8px rgba(255, 158, 51, 0.25)",
						},
						tooltip: {
							shadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
						},
						progress: {
							trackColor: "rgba(255, 158, 51, 0.15)",
						},
					},
				},
			},
			components: {
				button: {
					defaultProps: {
						disableRipple: false,
						radius: "medium",
						size: "md",
					},
					variants: {
						gaming: {
							background:
								"linear-gradient(135deg, var(--primary-500), var(--primary-600))",
							color: "#000000",
							border: "none",
							shadow: "0 4px 12px rgba(255, 158, 51, 0.3)",
							transform: "translateY(0)",
							transition: "transform 0.2s, shadow 0.2s",
							_hover: {
								transform: "translateY(-2px)",
								shadow: "0 6px 16px rgba(255, 158, 51, 0.4)",
							},
							_active: {
								transform: "translateY(1px)",
								shadow: "0 2px 8px rgba(255, 158, 51, 0.3)",
							},
						},
					},
				},
				card: {
					defaultProps: {
						shadow: "md",
						radius: "large",
					},
				},
				tooltip: {
					defaultProps: {
						delay: 300,
						closeDelay: 100,
						motionProps: {
							transition: { duration: 0.2 },
						},
					},
				},
			},
		}),
	],
};
