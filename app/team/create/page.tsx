"use client";

import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Input,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
} from "@nextui-org/react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { z } from "zod";
import type { ExecuteMsg as ArenaPaymentRegistryExecuteMsg } from "~/codegen/ArenaPaymentRegistry.types";
import type {
	CosmosMsgForEmpty,
	InstantiateMsg as DaoCoreInstantiateMsg,
	ModuleInstantiateInfo,
	WasmMsg,
} from "~/codegen/DaoDaoCore.types";
import type { InstantiateMsg as DAOPreProposeSingleInstantiateMsg } from "~/codegen/DaoPreProposeSingle.types";
import type { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "~/codegen/DaoProposalSingle.types";
import type { InstantiateMsg as DAOVotingCw4InstantiateMsg } from "~/codegen/DaoVotingCw4.types";
import { MemberPercentageSchema } from "~/config/schemas";
import { useEnv } from "~/hooks/useEnv";

// Helper function to validate IPFS or HTTP(S) URLs
const isValidUrl = (url: string) => {
	return (
		url.startsWith("ipfs://") ||
		url.startsWith("http://") ||
		url.startsWith("https://")
	);
};

const CreateTeamSchema = z.object({
	teamName: z
		.string()
		.min(1, "Team name is required")
		.max(50, "Team name cannot exceed 50 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(500, "Description cannot exceed 500 characters"),
	teamImageUrl: z
		.string()
		.optional()
		.refine(
			(url) => !url || isValidUrl(url),
			"Must be a valid IPFS or HTTP(S) URL",
		),
	bannerUrl: z
		.string()
		.optional()
		.refine(
			(url) => !url || isValidUrl(url),
			"Must be a valid IPFS or HTTP(S) URL",
		),
	members: MemberPercentageSchema.array()
		.min(1, "At least one team member is required")
		.refine(
			(members) => {
				const total = members.reduce(
					(sum, member) => sum + member.percentage,
					0,
				);
				return total === 1;
			},
			{ message: "Percentages must total 100%" },
		),
});

type CreateTeamFormData = z.infer<typeof CreateTeamSchema>;

const CreateTeam = () => {
	const env = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateTeamFormData>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			description: "",
			teamImageUrl: "",
			bannerUrl: "",
			members: [{ addr: address, percentage: 0 }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const members = useWatch({
		control,
		name: "members",
	});

	const onSubmit = async (data: CreateTeamFormData) => {
		try {
			if (!address) {
				throw Error("Wallet must be connected");
			}
			const cosmWasmClient = await getSigningCosmWasmClient();
			await cosmWasmClient.instantiate(
				address,
				env.CODE_ID_DAO_CORE,
				{
					automatically_add_cw20s: true,
					automatically_add_cw721s: true,
					description: data.description,
					image_url: data.teamImageUrl,
					name: data.teamName,
					proposal_modules_instantiate_info: [
						{
							admin: { core_module: {} },
							code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
							funds: [],
							label: "DAO Proposal Single",
							msg: toBinary({
								allow_revoting: false,
								close_proposal_on_execution_failure: true,
								max_voting_period: { time: 86400 },
								only_members_execute: true,
								pre_propose_info: {
									module_may_propose: {
										info: {
											admin: { core_module: {} },
											code_id: env.CODE_ID_DAO_PREPROPOSE_SINGLE,
											funds: [],
											label: "DAO PrePropose Single",
											msg: toBinary({
												extension: {},
												submission_policy: {
													specific: {
														dao_members: true,
														allowlist: [],
														denylist: [],
													},
												},
											} as DAOPreProposeSingleInstantiateMsg),
										},
									},
								},
								threshold: {
									absolute_percentage: { percentage: { percent: "1" } },
								},
							} as DAOProposalSingleInstantiateMsg),
						} as ModuleInstantiateInfo,
					],
					voting_module_instantiate_info: {
						code_id: env.CODE_ID_CW4_VOTING,
						label: "DAO Voting CW4",
						funds: [],
						admin: { core_module: {} },
						msg: toBinary({
							group_contract: {
								new: {
									cw4_group_code_id: env.CODE_ID_CW4_GROUP,
									initial_members: data.members.map((x) => ({
										addr: x.addr,
										weight: 100,
									})),
								},
							},
						} as DAOVotingCw4InstantiateMsg),
					} as ModuleInstantiateInfo,
					initial_dao_actions: [
						{
							wasm: {
								execute: {
									contract_addr: env.ARENA_PAYMENT_REGISTRY_ADDRESS,
									funds: [],
									msg: toBinary({
										set_distribution_remainder_self: {
											member_percentages: data.members.map((member) => ({
												addr: member.addr,
												percentage: member.percentage.toString(),
											})),
										},
									} as ArenaPaymentRegistryExecuteMsg),
								},
							} as WasmMsg,
						} as CosmosMsgForEmpty,
					],
				} as DaoCoreInstantiateMsg,
				"Arena Team",
				"auto",
			);
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						<h1 className="mb-6 font-bold text-2xl">Create Your Team</h1>
						<div className="space-y-4">
							<Controller
								name="teamName"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										isRequired
										label="Team Name"
										errorMessage={errors.teamName?.message}
										isInvalid={!!errors.teamName}
									/>
								)}
							/>

							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<Textarea
										{...field}
										isRequired
										label="Description"
										errorMessage={errors.description?.message}
										isInvalid={!!errors.description}
									/>
								)}
							/>

							<Controller
								name="teamImageUrl"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										label="Team Image URL"
										placeholder="ipfs:// or http(s)://"
										errorMessage={errors.teamImageUrl?.message}
										isInvalid={!!errors.teamImageUrl}
									/>
								)}
							/>

							<Controller
								name="bannerUrl"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										label="Banner URL"
										placeholder="ipfs:// or http(s)://"
										errorMessage={errors.bannerUrl?.message}
										isInvalid={!!errors.bannerUrl}
									/>
								)}
							/>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-xl">Team Members</h2>
									<Button
										color="primary"
										onPress={() => append({ addr: "", percentage: 0 })}
									>
										Add Member
									</Button>
								</div>

								<Table aria-label="Team members table" removeWrapper hideHeader>
									<TableHeader>
										<TableColumn>ADDRESS</TableColumn>
										<TableColumn>PERCENTAGE %</TableColumn>
										<TableColumn>ACTIONS</TableColumn>
									</TableHeader>
									<TableBody>
										{fields.map((field, index) => (
											<TableRow key={field.id}>
												<TableCell>
													<Controller
														name={`members.${index}.addr`}
														control={control}
														render={({ field }) => (
															<Input
																{...field}
																label="Address"
																isRequired
																placeholder={`${env.BECH32_PREFIX}...`}
																errorMessage={
																	errors.members?.[index]?.addr?.message
																}
																isInvalid={!!errors.members?.[index]?.addr}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Controller
														name={`members.${index}.percentage`}
														control={control}
														render={({ field: { onChange, ...field } }) => (
															<Input
																{...field}
																isRequired
																min="0"
																max="100"
																step="1"
																type="number"
																label="Percentage"
																isDisabled={isSubmitting}
																value={field.value?.toString()}
																onChange={(e) =>
																	onChange(Number.parseFloat(e.target.value))
																}
																errorMessage={
																	errors.members?.[index]?.percentage?.message
																}
																isInvalid={
																	!!errors.members?.[index]?.percentage
																}
																endContent={<BsPercent />}
																classNames={{ input: "text-right" }}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Button color="danger" onPress={() => remove(index)}>
														Remove
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								{errors.members &&
									typeof errors.members === "object" &&
									"message" in errors.members && (
										<p className="text-danger text-sm">
											{errors.members.message as string}
										</p>
									)}

								<Progress
									value={members.reduce((acc, x) => acc + x.percentage, 0)}
									color="primary"
									showValueLabel
								/>
							</div>
						</div>
					</CardBody>
					<CardFooter>
						<Button
							type="submit"
							color="primary"
							isLoading={isSubmitting}
							isDisabled={isSubmitting}
							className="ml-auto"
						>
							Create Team
						</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
};

export default CreateTeam;
