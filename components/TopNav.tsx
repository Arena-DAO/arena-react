import {
  Flex,
  FlexProps,
  HStack,
  IconButton,
  Icon,
  Button,
  useColorMode,
  Spacer,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";
import Logo from "./Logo";
import ConnectWallet from "./ConnectWallet";
import { useChain } from "@cosmos-kit/react";
import Profile from "./Profile";

interface TopNavProps extends FlexProps {
  onOpen: () => void;
}
export default function TopNav({ onOpen, ...rest }: TopNavProps) {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      align="center"
      justify="space-between"
      w="full"
      px="4"
      bg="white"
      _dark={{
        bg: "gray.800",
      }}
      borderBottomWidth="1px"
      color="inherit"
      h="14"
      {...rest}
    >
      <Spacer display={{ base: "none", md: "inline-flex" }} />
      <IconButton
        display={{
          base: "inline-flex",
          md: "none",
        }}
        onClick={onOpen}
        aria-label="Menu"
        icon={<FiMenu />}
      />
      <Logo display={{ base: "none", sm: "inline-flex", md: "none" }}>
        Logo
      </Logo>
      <HStack spacing={{ base: "0", md: "3" }}>
        <Button
          variant="ghost"
          aria-label="toggle color"
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
