import { gql, useQuery } from "@apollo/client";
import {
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { useChain, useManager } from "@cosmos-kit/react";
import { BsPerson } from "react-icons/bs";

export default function Profile() {
  const chain = useChain(process.env.NEXT_PUBLIC_CHAIN!);
  const desmos = useManager().getChainRecord(process.env.NEXT_PUBLIC_DESMOS!);
  const { loading, error, data } = useQuery(
    gql`
      query GetDesmosProfileByChainAddress($address: String!) {
        chain_link(where: { external_address: { _eq: $address } }) {
          profile {
            dtag
            profile_pic
          }
        }
      }
    `,
    { variables: { address: chain.address! } }
  );

  let hasDesmosProfile = !(loading || error || data.chain_link.length == 0);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Profile"
        icon={
          hasDesmosProfile ? (
            data.chain_link[0].profile.profile_pic
          ) : (
            <BsPerson />
          )
        }
        variant="ghost"
      ></MenuButton>
      <MenuList>
        {hasDesmosProfile ? (
          <Link
            href={
              desmos.chain.explorers!.at(0)!.url! +
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
        <MenuItem onClick={chain.openView}>Manage Wallet</MenuItem>
      </MenuList>
    </Menu>
  );
}
