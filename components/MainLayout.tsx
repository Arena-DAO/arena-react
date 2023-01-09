import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import SidebarContent from "./SidebarContent";
import TopNav from "./TopNav";
import Head from "next/head";

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box as="section" minH="100vh">
      <Head>
        <title>Agon Protocol</title>
      </Head>
      <SidebarContent
        display={{
          base: "none",
          md: "unset",
        }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box
        transition=".3s ease"
        ml={{
          base: 0,
          md: 60,
        }}
      >
        <TopNav onOpen={onOpen} />
        <Box as="main" p="4">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
