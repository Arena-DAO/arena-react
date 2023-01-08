import {
  Box,
  Flex,
  FlexProps,
  HStack,
  IconButton,
  Link,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import NavMenu from "./NavMenu";
import { BsDiscord, BsGithub, BsTwitter } from "react-icons/bs";
import Logo from "./Logo";

export default function SidebarContent({ ...rest }: FlexProps) {
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      color="inherit"
      borderRightWidth="1px"
      w="60"
      {...rest}
    >
      <Flex py="5" align="center">
        <Logo mx="auto" />
      </Flex>
      <Flex as="nav" aria-label="Main Navigation">
        <NavMenu />
      </Flex>
      <Box position="absolute" bottom="0" w="full">
        <HStack justifyContent="center" mt="3">
          <Link href="https://twitter.com/AgonProtocol" isExternal>
            <IconButton
              aria-label={"twitter"}
              color={useColorModeValue("primary.500", "primary.400")}
              icon={<BsTwitter />}
              size="lg"
              bgColor={"transparent"}
            ></IconButton>
          </Link>
          <Link href="https://discord.gg/ECmVAFvuuR" isExternal>
            <IconButton
              aria-label={"discord"}
              icon={<BsDiscord />}
              color={useColorModeValue("primary.500", "primary.400")}
              size="lg"
              bgColor="transparent"
            ></IconButton>
          </Link>
          <Link href="https://github.com/Agon-Protocol" isExternal>
            <IconButton
              aria-label={"github"}
              icon={<BsGithub />}
              color={useColorModeValue("primary.500", "primary.400")}
              size="lg"
              bgColor="transparent"
            ></IconButton>
          </Link>
        </HStack>
      </Box>
    </Box>
  );
}
