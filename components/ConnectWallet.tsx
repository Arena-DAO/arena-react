import React, { MouseEventHandler, ReactNode } from "react";
import { Button, Icon, Text, Center, useColorMode } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { RiWallet3Fill } from "react-icons/ri";
import { useChain } from "@cosmos-kit/react";

type IconTypeProps = string | IconType | JSX.Element | ReactNode | any;
type ConnectWalletType = {
  buttonText?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: IconTypeProps;
  rightIcon?: IconTypeProps;
  onClickConnectBtn?: MouseEventHandler<HTMLButtonElement>;
};

function handleChangeColorModeValue(
  colorMode: string,
  light: string,
  dark: string
) {
  if (colorMode === "light") return light;
  if (colorMode === "dark") return dark;
}

const ConnectWalletButton = ({
  buttonText,
  isLoading,
  isDisabled,
  leftIcon,
  rightIcon,
  onClickConnectBtn,
}: ConnectWalletType) => {
  const { colorMode } = useColorMode();

  return (
    <Button
      p={2.5}
      w="full"
      h="auto"
      minH={12}
      whiteSpace="break-spaces"
      display="flex"
      alignItems="center"
      fontSize="lg"
      isLoading={isLoading}
      isDisabled={isDisabled}
      bg={handleChangeColorModeValue(colorMode, "primary.500", "primary.400")}
      color="white"
      _hover={{
        bg: handleChangeColorModeValue(colorMode, "primary.400", "primary.500"),
      }}
      _active={{
        bg: "primary.50",
        color: handleChangeColorModeValue(
          colorMode,
          "primary.500",
          "primary.400"
        ),
        boxShadow: "none",
      }}
      _focus={{ boxShadow: "0 0 0 2px #929CE4" }}
      _loading={{
        h: 12,
        opacity: 0.8,
        bg: handleChangeColorModeValue(colorMode, "primary.500", "primary.400"),
        color: "white",
        cursor: "progress",
        _hover: {
          bg: handleChangeColorModeValue(
            colorMode,
            "primary.500",
            "primary.400"
          ),
          color: "white",
          boxShadow: "none",
        },
        _active: {
          bg: handleChangeColorModeValue(
            colorMode,
            "primary.500",
            "primary.400"
          ),
          color: "white",
          boxShadow: "none",
        },
        _focus: {
          bg: handleChangeColorModeValue(
            colorMode,
            "primary.500",
            "primary.400"
          ),
          color: "white",
          boxShadow: "none",
        },
      }}
      _disabled={{
        opacity: 0.8,
        bg: handleChangeColorModeValue(colorMode, "gray.50", "gray.700"),
        color: handleChangeColorModeValue(colorMode, "gray.400", "gray.500"),
        cursor: "not-allowed",
        _hover: {
          bg: handleChangeColorModeValue(colorMode, "gray.50", "gray.700"),
          color: handleChangeColorModeValue(colorMode, "gray.400", "gray.500"),
          boxShadow: "none",
        },
        _active: {
          bg: handleChangeColorModeValue(colorMode, "gray.50", "gray.700"),
          color: handleChangeColorModeValue(colorMode, "gray.400", "gray.500"),
          boxShadow: "none",
        },
        _focus: {
          bg: handleChangeColorModeValue(colorMode, "gray.50", "gray.700"),
          color: handleChangeColorModeValue(colorMode, "gray.400", "gray.500"),
          boxShadow: "none",
        },
      }}
      onClick={onClickConnectBtn}
    >
      {leftIcon ? (
        <Center mr={1.5}>{leftIcon}</Center>
      ) : (
        <Center mr={1.5}>
          <Icon as={RiWallet3Fill} />
        </Center>
      )}
      {buttonText ? <Text>{buttonText}</Text> : <Text>Connect Wallet</Text>}
      {rightIcon && <Center ml={1.5}>{rightIcon}</Center>}
    </Button>
  );
};

export default function () {
  const { openView } = useChain(process.env.NEXT_PUBLIC_CHAIN!);

  return (
    <ConnectWalletButton
      buttonText="Connect Wallet"
      onClickConnectBtn={openView}
    />
  );
}
