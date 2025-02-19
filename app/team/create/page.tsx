"use client";
import { ProfileInput } from "@/components/ProfileInput";
import { toBinary } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Divider,
	Input,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Textarea,
	Tooltip,
	addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CalendarDays,
	HelpCircle,
	Image,
	Info,
	Link,
	PlusCircle,
	Shield,
	Trash,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
		formState: { errors, isSubmitting, dirtyFields },
		reset,
	} = useForm<CreateTeamFormData>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			description: "",
			teamImageUrl: "",
			bannerUrl: "",
			members: [{ addr: "" }, { addr: "" }],
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const onSubmit = async (data: CreateTeamFormData) => {
		try {
			if (!address) {
				throw Error("Wallet must be connected");
			}

			addToast({
				color: "primary",
				description: "Creating your team...",
			});

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
			addToast({
				color: "success",
				description: "Successfully created the team!",
			});
			router.push("/user/teams");
		} catch (error) {
			console.error("Error submitting form:", error);
			addToast({
				color: "danger",
				description: (error as Error).message,
			});
		}
	};

	const handleAddMember = () => {
		append({ addr: "" });
	};

	const handleReset = () => {
		if (
			confirm(
				"Are you sure you want to reset the form? All entered data will be lost.",
			)
		) {
			reset({
				teamName: "",
				description: "",
				teamImageUrl: "",
				bannerUrl: "",
				members: [{ addr: address || "" }, { addr: "" }],
			});
		}
	};

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<Card className="border border-primary/10 shadow-lg">
				<CardHeader className="flex flex-col gap-2 border-primary/10 border-b">
					<div className="flex items-center justify-between">
						<h1 className="font-bold font-cinzel text-2xl md:text-3xl">
							Create Your Team
						</h1>
						<Tooltip content="A team allows you to participate in competitions with multiple members">
							<Button isIconOnly variant="light" className="cursor-help">
								<Info size={20} />
							</Button>
						</Tooltip>
					</div>
					<p className="text-foreground/70">
						Create a team to participate in competitions with friends and manage
						shared assets
					</p>
				</CardHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<CardBody className="p-6 md:p-8">
						<div className="space-y-8">
							{/* Team Identity Section */}
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Shield size={20} className="text-primary" />
									<h2 className="font-semibold text-xl">Team Identity</h2>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Controller
										name="teamName"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												isRequired
												label="Team Name"
												placeholder="Enter your team name"
												errorMessage={errors.teamName?.message}
												isInvalid={!!errors.teamName}
												startContent={
													<Users size={16} className="text-default-400" />
												}
												description="Choose a unique and memorable name"
											/>
										)}
									/>

									<Controller
										name="teamImageUrl"
										control={control}
										render={({ field }) => (
											<Input
												{...field}
												label="Team Logo URL"
												placeholder="ipfs:// or https://"
												errorMessage={errors.teamImageUrl?.message}
												isInvalid={!!errors.teamImageUrl}
												startContent={
													<Image size={16} className="text-default-400" />
												}
												description="Square image recommended (optional)"
											/>
										)}
									/>
								</div>

								<Controller
									name="description"
									control={control}
									render={({ field }) => (
										<Textarea
											{...field}
											isRequired
											label="Team Description"
											placeholder="Tell us about your team"
											errorMessage={errors.description?.message}
											isInvalid={!!errors.description}
											minRows={3}
											classNames={{
												input: "resize-none",
											}}
											description={`${field.value?.length || 0}/500 characters`}
										/>
									)}
								/>

								<Controller
									name="bannerUrl"
									control={control}
									render={({ field }) => (
										<Input
											{...field}
											label="Banner Image URL"
											placeholder="ipfs:// or https://"
											errorMessage={errors.bannerUrl?.message}
											isInvalid={!!errors.bannerUrl}
											startContent={
												<Link size={16} className="text-default-400" />
											}
											description="Wide banner image (16:9 ratio recommended, optional)"
										/>
									)}
								/>
							</div>

							<Divider className="my-6" />

							{/* Team Members Section */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Users size={20} className="text-primary" />
										<h2 className="font-semibold text-xl">Team Members</h2>
									</div>

									<Tooltip content="Add team members with their wallet addresses">
										<Button
											color="primary"
											variant="flat"
											onPress={handleAddMember}
											isDisabled={isSubmitting}
											startContent={<PlusCircle size={18} />}
											className="card-hover"
										>
											Add Member
										</Button>
									</Tooltip>
								</div>

								<Card className="border border-primary/10">
									<Table
										aria-label="Team members table"
										removeWrapper
										isStriped
									>
										<TableHeader>
											<TableColumn>MEMBER ADDRESS</TableColumn>
											<TableColumn width={100}>ACTIONS</TableColumn>
										</TableHeader>
										<TableBody emptyContent="No members added. Add at least two members to create a team.">
											{fields.map((field, index) => (
												<TableRow key={field.id} className="h-20">
													<TableCell>
														<Controller
															name={`members.${index}.addr`}
															control={control}
															render={({ field }) => (
																<ProfileInput
																	label={`Member ${index + 1}`}
																	field={field}
																	error={errors.members?.[index]?.addr}
																	isRequired
																	isDisabled={isSubmitting}
																	emptyTeams
																/>
															)}
														/>
													</TableCell>
													<TableCell className="align-top">
														<Button
															isIconOnly
															variant="light"
															color="danger"
															onPress={() => remove(index)}
															isDisabled={isSubmitting}
															aria-label="Remove member"
														>
															<Trash size={18} />
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Card>

								{errors.members?.root && (
									<div className="flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-danger">
										<HelpCircle size={18} />
										<p className="text-sm">{errors.members.root.message}</p>
									</div>
								)}

								<div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
									<div className="flex items-start gap-3">
										<CalendarDays size={20} className="mt-1 text-primary" />
										<div>
											<h3 className="font-medium text-md">Team Governance</h3>
											<p className="mt-1 text-foreground/70 text-sm">
												Your team will be created as a DAO with equal voting
												power for all members. Decisions will require all
												members to agree within 24-hours.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardBody>

					<CardFooter className="flex justify-between gap-2 border-primary/10 border-t px-6 py-4">
						<Button
							type="button"
							variant="flat"
							onPress={handleReset}
							isDisabled={isSubmitting || !Object.keys(dirtyFields).length}
						>
							Reset Form
						</Button>
						<Button
							type="submit"
							color="primary"
							isLoading={isSubmitting}
							isDisabled={isSubmitting}
							className="card-hover"
							size="lg"
						>
							Create Team
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default CreateTeam;
