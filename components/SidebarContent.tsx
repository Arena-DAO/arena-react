import {
  Box,
  HStack,
  IconButton,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsDiscord, BsGithub, BsTwitter } from "react-icons/bs";
import Logo from "./Logo";
import { Sidebar, SidebarSection, SidebarToggleButton } from "@saas-ui/sidebar";
import NavMenu from "./NavMenu";

export default function SidebarContent() {
  return (
    <Sidebar>
      <SidebarToggleButton />
      <SidebarSection alignItems="center">
        <Logo />
      </SidebarSection>
      <NavMenu />
      <Box position="absolute" bottom="0" w="full">
        <HStack justifyContent="center">
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
    </Sidebar>
  );
}
