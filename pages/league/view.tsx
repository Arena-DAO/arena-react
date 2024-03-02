import { Box, Container, Heading } from "@chakra-ui/layout";
import ViewCompetition from "@components/competition/ViewCompetition";
import LeagueExtension from "@components/pages/league/LeagueExtension";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import env from "~/config/env";
import { useCategoriesContext } from "~/contexts/CategoriesContext";

const ViewLeaguePage = () => {
	const { getCosmWasmClient } = useChain(env.CHAIN);
	const {
		query: { id, category },
	} = useRouter();
	const categoryMap = useCategoriesContext();
	const [cosmwasmClient, setCosmwasmClient] = useState<
		CosmWasmClient | undefined
	>(undefined);
	useEffect(() => {
		async function fetchClient() {
			setCosmwasmClient(await getCosmWasmClient());
		}
		fetchClient();
	}, [getCosmWasmClient]);

	const [categoryName, setCategoryName] = useState<string>();
	useEffect(() => {
		if (typeof category === "string") {
			const categoryItem = categoryMap.get(category);
			setCategoryName(categoryItem?.title);
		}
	}, [category, categoryMap]);

	return (
		<Container maxW={{ base: "full", md: "5xl" }} centerContent pb={10}>
			<Heading>
				{categoryName} League {id}
			</Heading>
			<Box w="100%">
				{cosmwasmClient && typeof id === "string" && (
					<ViewCompetition
						module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
						id={id}
						cosmwasmClient={cosmwasmClient}
						extension={
							<LeagueExtension
								cosmwasmClient={cosmwasmClient}
								module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
								id={id}
							/>
						}
					/>
				)}
			</Box>
		</Container>
	);
};

export default ViewLeaguePage;
