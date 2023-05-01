import React, { MouseEventHandler, ReactNode } from "react";
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
import { gql, useQuery } from "@apollo/client";

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

const GET_DESMOS_PROFILE_BY_CHAIN_ADDRESS = gql`
  query GetDesmosProfileByChainAddress($address: String!) {
    chain_link(where: { external_address: { _eq: $address } }) {
      profile {
        dtag
        profile_pic
      }
    }
  }
`;

function Profile({ address, openView }: ProfileProps) {
  const { chain } = useChain(process.env.NEXT_PUBLIC_DESMOS!);
  const { loading, error, data } = useQuery(
    GET_DESMOS_PROFILE_BY_CHAIN_ADDRESS,
    { variables: { address: address } }
  );

  let hasDesmosProfile = !(loading || error || data.chain_link.length == 0);

  return (
    <Menu>
      <MenuButton>
        {hasDesmosProfile ? (
          <Image
            h="50px"
            src={data.chain_link[0].profile.profile_pic}
            borderRadius="full"
            alt="Profile"
          ></Image>
        ) : (
          <IconButton
            aria-label="Profile"
            isLoading={loading}
            icon={<BsPerson />}
            colorScheme="primary"
            variant="outline"
          />
        )}
      </MenuButton>
      <MenuList>
        {hasDesmosProfile ? (
          <Link
            href={
              chain?.explorers?.at(0)!.url! +
              "/" +
              data.chain_link[0].profile.dtag!
            }
            isExternal
          >
            <MenuItem>View Profile</MenuItem>
          </Link>
        ) : (
          <Link
            className="text-decoration-none"
            href="https://go-find.me/"
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
