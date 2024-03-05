"use client";

import CreateCompetitionForm, {
	CreateCompetitionFormValues,
} from "@/components/competition/CreateCompetitionForm";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { UTCDate } from "@date-fns/utc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/react";
import { addSeconds, formatISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/codegen/ArenaEscrow.types";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import { InstantiateMsg as DaoDaoCoreInstantiateMsg } from "~/codegen/DaoDaoCore.types";
import { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "~/codegen/DaoProposalSingle.types";
import { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "~/codegen/DaoVotingCw4.types";
import { CreateCompetitionSchema } from "~/config/schemas";
import { useCategoryMap } from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";

const CreateWager = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: env } = useEnv();
	const { data: categories } = useCategoryMap();
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);
	const category_id = categoryItem
		? "category_id" in categoryItem
			? categoryItem.category_id
			: undefined
		: undefined;

	const formMethods = useForm<CreateCompetitionFormValues>({
		defaultValues: {
			expiration: {
				at_time: formatISO(addSeconds(new UTCDate(), 14 * 24 * 60 * 60)).slice(
					0,
					16,
				), // Default to 2 weeks from now
			},
			rules: [],
			dues: [
				{
					balance: {
						cw20: [],
						cw721: [],
						native: [],
					},
				},
				{
					balance: {
						cw20: [],
						cw721: [],
						native: [],
					},
				},
			],
			competition_dao_name: `Arena Competition DAO${
				categoryItem ? ` - ${categoryItem.title}` : ""
			}`,
			competition_dao_description: "A DAO for handling an Arena Competition.",
		},
		resolver: zodResolver(CreateCompetitionSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = formMethods;

	const onSubmit = async (values: CreateCompetitionFormValues) => {
		const cosmWasmClient = await getSigningCosmWasmClient();
		if (!cosmWasmClient) throw "Could not get the CosmWasm client";
		if (!address) throw "Could not get user address";

		const wagerModuleClient = new ArenaWagerModuleClient(
			cosmWasmClient,
			address,
			env.ARENA_WAGER_MODULE_ADDRESS,
		);

		const msg = {
			categoryId: category_id?.toString(),
			description: values.description,
			expiration: values.expiration,
			name: values.name,
			rules: values.rules.map((x) => x.rule),
			rulesets: values.rulesets.map((x) => x.ruleset_id.toString()),
			instantiateExtension: {},
			host: {
				new: {
					info: {
						code_id: env.CODE_ID_DAO_CORE,
						label: "Arena Competition DAO",
						msg: toBinary({
							admin: env.ARENA_DAO_ADDRESS,
							automatically_add_cw20s: true,
							automatically_add_cw721s: true,
							description: values.competition_dao_description,
							name: values.competition_dao_name,
							proposal_modules_instantiate_info: [
								{
									admin: { core_module: {} },
									code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
									label: "DAO Proposal Single",
									msg: toBinary({
										allow_revoting: false,
										close_proposal_on_execution_failure: true,
										max_voting_period: {
											time: env.DEFAULT_TEAM_VOTING_DURATION_TIME,
										},
										only_members_execute: true,
										pre_propose_info: {
											anyone_may_propose: {}, // Ideally want a module_can_propose and module_sender
										},
										threshold: {
											absolute_percentage: { percentage: { percent: "1" } },
										},
									} as DAOProposalSingleInstantiateMsg),
								},
							],
							voting_module_instantiate_info: {
								admin: { core_module: {} },
								code_id: env.CODE_ID_DAO_VOTING_CW4,
								label: "DAO Voting CW4",
								msg: toBinary({
									group_contract: {
										new: {
											cw4_group_code_id: env.CODE_ID_CW4_GROUP,
											initial_members: values.dues.map((x) => ({
												addr: x.addr,
												weight: 1,
											})),
										},
									},
								} as DAOVotingCW4InstantiateMsg),
							},
						} as DaoDaoCoreInstantiateMsg),
					},
				},
			},
			escrow: {
				code_id: env.CODE_ID_ESCROW,
				label: "Arena Escrow",
				msg: toBinary({
					dues: values.dues,
				} as ArenaEscrowInstantiateMsg),
			},
		};

		const result = await wagerModuleClient.createCompetition(msg);

		let id: string | undefined = undefined;
		for (const event of result.events) {
			for (const attribute of event.attributes) {
				if (attribute.key === "id") {
					id = attribute.value;
					break;
				}
			}
			if (id) break;
		}

		if (id) router.push(`/wager/view?category=${category}&id=${id}`);
	};

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={handleSubmit(async (data) => await onSubmit(data))}>
				<div className="space-y-4">
					<h1 className="text-5xl text-center">Create a Wager</h1>
					<CreateCompetitionForm />
					<div className="flex">
						<Button
							type="submit"
							isDisabled={!isWalletConnected}
							isLoading={isSubmitting}
							className="ml-auto"
						>
							Submit
						</Button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default CreateWager;
