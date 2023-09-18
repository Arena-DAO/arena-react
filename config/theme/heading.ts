import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const main = defineStyle({
  mb: 3,
  fontWeight: "extrabold",
});

export const Heading = defineStyleConfig({
  defaultProps: {
    size: "2xl",
    variant: "main",
  },
  variants: {
    main: main,
  },
});
