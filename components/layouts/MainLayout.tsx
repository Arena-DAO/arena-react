import {
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  IconButton,
  Image,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React, { PropsWithChildren } from "react";
import { FiChevronLeft, FiMenu, FiMoon, FiSun } from "react-icons/fi";
import WalletConnectToggle from "@components/buttons/WalletConnectToggle";
import { BsDiscord, BsGithub, BsTwitter } from "react-icons/bs";
import Head from "next/head";
import env from "config/env";

type DefaultLinkItemType = {
  text: string;
  disabled?: boolean;
};
interface SimpleLayoutType extends PropsWithChildren {
  logo?: React.ReactNode;
  connectWalletToggle: React.ReactNode;
  navbarH: string;
}

function SocialMediaButtons() {
  return (
    <Flex justifyContent="center" mt="auto !important">
      <IconButton
        as="a"
        href="https://twitter.com/ArenaDAO"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        variant="outline"
        icon={<BsTwitter />}
        colorScheme="primary"
        mx={2}
      />
      <IconButton
        as="a"
        href="https://discord.gg/ECmVAFvuuR"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        variant="outline"
        icon={<BsDiscord />}
        colorScheme="primary"
        mx={2}
      />
      <IconButton
        as="a"
        href="https://github.com/Arena-DAO"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        variant="outline"
        icon={<BsGithub />}
        colorScheme="primary"
        mx={2}
      />
    </Flex>
  );
}

const ColorModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Toggle color mode"
      variant="outline"
      icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
      onClick={toggleColorMode}
    />
  );
};

const MenuButton = ({ text }: DefaultLinkItemType) => {
  return (
    <Button
      title={text}
      display="flex"
      variant="ghost"
      justifyContent="start"
      alignItems="center"
      fontSize="lg"
      fontWeight="medium"
      textAlign="start"
      colorScheme="primary"
      px={2}
      w="full"
      h="full"
      minH={10}
      maxH="fit-content"
      whiteSpace="break-spaces"
    >
      <Text>{text}</Text>
    </Button>
  );
};

const MobileMenu = ({
  logo,
  children,
  connectWalletToggle,
  navbarH,
}: SimpleLayoutType) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      {/* navbar */}
      <Flex
        justify="space-between"
        position="fixed"
        align="center"
        top={0}
        left={0}
        right={0}
        h={navbarH}
        py={2.5}
        px={4}
        zIndex="sticky"
        boxShadow={useColorModeValue(
          "0 2px 2px -1px #d8d8d8",
          "0 2px 2px -1px #181818, 0 3px 5px -4px #0b0b0b"
        )}
      >
        <IconButton
          aria-label="menu"
          variant="outline"
          icon={<FiMenu opacity={0.8} />}
          _focus={{ outline: "none" }}
          onClick={onOpen}
        />
        {logo}
        {connectWalletToggle}
      </Flex>
      {/* drawer */}
      <Drawer
        placement="left"
        isFullHeight={true}
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent maxW={"xs"}>
          <Grid
            templateRows="auto 1fr auto"
            position="absolute"
            top={0}
            right={0}
            left={0}
            bottom={0}
          >
            <Flex justify="end" p={4}>
              <IconButton
                aria-label="close"
                icon={<FiChevronLeft opacity={0.7} />}
                variant="outline"
                fontSize="xl"
                borderRadius="lg"
                _focus={{ outline: "none" }}
                onClick={onClose}
              />
            </Flex>
            <Box position="relative">
              <Stack
                position="absolute"
                top={0}
                bottom={0}
                left={0}
                right={0}
                pl={4}
                pr={2}
                overflowY="scroll"
                css={{
                  // For Firefox
                  scrollbarWidth: "thin",
                  // For Chrome and other browsers except Firefox
                  "&::-webkit-scrollbar": {
                    width: "10px",
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: useColorModeValue(
                      "rgba(0,0,0,0.1)",
                      "rgba(255,255,255,0.1)"
                    ),
                    borderRadius: "6px",
                    border: "3px solid",
                    borderColor: useColorModeValue("#fff", "#2D3748"),
                  },
                }}
              >
                <MenuItems />
                <ColorModeSwitch />
                <SocialMediaButtons />
              </Stack>
            </Box>
          </Grid>
        </DrawerContent>
      </Drawer>
      {/* content */}
      <Box
        position="fixed"
        top="3.75rem"
        bottom={0}
        left={0}
        right={0}
        overflowY="scroll"
        css={{
          // For Firefox
          scrollbarWidth: "thin",
          // For Chrome and other browsers except Firefox
          "&::-webkit-scrollbar": {
            width: "10px",
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: useColorModeValue(
              "rgba(0,0,0,0.1)",
              "rgba(255,255,255,0.1)"
            ),
            borderRadius: "6px",
            border: "3px solid",
            borderColor: useColorModeValue("#fff", "#1A202C"),
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

const DesktopMenu = ({
  logo,
  children,
  connectWalletToggle,
  navbarH,
}: SimpleLayoutType) => {
  return (
    <Flex>
      {/* sidebar */}
      <Stack
        spacing={4}
        position="fixed"
        top={0}
        bottom={0}
        left={0}
        minW={52}
        w="full"
        maxW={60}
        boxShadow={useColorModeValue(
          "4px 0 6px -3px #d8d8d8",
          "4px 0 6px -3px #181818, 4px 0 10px -5px #0b0b0b"
        )}
      >
        {logo && (
          <Flex justify="center" align="center" p={4} pb={0}>
            {logo}
          </Flex>
        )}
        <Stack
          flex={1}
          pl={4}
          pr={1.5}
          py={2}
          overflowY="scroll"
          css={{
            // For Firefox
            scrollbarWidth: "thin",
            // For Chrome and other browsers except Firefox
            "&::-webkit-scrollbar": {
              width: "10px",
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: useColorModeValue(
                "rgba(0,0,0,0.1)",
                "rgba(255,255,255,0.1)"
              ),
              borderRadius: "6px",
              border: "3px solid",
              borderColor: useColorModeValue("#fff", "#1A202C"),
            },
          }}
        >
          <MenuItems />
          <ColorModeSwitch />
          <SocialMediaButtons />
        </Stack>
      </Stack>
      {/* navbar */}
      <Flex
        justify="space-between"
        position="fixed"
        align="center"
        top={0}
        left={60}
        right={0}
        h={navbarH}
        py={2.5}
        px={4}
        zIndex="sticky"
        boxShadow={useColorModeValue(
          "2px 2px 2px -1px #d8d8d8",
          "2px 2px 2px -1px #181818, 2px 3px 5px -4px #0b0b0b"
        )}
      >
        <Box />
        {connectWalletToggle}
      </Flex>
      {/* content */}
      <Box
        position="fixed"
        top={20}
        left={60}
        bottom={0}
        right={0}
        overflowY="scroll"
        css={{
          // For Firefox
          scrollbarWidth: "thin",
          // For Chrome and other browsers except Firefox
          "&::-webkit-scrollbar": {
            width: "10px",
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: useColorModeValue(
              "rgba(0,0,0,0.1)",
              "rgba(255,255,255,0.1)"
            ),
            borderRadius: "6px",
            border: "3px solid",
            borderColor: useColorModeValue("#fff", "#1A202C"),
          },
        }}
      >
        <Box p={4}>{children}</Box>
      </Box>
    </Flex>
  );
};

function MenuItems() {
  const linkItems = [
    {
      label: "🏠 Home",
      href: "/",
    },
    {
      label: "🔥 Featured",
      href: "/featured",
    },
    {
      label: "⚡ Enable DAO",
      href: "/dao/enable",
    },
    {
      label: "⚔️ Create Wager",
      href: "/wager/create",
    },
    {
      label: "☯️ Create Team",
      href: env.DAO_DAO_URL + "/dao/create",
      target: "_blank",
    },
    {
      label: "🗳️ Participate",
      href: env.DAO_DAO_URL + "/dao/" + env.ARENA_DAO_ADDRESS + "#proposals",
      target: "_blank",
    },
    {
      label: "🚀 Buy",
      href: env.OSMOSIS_URL,
      target: "_blank",
      env: "production",
    },
    {
      label: "💧 Faucet",
      href: "/faucet",
      env: "development",
    },
  ];
  return (
    <>
      {linkItems
        ?.filter(({ env }) => !env || env === process.env.NODE_ENV)
        .map(({ label, href, target }, i) => {
          return (
            <Link
              key={i}
              as={NextLink}
              href={href}
              _hover={{ textDecoration: "none" }}
              _focus={{ outline: "none" }}
              target={target}
            >
              <MenuButton text={label} />
            </Link>
          );
        })}
    </>
  );
}

const SimpleLayout = ({
  children,
  connectWalletToggle,
  navbarH,
}: SimpleLayoutType) => {
  const logo = (
    <Box w={{ base: 10, lg: 20 }} h={{ base: 10, lg: 20 }}>
      <Link
        _focus={{ boxShadow: "none" }}
        target="_blank"
        href={env.DAO_DAO_URL + "/dao/" + env.ARENA_DAO_ADDRESS}
      >
        <Image src="/logo.svg" alt="logo" />
      </Link>
    </Box>
  );

  return (
    <Box w="full" h="full">
      <Box display={{ base: "none", lg: "block" }} w="full" h="full">
        <DesktopMenu
          logo={logo}
          connectWalletToggle={connectWalletToggle}
          navbarH={navbarH}
        >
          {children}
        </DesktopMenu>
      </Box>
      <Box display={{ base: "block", lg: "none" }} w="full" h="full">
        <MobileMenu
          logo={logo}
          connectWalletToggle={connectWalletToggle}
          navbarH={navbarH}
        >
          {children}
        </MobileMenu>
      </Box>
    </Box>
  );
};

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <SimpleLayout connectWalletToggle={<WalletConnectToggle />} navbarH="60px">
      <Head>
        <title>Arena Protocol</title>
      </Head>
      <Box mx="auto" w="full" pb={10}>
        {children}
      </Box>
    </SimpleLayout>
  );
}
