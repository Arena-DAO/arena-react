import React, { MouseEventHandler, ReactNode, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Image,
  Link,
  MenuItem,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { useChain } from "@cosmos-kit/react";
import { BsPerson, BsWallet } from "react-icons/bs";
import { useProfileData } from "~/hooks/useProfileData";

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
  const { isLoading, data } = useProfileData(address);

  return (
    <Menu>
      {data && data.nft ? (
        <MenuButton>
          <Image
            h="50px"
            srcSet={data.nft.imageUrl}
            borderRadius="full"
            alt="Profile"
          ></Image>
        </MenuButton>
      ) : (
        <MenuButton
          as={IconButton}
          aria-label="Profile"
          isLoading={isLoading}
          icon={<BsPerson />}
          colorScheme="primary"
          variant="outline"
        ></MenuButton>
      )}
      <MenuList>
        {data ? (
          <Link href={process.env.NEXT_PUBLIC_DAO_DAO + "/me"} isExternal>
            <MenuItem>View Profile</MenuItem>
          </Link>
        ) : (
          <Link
            className="text-decoration-none"
            href={process.env.NEXT_PUBLIC_DAO_DAO + "/me"}
            isExternal
          >
            <MenuItem>Create Profile</MenuItem>
          </Link>
        )}
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
  const chainContext = useChain(process.env.NEXT_PUBLIC_CHAIN!);

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
