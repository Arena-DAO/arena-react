import { ArenaWagerModuleQueryClient } from "@arena/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionsQuery } from "@arena/ArenaWagerModule.react-query";
import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/card";
import { Badge, Heading, Link, SimpleGrid } from "@chakra-ui/layout";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { statusColors } from "~/helpers/ArenaHelpers";
import NextLink from "next/link";

interface CompetitionsSectionProps {
  cosmwasmClient: CosmWasmClient;
  category_id: string;
  module_addr: string;
  path: string;
}

interface CompetitionsSectionItemsProps extends CompetitionsSectionProps {
  startAfter?: string;
  setLastCompetitionId: (id: string) => void;
}

function CompetitionsSectionItems({
  cosmwasmClient,
  category_id,
  startAfter,
  setLastCompetitionId,
  module_addr,
  path,
}: CompetitionsSectionItemsProps) {
  const { data } = useArenaWagerModuleCompetitionsQuery({
    client: new ArenaWagerModuleQueryClient(cosmwasmClient, module_addr),
    args: {
      filter: { category: { id: category_id } },
      startAfter: startAfter,
    },
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setLastCompetitionId(data[data.length - 1]!.id);
    }
  }, [data, setLastCompetitionId]);

  if (!data || data.length == 0) return null;

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
            <Link as={NextLink} href={`/${path}/view?id=${competition.id}`}>
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
  path,
}: CompetitionsSectionProps & { title: string }) {
  const [pages, setPages] = useState<[string | undefined]>([undefined]);
  const [lastCompetitionId, setLastCompetitionId] = useState<
    string | undefined
  >();
  return (
    <>
      <Heading as="h3" alignSelf="flex-start">
        {title}
      </Heading>
      <SimpleGrid minChildWidth="250px" spacing="5" width="100%">
        {pages.map((page, index) => (
          <CompetitionsSectionItems
            key={index}
            cosmwasmClient={cosmwasmClient}
            category_id={category_id}
            startAfter={page}
            setLastCompetitionId={setLastCompetitionId}
            module_addr={module_addr}
            path={path}
          />
        ))}
      </SimpleGrid>
      <Button
        aria-label="Load more"
        size="xs"
        variant="ghost"
        alignSelf="flex-end"
        onClick={() => {
          setPages((x) => {
            x.push(lastCompetitionId);
            return x;
          });
        }}
      >
        Load More...
      </Button>
    </>
  );
}
