import {
  extendTheme,
  withDefaultColorScheme,
  theme as baseTheme,
  StyleFunctionProps,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { Heading } from "./heading";

const theme = extendTheme(
  withDefaultColorScheme({ colorScheme: "primary" }),
  {
    colors: {
      primary: {
        50: "#FFF5E6",
        100: "#FFD9B5",
        200: "#FFBD83",
        300: "#FFA052",
        400: "#FF8330",
        500: "#FF6600",
        600: "#CC5200",
        700: "#993D00",
        800: "#662900",
        900: "#331400",
      },
      secondary: {
        50: "#FFF8E1",
        100: "#FFEDB5",
        200: "#FFDC80",
        300: "#FFCB4B",
        400: "#FFB91F",
        500: "#FFA500",
        600: "#CC8400",
        700: "#995F00",
        800: "#663B00",
        900: "#331D00",
      },
    },
    config: {
      useSystemColorMode: true,
      initialColorMode: "system",
    },
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          bg: mode("#FDF5E6", "#2A3439")(props),
          color: mode("#333333", "#F8F8FF")(props),
        },
        a: {
          color: mode("#FF6600", "#FFD9B5")(props),
          _hover: {
            color: mode("#FF8330", "#FFA052")(props),
          },
          _focus: {
            boxShadow: "outline",
          },
        },
      }),
    },
    components: { Heading },
  },
  baseTheme
);

export default theme;
