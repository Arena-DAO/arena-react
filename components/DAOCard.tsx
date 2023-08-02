import {
  Box,
  BoxProps,
  Image,
  Link,
  Spacer,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Config } from "@dao/DaoCore.types";
import { convertIPFSToHttp } from "~/helpers/IPFSHelpers";
import NextLink from "next/link";

interface DAOCardProps extends BoxProps {
  addr: string;
  config: Config;
}

export function DAOCard({ config, addr, ...boxprops }: DAOCardProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      padding="2"
      borderRadius="md"
      boxShadow="md"
      bgColor={useColorModeValue("gray.200", "gray.700")}
      {...boxprops}
    >
      <Image
        boxSize="50px"
        borderRadius="full"
        src={convertIPFSToHttp(config.image_url)}
        fallbackSrc="/logo.svg"
        alt="DAO Image"
        marginRight="3"
      />
      <Text fontSize="xl">{config.name}</Text>
      <Spacer />
      <Link
        as={NextLink}
        href={process.env.NEXT_PUBLIC_DAO_DAO! + "/dao/" + addr}
        _hover={{ textDecoration: "none" }}
        _focus={{ outline: "none" }}
        target="_blank"
      >
        <ExternalLinkIcon mr="3" />
      </Link>
    </Box>
  );
}
