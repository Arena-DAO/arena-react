import { HStack, Icon, Button, useColorMode, Flex } from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import ConnectWallet from "./ConnectWallet";
import { useChain } from "@cosmos-kit/react";
import Profile from "./Profile";

export default function TopNav() {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      as="header"
      borderBottomWidth="1px"
      py="2"
      px="4"
      position="sticky"
      top="0"
      minH="4rem"
    >
      <HStack spacing={{ base: "1", md: "3" }} ml="auto">
        <Button
          variant="ghost"
          aria-label="toggle color"
          colorScheme="inherit"
          onClick={toggleColorMode}
        >
          <Icon
            as={colorMode === "light" ? BsFillMoonStarsFill : BsFillSunFill}
          />
        </Button>
        {chain.username ? <Profile /> : <ConnectWallet />}
      </HStack>
    </Flex>
  );
}
