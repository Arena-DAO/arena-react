import { Button, Container, Heading, Link, Text } from "@chakra-ui/react";
import { DAOMap, DAORoot } from "../config/daos";
import { useRouter } from "next/router";
import NextLink from "next/link";

export default function DAOs() {
  const router = useRouter();
  const { id } = router.query;
  const daoItem = id ? DAOMap.get(id as string) ?? DAORoot : DAORoot;

  return (
    <Container maxW="5xl" py={10}>
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        mb={3}
        textAlign="center"
      >
        Featured DAO's
      </Heading>
      {daoItem.children?.map((x, i) => {
        return (
          <NextLink key={i} href={"daos?id=" + x.url}>
            <Button>{x.title}</Button>
          </NextLink>
        );
      })}
      {daoItem.addrs?.map((x, i) => {
        return <Text>{x}</Text>;
      })}
    </Container>
  );
}
