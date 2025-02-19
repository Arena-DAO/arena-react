"use client";
import { ProfileInput } from "@/components/ProfileInput";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Input,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import type {
	InstantiateMsg as DaoCoreInstantiateMsg,
	ModuleInstantiateInfo,
} from "~/codegen/DaoDaoCore.types";
import type { InstantiateMsg as DAOPreProposeSingleInstantiateMsg } from "~/codegen/DaoPreProposeSingle.types";
import type { InstantiateMsg as DAOProposalSingleInstantiateMsg } from "~/codegen/DaoProposalSingle.types";
import type { InstantiateMsg as DAOVotingCw4InstantiateMsg } from "~/codegen/DaoVotingCw4.types";
import MemberSchema from "~/config/schemas/MembersSchema";
import { useEnv } from "~/hooks/useEnv";
import { useTeamStore } from "~/store/teamStore";

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
		.min(1, "Description is required")
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
	members: z.array(MemberSchema).min(2, "At least two members are required"),
});

type CreateTeamFormData = z.infer<typeof CreateTeamSchema>;

const CreateTeam = () => {
	const router = useRouter();
	const env = useEnv();
	const { address, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const { addTeam } = useTeamStore();
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		getValues,
	} = useForm<CreateTeamFormData>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			description: "",
			teamImageUrl: "",
			bannerUrl: "",
			members: [{ addr: address }],
		},
	});

	useEffect(() => {
		if (address && !getValues("members.0.addr")) {
			setValue("members.0.addr", address); // Update the first member's address dynamically
		}
	}, [address, setValue, getValues]);

	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const onSubmit = async (data: CreateTeamFormData) => {
		try {
			if (!address) {
				throw Error("Wallet must be connected");
			}
			const cosmWasmClient = await getSigningCosmWasmClient();
			const result = await cosmWasmClient.instantiate(
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
				} as DaoCoreInstantiateMsg,
				"Arena Team",
				"auto",
			);
			addTeam(result.contractAddress);
			toast.success("Successfully created the team");
			router.push("/user/teams");
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error((error as Error).message);
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
										label="Team Description"
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
										onPress={() => append({ addr: "" })}
										isDisabled={isSubmitting}
									>
										Add Member
									</Button>
								</div>

								<Table aria-label="Team members table" removeWrapper hideHeader>
									<TableHeader>
										<TableColumn>ADDRESS</TableColumn>
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
															<ProfileInput
																label="Address"
																field={field}
																error={errors.members?.[index]?.addr}
																isRequired
																isDisabled={isSubmitting}
															/>
														)}
													/>
												</TableCell>
												<TableCell>
													<Button
														color="danger"
														onPress={() => remove(index)}
														isDisabled={isSubmitting}
													>
														Remove
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>

								{errors.members?.root && (
									<p className="text-danger text-sm">
										{errors.members.root.message}
									</p>
								)}
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
