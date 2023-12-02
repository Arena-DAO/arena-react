import { Heading } from "@chakra-ui/layout";
import { Image, VStack, useColorModeValue, LinkBox } from "@chakra-ui/react";
import { Card, CardBody } from "@chakra-ui/card";
import { CategoryItem } from "@config/categories";
import NextLink from "next/link";

interface CompetitionCategoryCardProps {
  item: CategoryItem;
}

export function CompetitionCategoryCard({
  item,
}: CompetitionCategoryCardProps) {
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <LinkBox
      as={NextLink}
      href={"/compete?category=" + item.url}
      passHref
      _focus={{ boxShadow: "none" }}
    >
      <Card
        w="full"
        boxShadow="md"
        rounded="md"
        bg={cardBg}
        transition="all 0.2s"
        _hover={{ transform: "scale(1.02)" }}
      >
        <Image
          src={item.img ?? "/default_trophy.jpg"}
          alt={item.title}
          w="full"
          h="300px"
          objectFit="cover"
          borderTopRadius="md"
        />
        <CardBody>
          <VStack align="start" spacing={2}>
            <Heading size="md" fontWeight="bold">
              {item.title}
            </Heading>
          </VStack>
        </CardBody>
      </Card>
    </LinkBox>
  );
}