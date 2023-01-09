import { baseTheme, extendTheme } from "@chakra-ui/react";

export default extendTheme(
  baseTheme,
  {
    colors: {
      primary: baseTheme.colors.purple,
      secondary: baseTheme.colors.yellow,
    },
  },
  {
    config: {
      useSystemColorMode: true,
      initialColorMode: "system",
    },
  }
);
