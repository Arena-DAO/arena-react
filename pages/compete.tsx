import {
  Container,
  Heading,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CategoryMap, CategoryRoot } from "@config/featured";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { FeaturedDAOItemCard } from "@components/pages/featured/DAOItemCard";

export default function Compete() {
  const router = useRouter();
  const { category } = router.query;

  const minChildWidth = useBreakpointValue({
    base: "200px",
    sm: "300px",
    md: "400px",
  });
  const daoItem = useMemo(
    () =>
      category
        ? CategoryMap.get(category as string) ?? CategoryRoot
        : CategoryRoot,
    [category]
  );

  return (
    <Container maxW={{ base: "full" }} centerContent pb={10}>
      <Heading mb="6">
        {daoItem.title} {daoItem.children && "Categories"}
      </Heading>
      <SimpleGrid minChildWidth={minChildWidth} spacing="5" width="100%">
        {daoItem.children?.map((x) => {
          return <FeaturedDAOItemCard item={x} key={x.url} />;
        })}
      </SimpleGrid>
    </Container>
  );
}
