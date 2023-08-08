import React, { MouseEventHandler, ReactNode, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Image,
  Link,
  MenuItem,
  Avatar,
  Button,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { useChain } from "@cosmos-kit/react";
import { BsPerson, BsWallet } from "react-icons/bs";
import { useProfileData } from "~/hooks/useProfileData";
import env from "@config/env";

type IconTypeProps = string | IconType | JSX.Element | ReactNode | any;
type ConnectWalletType = {
  isLoading?: boolean;
  icon: IconTypeProps;
  onClickConnectBtn?: MouseEventHandler<HTMLButtonElement>;
};
interface ProfileProps {
  address: string;
  openView: () => void;
}

function Profile({ address, openView }: ProfileProps) {
  const { data, isLoading } = useProfileData(address);

  return (
    <Menu>
      <MenuButton as={IconButton} isLoading={isLoading} variant="link">
        <Avatar
          src={data?.nft?.imageUrl}
          aria-label="Profile"
          icon={<BsPerson />}
        />
      </MenuButton>
      <MenuList>
        <Link href={env.DAO_DAO_URL + "/me"} isExternal>
          <MenuItem>
            {data && (data.nft || data.name)
              ? "View Profile"
              : "Create Profile"}
          </MenuItem>
        </Link>
        <MenuItem onClick={openView}>Manage Wallet</MenuItem>
      </MenuList>
    </Menu>
  );
}

const ConnectWalletButton = ({
  icon,
  isLoading,
  onClickConnectBtn,
}: ConnectWalletType) => {
  return (
    <IconButton
      icon={icon}
      aria-label="Connect Wallet"
      isLoading={isLoading}
      colorScheme="primary"
      variant={"outline"}
      onClick={onClickConnectBtn}
    ></IconButton>
  );
};

export default function WalletConnectToggle() {
  const chainContext = useChain(env.CHAIN);

  if (chainContext.isWalletConnected) {
    return (
      <Profile
        openView={chainContext.openView}
        address={chainContext.address!}
      />
    );
  }
  return (
    <ConnectWalletButton
      icon={<BsWallet />}
      onClickConnectBtn={chainContext.openView}
      isLoading={chainContext.isWalletConnecting}
    />
  );
}
