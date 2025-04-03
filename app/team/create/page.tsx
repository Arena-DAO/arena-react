"use client";
import ImageUploader from "@/components/ImageUpload";
import type { ImageUploaderRef } from "@/components/ImageUpload";
import Profile from "@/components/Profile";
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
	Link,
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
	ExternalLink,
	HelpCircle,
	Image as ImageIcon,
	Info,
	PlusCircle,
	Shield,
	Trash,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
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

// Updated schema - removed URL validation since we'll upload images directly
const CreateTeamSchema = z.object({
	teamName: z
		.string()
		.min(1, "Team name is required")
		.max(50, "Team name cannot exceed 50 characters"),
	description: z
		.string()
		.min(1, "Description is required")
		.max(500, "Description cannot exceed 500 characters"),
	teamImageUrl: z.string().optional(),
	bannerUrl: z.string().optional(),
	members: z.array(MemberSchema).min(2, "At least two members are required"),
});

type CreateTeamFormData = z.infer<typeof CreateTeamSchema>;

const CreateTeam = () => {
	const router = useRouter();
	const env = useEnv();
	const {
		address,
		getSigningCosmWasmClient,
		chain: { chain_id },
	} = useChain(env.CHAIN);
	const { addTeam } = useTeamStore();

	const teamImageRef = useRef<ImageUploaderRef>(null);
	const bannerImageRef = useRef<ImageUploaderRef>(null);

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<CreateTeamFormData>({
		resolver: zodResolver(CreateTeamSchema),
		defaultValues: {
			teamName: "",
			description: "",
			teamImageUrl: "",
			bannerUrl: "",
			members: [{ addr: address || "" }, { addr: "" }],
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "members",
	});

	const description = watch("description");

	const onSubmit = async (data: CreateTeamFormData) => {
		try {
			if (!address) {
				throw Error("Wallet must be connected");
			}

			addToast({
				color: "primary",
				description: "Creating your team...",
			});

			const [teamImageUrl, bannerUrl] = await Promise.all([
				teamImageRef.current?.uploadToS3(),
				bannerImageRef.current?.uploadToS3(),
			]);

			const cosmWasmClient = await getSigningCosmWasmClient();
			const result = await cosmWasmClient.instantiate(
				address,
				env.CODE_ID_DAO_CORE,
				{
					admin: env.ARENA_DAO_ADDRESS, // Set this to help process any locked teams
					automatically_add_cw20s: true,
					automatically_add_cw721s: true,
					description: data.description,
					image_url: teamImageUrl,
					name: data.teamName,
					initial_items: bannerUrl
						? [{ key: "banner", value: bannerUrl }]
						: undefined,
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

	return (
		<div className="container mx-auto max-w-4xl p-4">
			<Card className="border-default-100">
				<CardHeader className="flex flex-col items-center space-y-4 pt-8 pb-8">
					<div className="flex items-center justify-center space-x-2">
						<h1 className="font-bold font-cinzel text-3xl">Create Your Team</h1>
						<Tooltip content="A team allows you to participate in competitions with multiple members">
							<Button
								isIconOnly
								variant="light"
								size="sm"
								className="cursor-help"
							>
								<Info size={18} />
							</Button>
						</Tooltip>
					</div>
					<p className="text-center text-default-500">
						Create a team to participate in competitions with friends and manage
						shared assets
					</p>
				</CardHeader>

				<form onSubmit={handleSubmit(onSubmit)}>
					<CardBody className="p-8">
						<div className="space-y-10">
							{/* Team Identity and Branding Section */}
							<div>
								<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
									{/* Left Column - Team Identity */}
									<div className="space-y-6">
										<div className="mb-6 flex items-center">
											<div className="mr-2 h-6 w-1 rounded bg-primary" />
											<Shield size={20} className="mr-2 text-primary" />
											<h2 className="font-semibold text-xl">Team Identity</h2>
										</div>

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
													minRows={5}
													classNames={{
														input: "resize-none",
													}}
													description={`${description?.length || 0}/500 characters`}
												/>
											)}
										/>
									</div>

									{/* Right Column - Team Branding */}
									<div className="space-y-6">
										<div className="mb-6 flex items-center">
											<div className="mr-2 h-6 w-1 rounded bg-primary" />
											<ImageIcon size={20} className="mr-2 text-primary" />
											<h2 className="font-semibold text-xl">Team Branding</h2>
										</div>

										<Controller
											name="teamImageUrl"
											control={control}
											render={({ field, fieldState }) => (
												<div className="mb-6">
													<ImageUploader
														field={field}
														error={fieldState.error}
														label="Team Logo"
														startContent={
															<ImageIcon
																size={16}
																className="text-default-400"
															/>
														}
														ref={teamImageRef}
														description="Square image recommended"
													/>
													{field.value && (
														<div className="mt-2 h-16 w-16 rounded-md border border-default-200 p-1">
															<img
																src={field.value}
																alt="Team logo preview"
																className="h-full w-full rounded object-cover"
															/>
														</div>
													)}
												</div>
											)}
										/>

										<Controller
											name="bannerUrl"
											control={control}
											render={({ field, fieldState }) => (
												<div>
													<ImageUploader
														field={field}
														error={fieldState.error}
														label="Banner Image"
														startContent={
															<ImageIcon
																size={16}
																className="text-default-400"
															/>
														}
														ref={bannerImageRef}
														description="16:9 ratio recommended for banners"
													/>
													{field.value && (
														<div className="mt-2 h-28 w-full rounded-md border border-default-200 p-1">
															<img
																src={field.value}
																alt="Banner preview"
																className="h-full w-full rounded object-cover"
															/>
														</div>
													)}
												</div>
											)}
										/>
									</div>
								</div>
							</div>

							<Divider />

							{/* Team Members Section */}
							<div>
								<div className="mb-6 flex items-center justify-between">
									<div className="flex items-center">
										<div className="mr-2 h-6 w-1 rounded bg-primary" />
										<Users size={20} className="mr-2 text-primary" />
										<h2 className="mr-3 font-semibold text-xl">Team Members</h2>
										<div className="rounded-md border border-warning-200 bg-warning-50 px-2 py-0.5 text-warning-600 text-xs">
											Min. 2 required
										</div>
									</div>

									<Button
										color="primary"
										variant="flat"
										onPress={handleAddMember}
										isDisabled={isSubmitting}
										startContent={<PlusCircle size={18} />}
									>
										Add Member
									</Button>
								</div>

								<Card className="border border-default-200">
									<Table aria-label="Team members table" removeWrapper>
										<TableHeader>
											<TableColumn>MEMBER ADDRESS</TableColumn>
											<TableColumn width={100}>ACTIONS</TableColumn>
										</TableHeader>
										<TableBody
											emptyContent={
												<div className="py-8 text-center text-default-500">
													<Users size={40} className="mx-auto mb-2" />
													<p>No members added. Add at least two members.</p>
												</div>
											}
										>
											{fields.map((field, index) => (
												<TableRow key={field.id} className="h-20">
													<TableCell>
														{index === 0 && address ? (
															<div className="flex items-center space-x-2">
																<Profile address={address} />
																<span className="text-default-500 text-xs">
																	(You)
																</span>
															</div>
														) : (
															<Controller
																name={`members.${index}.addr`}
																control={control}
																render={({ field }) => (
																	<ProfileInput
																		label=""
																		field={field}
																		error={errors.members?.[index]?.addr}
																		isRequired
																		isDisabled={isSubmitting}
																		emptyTeams
																	/>
																)}
															/>
														)}
													</TableCell>
													<TableCell className="align-top">
														{index === 0 && address ? (
															<div className="w-10" />
														) : (
															<Button
																isIconOnly
																variant="light"
																color="danger"
																onPress={() => remove(index)}
																isDisabled={isSubmitting || fields.length <= 2}
																aria-label="Remove member"
															>
																<Trash size={18} />
															</Button>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Card>

								{errors.members?.root && (
									<div className="mt-4 flex items-center gap-2 rounded-lg bg-danger-50 p-4 text-danger">
										<HelpCircle size={18} />
										<p className="text-sm">{errors.members.root.message}</p>
									</div>
								)}

								<div className="mt-6 rounded-xl border border-default-200 bg-default-50 p-4">
									<div className="flex items-start gap-3">
										<CalendarDays size={20} className="mt-1 text-primary" />
										<div>
											<h3 className="font-medium text-md">Team Governance</h3>
											<p className="mt-1 text-default-500 text-sm">
												Your team will be created as a DAO with equal voting
												power for all members. Decisions will require all
												members to agree within 24-hours.
											</p>
											<div className="mt-2 flex items-center text-primary text-sm">
												<Link
													href={`${env.DAO_DAO_URL}/dao/create?chain=${chain_id}`}
													isExternal
													className="flex items-center"
													showAnchorIcon
													anchorIcon={
														<ExternalLink size={14} className="ml-1" />
													}
												>
													Need more customization options? Visit DAO DAO
												</Link>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardBody>

					<CardFooter className="flex justify-end gap-2 border-t px-6 py-6">
						<Button
							type="submit"
							color="primary"
							isLoading={isSubmitting}
							isDisabled={isSubmitting}
							size="lg"
							className="min-w-32"
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
