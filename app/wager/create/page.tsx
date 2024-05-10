"use client";

import Profile from "@/components/Profile";
import CreateCompetitionForm from "@/components/competition/create/CreateCompetitionForm";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Accordion,
	AccordionItem,
	Button,
	Input,
	Link,
	Switch,
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import { addHours } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { BsArrowLeft, BsInfoCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import { z } from "zod";
import type { InstantiateMsg as ArenaEscrowInstantiateMsg } from "~/codegen/ArenaEscrow.types";
import { ArenaWagerModuleClient } from "~/codegen/ArenaWagerModule.client";
import type { InstantiateMsg as DaoDaoCoreInstantiateMsg } from "~/codegen/DaoDaoCore.types";
import type { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "~/codegen/DaoProposalSingle.types";
import type { InstantiateMsg as DAOVotingCW4InstantiateMsg } from "~/codegen/DaoVotingCw4.types";
import { AddressSchema, CreateCompetitionSchema } from "~/config/schemas";
import { convertToExpiration } from "~/helpers/SchemaHelpers";
import { useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const CreateWagerSchema = CreateCompetitionSchema.extend({
	isAutomaticHost: z.boolean(),
	hostDAOName: z.string().min(1, { message: "Host DAO name is required" }),
	hostDAODescription: z
		.string()
		.min(1, { message: "Host DAO description is required" }),
	host: AddressSchema.optional(),
}).superRefine((x, ctx) => {
	if (!x.isAutomaticHost && !x.host) {
		ctx.addIssue({
			path: ["host"],
			code: z.ZodIssueCode.custom,
			message: "Host is required when not using an automatic host",
		});
	}
	if (
		x.isAutomaticHost &&
		(x.membersFromDues ? x.dues.length < 2 : x.members.length < 2)
	) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "At least 2 members are required for automatic host",
			path: [x.membersFromDues ? "dues" : "members"],
		});
	}
});
type CreateWagerFormValues = z.infer<typeof CreateWagerSchema>;

const CreateWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address, isWalletConnected } = useChain(
		env.CHAIN,
	);
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: categories } = useCategoryMap();

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);
	const category_id = categoryItem
		? "category_id" in categoryItem
			? categoryItem.category_id
			: undefined
		: undefined;
	const formMethods = useForm<CreateWagerFormValues>({
		defaultValues: {
			expiration: {
				at_time: addHours(new Date(), 2).toISOString(), // Default to 2 hours from now
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
			hostDAOName: `Arena Competition DAO${
				categoryItem ? ` - ${categoryItem.title}` : ""
			}`,
			hostDAODescription: "A DAO for handling an Arena Competition.",
			isAutomaticHost: true,
			membersFromDues: true,
		},
		resolver: zodResolver(CreateWagerSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting, errors },
		control,
		watch,
		setValue,
	} = formMethods;

	const watchIsAutomaticHost = watch("isAutomaticHost");
	const watchHost = watch("host");

	useEffect(() => {
		const value = formMethods.getValues("dues.0.addr");
		if (value === undefined && address) {
			formMethods.setValue("dues.0.addr", address);
		}
	}, [address, formMethods.getValues, formMethods.setValue]);

	const onSubmit = async (values: CreateWagerFormValues) => {
		try {
			const cosmWasmClient = await getSigningCosmWasmClient();
			if (!address) throw "Could not get user address";

			const wagerModuleClient = new ArenaWagerModuleClient(
				cosmWasmClient,
				address,
				env.ARENA_WAGER_MODULE_ADDRESS,
			);

			const host = values.isAutomaticHost
				? {
						new: {
							info: {
								admin: { address: { addr: env.ARENA_DAO_ADDRESS } },
								code_id: env.CODE_ID_DAO_CORE,
								label: "Arena Competition DAO",
								msg: toBinary({
									admin: env.ARENA_DAO_ADDRESS,
									automatically_add_cw20s: true,
									automatically_add_cw721s: true,
									description: values.hostDAODescription,
									name: values.hostDAOName,
									proposal_modules_instantiate_info: [
										{
											admin: { core_module: {} },
											code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
											label: "DAO Proposal Single",
											funds: [],
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
										funds: [],
										msg: toBinary({
											group_contract: {
												new: {
													cw4_group_code_id: env.CODE_ID_CW4_GROUP,
													initial_members: (values.membersFromDues
														? values.dues.map((x) => x.addr)
														: values.members.map((x) => x.address)
													).map((addr) => ({ addr, weight: 1 })),
												},
											},
										} as DAOVotingCW4InstantiateMsg),
									},
								} as DaoDaoCoreInstantiateMsg),
							},
						},
					}
				: // biome-ignore lint/style/noNonNullAssertion: Schema validation ensures this is populated
					{ existing: { addr: values.host! } };

			const msg = {
				categoryId: category_id?.toString(),
				description: values.description,
				expiration: convertToExpiration(values.expiration),
				name: values.name,
				rules: values.rules.map((x) => x.rule),
				rulesets: values.rulesets.map((x) => x.ruleset_id.toString()),
				instantiateExtension: {},
				host: host,
				escrow: {
					code_id: env.CODE_ID_ESCROW,
					label: "Arena Escrow",
					msg: toBinary({
						dues: values.dues.map(({ addr, balance }) => {
							return {
								addr,
								balance: {
									native: balance.native.map(({ denom, amount }) => ({
										denom,
										amount: amount.toString(),
									})),
									cw20: balance.cw20.map(({ address, amount }) => ({
										address,
										amount: amount.toString(),
									})),
									cw721: balance.cw721,
								},
							};
						}),
					} as ArenaEscrowInstantiateMsg),
				},
			};

			const result = await wagerModuleClient.createCompetition(msg);

			toast.success("The wager was created");

			let competitionId: string | undefined = undefined;
			for (const event of result.events) {
				for (const attribute of event.attributes) {
					if (attribute.key === "competition_id") {
						competitionId = attribute.value;
						break;
					}
				}
				if (competitionId) break;
			}

			if (competitionId)
				router.push(
					`/wager/view?category=${category}&competitionId=${competitionId}`,
				);

			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			toast.error(e.toString());
		}
	};

	return (
		<FormProvider {...formMethods}>
			<form onSubmit={handleSubmit(async (data) => await onSubmit(data))}>
				<div className="space-y-4">
					<h1 className="text-center text-5xl">Create a Wager</h1>
					{category && (
						<Tooltip content="Return to competitions">
							<Button
								as={Link}
								isIconOnly
								href={`/compete?category=${category}`}
							>
								<BsArrowLeft />
							</Button>
						</Tooltip>
					)}
					<div className="flex flex-nowrap space-x-2">
						<Switch
							aria-label="Automatic Host"
							isDisabled={isSubmitting}
							defaultSelected={
								formMethods.formState.defaultValues?.isAutomaticHost
							}
							onValueChange={(value) => setValue("isAutomaticHost", value)}
						>
							Use Automatic Host
						</Switch>
						<Tooltip content="If enabled, then a DAO is created with all members required to agree on proposals">
							<Button isIconOnly variant="light">
								<BsInfoCircle />
							</Button>
						</Tooltip>
					</div>
					{watchIsAutomaticHost && (
						<Accordion variant="shadow">
							<AccordionItem
								key="1"
								aria-label="Accordion 1"
								title="Host DAO Details"
							>
								<div className="space-y-4">
									<p>Specify the automatically-generated host DAO's details.</p>
									<Controller
										control={control}
										name="hostDAOName"
										render={({ field }) => (
											<Input
												label="Name"
												isDisabled={isSubmitting}
												isInvalid={!!errors.hostDAOName}
												errorMessage={errors.hostDAOName?.message}
												{...field}
											/>
										)}
									/>
									<Controller
										control={control}
										name="hostDAODescription"
										render={({ field }) => (
											<Textarea
												label="Description"
												isDisabled={isSubmitting}
												isInvalid={!!errors.hostDAODescription}
												errorMessage={errors.hostDAODescription?.message}
												{...field}
											/>
										)}
									/>
								</div>
							</AccordionItem>
						</Accordion>
					)}
					{!watchIsAutomaticHost && (
						<div className="flex space-x-4">
							<Controller
								control={control}
								name="host"
								render={({ field }) => (
									<Input
										className="max-w-3xl"
										type="text"
										label="Host"
										isDisabled={isSubmitting}
										isInvalid={!!errors.host}
										errorMessage={errors.host?.message}
										{...field}
									/>
								)}
							/>
							{watchHost && cosmWasmClient && (
								<Profile address={watchHost} cosmWasmClient={cosmWasmClient} />
							)}
						</div>
					)}
					<CreateCompetitionForm
						isMembersFromDuesVisible={watchIsAutomaticHost}
					/>
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
