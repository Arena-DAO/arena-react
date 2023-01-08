import { useColorModeValue, Text, TextProps } from "@chakra-ui/react";

export default function Logo({ ...props }: TextProps) {
  return (
    <Text
      className="holographic"
      fontSize="2xl"
      fontWeight="bold"
      color={useColorModeValue("black", "white")}
      {...props}
    >
      Agon Protocol
    </Text>
  );
}
