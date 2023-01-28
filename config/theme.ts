import { extendTheme } from "@chakra-ui/react";
import { theme as baseTheme } from "@saas-ui/react";

export default extendTheme(baseTheme, {
  colors: {
    primary: baseTheme.colors.purple,
    secondary: baseTheme.colors.yellow,
  },
  config: {
    useSystemColorMode: true,
    initialColorMode: "system",
  },
  styles: {
    global: {
      "html, body": {
        height: "100%",
      },
    },
  },
});
