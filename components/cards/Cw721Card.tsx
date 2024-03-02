import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	CardProps,
} from "@chakra-ui/card";
import { DeleteIcon } from "@chakra-ui/icons";
import {
	HStack,
	Heading,
	IconButton,
	Image,
	Skeleton,
	Tooltip,
} from "@chakra-ui/react";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Cw721BaseQueryClient } from "~/ts-codegen/cw-nfts/Cw721Base.client";
import {
	useCw721BaseContractInfoQuery,
	useCw721BaseNftInfoQuery,
} from "~/ts-codegen/cw-nfts/Cw721Base.react-query";

interface Cw721CardProps extends CardProps {
	cosmwasmClient: CosmWasmClient;
	address: string;
	token_ids: string[];
	deleteFn?: (index: number) => void;
	deleteNFTFn?: (token_id: string) => void;
	nftCardProps?: CardProps;
	index?: number;
}

interface Cw721NFTCardProps extends CardProps {
	cosmwasmClient: CosmWasmClient;
	address: string;
	token_id: string;
	deleteNFTFn?: (token_id: string) => void;
}

export function Cw721NFTCard({
	address,
	token_id,
	cosmwasmClient,
	deleteNFTFn,
	...nftCardProps
}: Cw721NFTCardProps) {
	const { data, isLoading, isError } = useCw721BaseNftInfoQuery({
		client: new Cw721BaseQueryClient(cosmwasmClient, address),
		args: { tokenId: token_id },
		options: { retry: false, staleTime: Infinity },
	});

	if (isError) return null;
	return (
		<Skeleton isLoaded={!isLoading}>
			<Card {...nftCardProps}>
				<CardBody>
					<Image
						objectFit="cover"
						src={data?.token_uri || undefined}
						alt="NFT"
					/>
				</CardBody>
				<CardFooter>
					{deleteNFTFn && (
						<Tooltip label="Delete NFT">
							<IconButton
								aria-label="Delete NFT"
								icon={<DeleteIcon />}
								onClick={() => deleteNFTFn(token_id)}
							/>
						</Tooltip>
					)}
				</CardFooter>
			</Card>
		</Skeleton>
	);
}

export function Cw721Card({
	cosmwasmClient,
	address,
	token_ids,
	deleteFn,
	deleteNFTFn,
	nftCardProps,
	index = 0,
	...cardProps
}: Cw721CardProps) {
	const { data, isLoading, isError } = useCw721BaseContractInfoQuery({
		client: new Cw721BaseQueryClient(cosmwasmClient, address),
		options: { retry: false, staleTime: Infinity },
	});

	if (isError) return null;
	return (
		<Skeleton isLoaded={!isLoading}>
			<Card
				direction="row"
				px="4"
				overflow="hidden"
				alignItems="center"
				{...cardProps}
			>
				<CardHeader>
					<Heading>{data?.name}</Heading>
				</CardHeader>
				<CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
					<HStack>
						{token_ids.map((x, i) => {
							return (
								<Cw721NFTCard
									key={i}
									cosmwasmClient={cosmwasmClient}
									address={address}
									token_id={x}
									deleteNFTFn={deleteNFTFn}
									{...nftCardProps}
								/>
							);
						})}
					</HStack>
				</CardBody>
				<CardFooter>
					{deleteFn && (
						<Tooltip label="Delete Collection">
							<IconButton
								variant="ghost"
								aria-label="Delete"
								onClick={() => deleteFn(index)}
								icon={<DeleteIcon />}
							/>
						</Tooltip>
					)}
				</CardFooter>
			</Card>
		</Skeleton>
	);
}
