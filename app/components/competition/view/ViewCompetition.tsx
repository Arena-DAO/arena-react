"use client";

import { CopyAddressButton } from "@/components/CopyAddressButton";
import Profile from "@/components/Profile";
import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardHeader,
	Input,
	Link,
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { BsYinYang } from "react-icons/bs";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionQuery } from "~/codegen/ArenaWagerModule.react-query";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";

interface ViewCompetitionProps {
	id: string;
}

const ViewCompetition = ({
	cosmWasmClient,
	id,
}: WithClient<ViewCompetitionProps>) => {
	const { data: env } = useEnv();
	const { data, isLoading } = useArenaWagerModuleCompetitionQuery({
		client: new ArenaWagerModuleQueryClient(
			cosmWasmClient,
			env.ARENA_WAGER_MODULE_ADDRESS,
		),
		args: {
			id,
		},
	});

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<h2 className="text-3xl font-bold">Host</h2>
				</CardHeader>
				<CardBody>
					<div className="flex justify-between">
						{data?.host && (
							<>
								<Profile address={data.host} cosmWasmClient={cosmWasmClient} />
								<ButtonGroup>
									<CopyAddressButton address={data?.host} />
									{isValidContractAddress(data.host, env.BECH32_PREFIX) && (
										<Tooltip content="View on DAO DAO">
											<Button
												isIconOnly
												as={Link}
												href={`${env.DAO_DAO_URL}/dao/${data.host}`}
												isExternal
											>
												<BsYinYang />
											</Button>
										</Tooltip>
									)}
								</ButtonGroup>
							</>
						)}
					</div>
				</CardBody>
			</Card>
			<Input label="Name" value={data?.name} readOnly />
			<Textarea label="Description" value={data?.description} readOnly />
		</div>
	);
};

export default ViewCompetition;
