import { ArenaWagerModuleQueryClient } from "@arena/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionsQuery } from "@arena/ArenaWagerModule.react-query";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/card";
import { Badge, Box, Heading, Link, SimpleGrid } from "@chakra-ui/layout";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { statusColors } from "~/helpers/ArenaHelpers";
import NextLink from "next/link";
import env from "@config/env";

interface CompetitionsSectionProps {
  cosmwasmClient: CosmWasmClient;
  category_id: string;
  module_addr: string;
  path: string;
  category: string;
}

interface CompetitionsSectionItemsProps extends CompetitionsSectionProps {
  startAfter?: string;
  setLastCompetitionId: (id: string) => void;
  setIsEmptyData: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

function CompetitionsSectionItems({
  cosmwasmClient,
  category,
  category_id,
  startAfter,
  setLastCompetitionId,
  module_addr,
  path,
  setIsEmptyData,
  setIsLoading,
}: CompetitionsSectionItemsProps) {
  const { data } = useArenaWagerModuleCompetitionsQuery({
    client: new ArenaWagerModuleQueryClient(cosmwasmClient, module_addr),
    args: {
      filter: { category: { id: category_id } },
      startAfter: startAfter,
    },
  });

  useEffect(() => {
    if (data && "length" in data) {
      if (data.length > 0) setLastCompetitionId(data[data.length - 1]!.id);
      setIsEmptyData(data.length < env.PAGINATION_LIMIT);
      console.log(env.PAGINATION_LIMIT);
      setIsLoading(false);
    }
  }, [data, setLastCompetitionId, setIsEmptyData, setIsLoading]);

  if (!data || data.length == 0) {
    if (startAfter) return null;
    else return <Text>No competitions yet...</Text>;
  }

  return (
    <>
      {data.map((competition) => (
        <Card key={competition.id}>
          <CardHeader>
            <Heading size="md">{competition.name}</Heading>
            <Badge
              variant="solid"
              ml={1}
              colorScheme={statusColors[competition.status]}
            >
              {competition.status}
            </Badge>
          </CardHeader>
          <CardBody>
            <Text mt={2}>{competition.description}</Text>
          </CardBody>
          <CardFooter>
            <Link
              as={NextLink}
              href={`/${path}/view?category=${category}&id=${competition.id}`}
            >
              <Button>View</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

export function CompetitionsSection({
  cosmwasmClient,
  category_id,
  module_addr,
  title,
  category,
  path,
}: CompetitionsSectionProps & { title: string }) {
  const [isEmptyData, setIsEmptyData] = useState(true);
  const [pages, setPages] = useState<[string | undefined]>([undefined]);
  const [lastCompetitionId, setLastCompetitionId] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Heading as="h3" alignSelf="flex-start">
        {title}
      </Heading>
      <SimpleGrid minChildWidth="250px" spacing="5" width="100%" my="2">
        {pages.map((page, index) => (
          <CompetitionsSectionItems
            key={index}
            cosmwasmClient={cosmwasmClient}
            category_id={category_id}
            startAfter={page}
            setLastCompetitionId={setLastCompetitionId}
            module_addr={module_addr}
            category={category}
            path={path}
            setIsEmptyData={setIsEmptyData}
            setIsLoading={setIsLoading}
          />
        ))}
      </SimpleGrid>
      {!isEmptyData && (
        <Button
          my="2"
          aria-label="Load more"
          variant="ghost"
          alignSelf="flex-end"
          isLoading={isLoading}
          onClick={() => {
            if (lastCompetitionId) {
              setIsLoading(true);
              setPages((x) => {
                x.push(lastCompetitionId);
                return x;
              });
            }
          }}
        >
          Load More...
        </Button>
      )}
    </>
  );
}
