import { Card, CardBody, CardFooter, CardProps } from "@chakra-ui/card";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Skeleton, Avatar, Text } from "@chakra-ui/react";
import Link from "next/link";
import { env } from "process";
import { UseFormSetError, UseFormClearErrors } from "react-hook-form";
import { BsPerson } from "react-icons/bs";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import { useProfileData } from "~/hooks/useProfileData";
import { CopyAddressButton } from "./CopyAddressButton";

interface DAOCardProps extends CardProps {
  addr: string;
  setError: UseFormSetError<{ address: string }>;
  clearErrors: UseFormClearErrors<{ address: string }>;
}

export function DAOCard({ addr, ...cardProps }: DAOCardProps) {
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
          <Text fontSize="xl">{data?.name ?? addr}</Text>
        </CardBody>
        <CardFooter>
          <CopyAddressButton addr={addr} aria-label="Copy Address" />
        </CardFooter>
      </Card>
    </Skeleton>
  );
}
