import {
  Box,
  Container,
  Heading,
  Link,
  Image,
  Text,
  useColorModeValue,
  SimpleGrid,
  Flex,
  chakra,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { DAOMap, DAORoot } from "../config/daos";
import { useRouter } from "next/router";
import NextLink from "next/link";

export default function DAOs() {
  const router = useRouter();
  const { id } = router.query;
  const daoItem = id ? DAOMap.get(id as string) ?? DAORoot : DAORoot;

  return (
    <Container maxW="5x1" pb={10}>
      <Heading
        as="h1"
        fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
        fontWeight="extrabold"
        textAlign="center"
      >
        {daoItem.title}
      </Heading>
      {daoItem.children && (
        <Heading
          as="h2"
          fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
          fontWeight="extrabold"
          mb={3}
          textAlign="center"
        >
          Categories
        </Heading>
      )}
      <SimpleGrid minChildWidth="300px" spacing="5">
        {daoItem.children?.map((x, i) => {
          return (
            <Flex
              key={i}
              direction="column"
              justifyContent="center"
              alignItems="center"
              mx="auto"
              w="full"
            >
              <Image
                w="full"
                rounded="base"
                shadow="base"
                bgSize="cover"
                bgPos="center"
                src={x.img ? x.img : "/default_trophy.jpg"}
                alt="category image"
              />
              <Box
                w="75%"
                bg="white"
                _dark={{
                  bg: "gray.800",
                }}
                mt={-10}
                shadow="base"
                rounded="base"
                overflow="hidden"
              >
                <Heading py={2} textAlign="center" fontWeight="bold">
                  {x.title}
                </Heading>
                <Flex
                  alignItems="center"
                  justifyContent="space-between"
                  py={2}
                  px={3}
                  bg="gray.200"
                  _dark={{
                    bg: "gray.700",
                  }}
                >
                  <Spacer />
                  <NextLink href={"/daos?id=" + x.url}>
                    <Button
                      colorScheme="secondary"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      View
                    </Button>
                  </NextLink>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </SimpleGrid>
      {daoItem.addrs && (
        <Heading
          mt="5"
          as="h2"
          fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
          fontWeight="extrabold"
          mb={3}
          textAlign="center"
        >
          DAO&apos;s
        </Heading>
      )}
      {daoItem.addrs?.map((x, i) => {
        return <Text key={i}>{x}</Text>;
      })}
    </Container>
  );
}
