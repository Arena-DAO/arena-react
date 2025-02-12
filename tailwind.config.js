const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx,mjs}",
		"./src/**/*.{js,ts,jsx,tsx,mdx,mjs}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx,mjs}",
	],
	theme: {
		extend: {
			fontFamily: {
				cinzel: ["cinzel", "serif"],
				sans: ["Inter var", "sans-serif"],
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-in",
				"slide-up": "slideUp 0.6s ease-out",
				"slide-down": "slideDown 0.6s ease-out",
				"pulse-subtle": "pulse 3s infinite",
				float: "float 6s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				slideDown: {
					"0%": { transform: "translateY(-20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
			},
			borderRadius: {
				xl: "1rem",
				"2xl": "1.5rem",
				"3xl": "2rem",
			},
			boxShadow: {
				glow: "0 0 15px rgba(255, 128, 0, 0.5)",
				"glow-lg": "0 0 30px rgba(255, 128, 0, 0.6)",
				"inner-glow": "inset 0 0 15px rgba(255, 128, 0, 0.3)",
			},
			backdropBlur: {
				xs: "2px",
			},
		},
	},
	darkMode: "class",
	plugins: [
		heroui({
			layout: {
				fontSize: {
					large: "1.6rem",
				},
				borderRadius: {
					large: "1rem",
					medium: "0.75rem",
					small: "0.5rem",
				},
			},
			themes: {
				dark: {
					extend: "dark",
					colors: {
						danger: {
							DEFAULT: "#C22A28",
							foreground: "#FFFFFF",
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
						success: {
							DEFAULT: "#2ECC71",
							foreground: "#FFFFFF",
						},
						warning: {
							DEFAULT: "#F1C40F",
							foreground: "#000000",
						},
						info: {
							DEFAULT: "#3498DB",
							foreground: "#FFFFFF",
						},
					},
				},
				light: {
					extend: "light",
					colors: {
						hover: "#000",
						danger: {
							DEFAULT: "#C22A28",
							foreground: "#FFFFFF",
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
							foreground: "#000000",
							DEFAULT: "#FF8000",
						},
						success: {
							DEFAULT: "#27AE60",
							foreground: "#FFFFFF",
						},
						warning: {
							DEFAULT: "#F39C12",
							foreground: "#000000",
						},
						info: {
							DEFAULT: "#2980B9",
							foreground: "#FFFFFF",
						},
					},
				},
			},
		}),
		({ addUtilities }) => {
			const newUtilities = {
				".text-glow": {
					"text-shadow": "0 0 8px rgba(255, 128, 0, 0.6)",
				},
				".text-glow-lg": {
					"text-shadow": "0 0 12px rgba(255, 128, 0, 0.8)",
				},
				".border-glow": {
					"box-shadow": "0 0 8px rgba(255, 128, 0, 0.4)",
				},
				".glassmorphism": {
					background: "rgba(255, 255, 255, 0.1)",
					"backdrop-filter": "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
				},
				".card-hover": {
					transition: "all 0.3s ease",
					"&:hover": {
						transform: "translateY(-4px)",
						"box-shadow": "0 12px 20px rgba(0, 0, 0, 0.1)",
					},
				},
			};
			addUtilities(newUtilities, ["hover", "responsive"]);
		},
	],
};
