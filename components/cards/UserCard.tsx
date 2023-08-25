import { Card, CardBody, CardFooter, CardProps } from "@chakra-ui/card";
import { Skeleton, Avatar, Text } from "@chakra-ui/react";
import { BsPerson } from "react-icons/bs";
import { useProfileData } from "~/hooks/useProfileData";
import { CopyAddressButton } from "@components/buttons/CopyAddressButton";

interface UserCardProps extends CardProps {
  addr: string;
}

export function UserCard({ addr, ...cardProps }: UserCardProps) {
  const { data, isLoading, isError } = useProfileData(addr);

  if (isError) {
    return <></>;
  }

  return (
    <Skeleton isLoaded={!isLoading}>
      <Card
        direction="row"
        px="4"
        overflow="hidden"
        alignItems="center"
        {...cardProps}
      >
        <Avatar
          src={data?.nft?.imageUrl}
          marginRight="3"
          name={data?.name || undefined}
          icon={<BsPerson />}
        />
        <CardBody>
          <Text>{data?.name ?? addr}</Text>
        </CardBody>
        <CardFooter>
          <CopyAddressButton addr={addr} aria-label="Copy Address" />
        </CardFooter>
      </Card>
    </Skeleton>
  );
}
