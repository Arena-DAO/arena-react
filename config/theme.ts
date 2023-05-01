import {
  extendTheme,
  withDefaultColorScheme,
  theme as baseTheme,
  StyleFunctionProps,
} from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

export default extendTheme(
  withDefaultColorScheme({ colorScheme: "primary" }),
  {
    colors: {
      primary: baseTheme.colors.orange,
      secondary: baseTheme.colors.yellow,
    },
    config: {
      useSystemColorMode: true,
      initialColorMode: "system",
    },
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          bg: mode("white", "gray.800")(props),
        },
      }),
    },
  },
  baseTheme
);
