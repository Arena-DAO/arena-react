"use client";

import Profile from "@/components/Profile";
import TokenInfo from "@/components/TokenInfo";
import { coins } from "@cosmjs/amino";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
	Textarea,
	Tooltip,
	useDisclosure,
} from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FiCheck, FiEdit, FiEye, FiPlus, FiTrash, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import {
	ArenaTokenGatewayClient,
	ArenaTokenGatewayQueryClient,
} from "~/codegen/ArenaTokenGateway.client";
import {
	arenaTokenGatewayQueryKeys,
	useArenaTokenGatewayAcceptApplicationMutation,
	useArenaTokenGatewayApplicationsQuery,
	useArenaTokenGatewayApplyMutation,
	useArenaTokenGatewayRejectApplicationMutation,
	useArenaTokenGatewayUpdateMutation,
	useArenaTokenGatewayVestingConfigurationQuery,
	useArenaTokenGatewayWithdrawMutation,
} from "~/codegen/ArenaTokenGateway.react-query";
import type {
	ApplicationResponse,
	ApplicationStatus,
	ArrayOfApplicationResponse,
} from "~/codegen/ArenaTokenGateway.types";
import { getApplicationStatusName } from "~/helpers/ArenaHelpers";
import { getBaseToken, getDisplayToken } from "~/helpers/TokenHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useToken } from "~/hooks/useToken";

const applicationSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	requestedAmount: z.string().min(1, "Requested amount is required"),
	projectLinks: z
		.array(
			z.object({
				title: z.string().min(1, "Link title is required"),
				url: z.string().url("Invalid URL"),
			}),
		)
		.min(1, "At least one project link is required"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const ArenaTokenGatewayPage: React.FC = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();
	const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>({
		pending: {},
	});
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedApplication, setSelectedApplication] =
		useState<ApplicationResponse | null>(null);
	const [isViewMode, setIsViewMode] = useState(false);
	const { data: govToken } = useToken(
		env.ARENA_ABC_SUPPLY_DENOM,
		true,
		env.CHAIN,
	);

	const { data: applications } = useArenaTokenGatewayApplicationsQuery({
		client:
			cosmWasmClient &&
			new ArenaTokenGatewayQueryClient(
				cosmWasmClient,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			),
		args: { filter: { status: selectedStatus } },
		options: { enabled: !!cosmWasmClient },
	});

	const { data: userApplications } = useArenaTokenGatewayApplicationsQuery({
		client:
			cosmWasmClient &&
			new ArenaTokenGatewayQueryClient(
				cosmWasmClient,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			),
		args: { filter: { applicant: address || "" } },
		options: { enabled: !!cosmWasmClient && !!address },
	});

	const { data: vestingConfig } = useArenaTokenGatewayVestingConfigurationQuery(
		{
			client:
				cosmWasmClient &&
				new ArenaTokenGatewayQueryClient(
					cosmWasmClient,
					env.ARENA_TOKEN_GATEWAY_ADDRESS,
				),
			options: { enabled: !!cosmWasmClient },
		},
	);

	const applyMutation = useArenaTokenGatewayApplyMutation();
	const updateMutation = useArenaTokenGatewayUpdateMutation();
	const withdrawMutation = useArenaTokenGatewayWithdrawMutation();
	const acceptMutation = useArenaTokenGatewayAcceptApplicationMutation();
	const rejectMutation = useArenaTokenGatewayRejectApplicationMutation();

	const isDAOAddress = useMemo(
		() => address === env.ARENA_DAO_ADDRESS,
		[address, env.ARENA_DAO_ADDRESS],
	);

	const { control, handleSubmit, reset, setValue } =
		useForm<ApplicationFormValues>({
			resolver: zodResolver(applicationSchema),
			defaultValues: {
				title: "",
				description: "",
				requestedAmount: "",
				projectLinks: [{ title: "", url: "" }],
			},
		});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "projectLinks",
	});

	const onSubmit = async (data: ApplicationFormValues) => {
		try {
			if (!address) throw new Error("Address not found");
			if (!govToken) throw new Error("Governance token not found");
			const client = await getSigningCosmWasmClient();
			const tokenGatewayClient = new ArenaTokenGatewayClient(
				client,
				address,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			);

			const requestedAmount = getBaseToken(
				{ denom: govToken.display, amount: data.requestedAmount },
				govToken,
			).amount;

			const applicationInfo = {
				title: data.title,
				description: data.description,
				requested_amount: requestedAmount,
				project_links: data.projectLinks,
			};

			if (selectedApplication) {
				await updateMutation.mutateAsync(
					{
						client: tokenGatewayClient,
						msg: {
							applicationId: selectedApplication.application_id,
							applicationInfo,
						},
					},
					{
						onSuccess: () => {
							queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ filter: { status: selectedStatus } },
								),
								(oldData) => {
									if (!oldData) return oldData;
									return oldData.map((app) =>
										app.application_id === selectedApplication.application_id
											? {
													...app,
													application: {
														...app.application,
														...applicationInfo,
													},
												}
											: app,
									);
								},
							);
							queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ filter: { applicant: address } },
								),
								(oldData) => {
									if (!oldData) return oldData;
									return oldData.map((app) =>
										app.application_id === selectedApplication.application_id
											? {
													...app,
													application: {
														...app.application,
														...applicationInfo,
													},
												}
											: app,
									);
								},
							);
							toast.success("Application updated successfully");
						},
					},
				);
			} else {
				await applyMutation.mutateAsync(
					{ client: tokenGatewayClient, msg: applicationInfo },
					{
						onSuccess: (result) => {
							const applicationId = result.events
								.find((event) => event.type === "wasm")
								?.attributes.find(
									(attr) => attr.key === "application_id",
								)?.value;

							if (!applicationId) {
								console.error("Could not find application_id in response");
								return;
							}

							const newApplication: ApplicationResponse = {
								application_id: applicationId,
								application: {
									...applicationInfo,
									applicant: address,
									status: { pending: {} },
								},
							};

							queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ filter: { status: { pending: {} } } },
								),
								(oldData) => {
									if (!oldData) return [newApplication];
									return [...oldData, newApplication];
								},
							);
							queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ filter: { applicant: address } },
								),
								(oldData) => {
									if (!oldData) return [newApplication];
									return [...oldData, newApplication];
								},
							);
							toast.success("Application submitted successfully");
						},
					},
				);
			}

			onClose();
			reset();
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const handleOpenModal = (
		application?: ApplicationResponse,
		viewMode = false,
	) => {
		setIsViewMode(viewMode);
		if (application) {
			if (!govToken) throw new Error("Governance token not found");

			const requestedAmount = getDisplayToken(
				{
					denom: govToken.base,
					amount: application.application.requested_amount,
				},
				govToken,
			).amount;

			setSelectedApplication(application);
			setValue("title", application.application.title);
			setValue("description", application.application.description);
			setValue("requestedAmount", requestedAmount);
			setValue("projectLinks", application.application.project_links);
		} else {
			setSelectedApplication(null);
			reset();
		}
		onOpen();
	};

	const handleWithdraw = async (applicationId: string) => {
		try {
			if (!address) throw new Error("Address not found");
			const client = await getSigningCosmWasmClient();
			const tokenGatewayClient = new ArenaTokenGatewayClient(
				client,
				address,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			);

			await withdrawMutation.mutateAsync(
				{
					client: tokenGatewayClient,
					msg: { applicationId },
				},
				{
					onSuccess: () => {
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { applicant: address } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.filter(
									(app) => app.application_id !== applicationId,
								);
							},
						);
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { status: { pending: {} } } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.filter(
									(app) => app.application_id !== applicationId,
								);
							},
						);
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { status: { rejected: {} } } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.filter(
									(app) => app.application_id !== applicationId,
								);
							},
						);

						toast.success("Application withdrawn successfully");
						onClose();
						setSelectedApplication(null);
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const handleAccept = async (
		applicationId: string,
		requestedAmount: string,
	) => {
		try {
			if (!address) throw new Error("Address not found");

			const client = await getSigningCosmWasmClient();
			const tokenGatewayClient = new ArenaTokenGatewayClient(
				client,
				address,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			);

			await acceptMutation.mutateAsync(
				{
					client: tokenGatewayClient,
					msg: { applicationId },
					args: {
						funds: coins(requestedAmount, env.ARENA_ABC_SUPPLY_DENOM),
					},
				},
				{
					onSuccess: () => {
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { status: { pending: {} } } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.map((app) =>
									app.application_id === applicationId
										? {
												...app,
												application: {
													...app.application,
													status: { accepted: {} },
												},
											}
										: app,
								);
							},
						);
						toast.success("Application accepted successfully");
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const [rejectReason, setRejectReason] = useState("");
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [applicationToReject, setApplicationToReject] = useState<string | null>(
		null,
	);

	const handleReject = async (applicationId: string) => {
		try {
			if (!address) throw new Error("Address not found");

			const client = await getSigningCosmWasmClient();
			const tokenGatewayClient = new ArenaTokenGatewayClient(
				client,
				address,
				env.ARENA_TOKEN_GATEWAY_ADDRESS,
			);

			await rejectMutation.mutateAsync(
				{
					client: tokenGatewayClient,
					msg: { applicationId, reason: rejectReason },
				},
				{
					onSuccess: () => {
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { status: { pending: {} } } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.filter(
									(app) => app.application_id !== applicationId,
								);
							},
						);
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ filter: { status: { rejected: {} } } },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.map((app) =>
									app.application_id === applicationId
										? {
												...app,
												application: {
													...app.application,
													status: { rejected: { reason: rejectReason } },
												},
											}
										: app,
								);
							},
						);
						toast.success("Application rejected successfully");
						setIsRejectModalOpen(false);
						setRejectReason("");
						setApplicationToReject(null);
					},
				},
			);
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const renderApplicationTable = (
		apps: ArrayOfApplicationResponse | undefined,
	) => (
		<Table aria-label="Applications table" removeWrapper>
			<TableHeader>
				<TableColumn>Title</TableColumn>
				<TableColumn>Applicant</TableColumn>
				<TableColumn>Requested Amount</TableColumn>
				<TableColumn>Status</TableColumn>
				<TableColumn>Actions</TableColumn>
			</TableHeader>
			<TableBody items={apps || []} emptyContent={"No applications found"}>
				{(app) => (
					<TableRow key={app.application_id}>
						<TableCell>{app.application.title}</TableCell>
						<TableCell>
							<Profile address={app.application.applicant} />
						</TableCell>
						<TableCell>
							<TokenInfo
								denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
								isNative
								amount={app.application.requested_amount}
							/>
						</TableCell>
						<TableCell>
							{getApplicationStatusName(app.application.status)}
						</TableCell>
						<TableCell>
							<div className="flex gap-2">
								<Tooltip content="View">
									<Button
										isIconOnly
										size="sm"
										variant="light"
										onPress={() => handleOpenModal(app, true)}
									>
										<FiEye />
									</Button>
								</Tooltip>
								{app.application.applicant === address &&
									!("accepted" in app.application.status) && (
										<Tooltip content="Edit">
											<Button
												isIconOnly
												size="sm"
												variant="light"
												onPress={() => handleOpenModal(app, false)}
											>
												<FiEdit />
											</Button>
										</Tooltip>
									)}
								{isDAOAddress && "pending" in app.application.status && (
									<>
										<Tooltip content="Accept">
											<Button
												isIconOnly
												size="sm"
												color="success"
												variant="flat"
												onPress={() =>
													handleAccept(
														app.application_id,
														app.application.requested_amount,
													)
												}
												isLoading={acceptMutation.isLoading}
											>
												<FiCheck />
											</Button>
										</Tooltip>
										<Tooltip content="Reject">
											<Button
												isIconOnly
												size="sm"
												color="danger"
												variant="flat"
												onPress={() => {
													setApplicationToReject(app.application_id);
													setIsRejectModalOpen(true);
												}}
												isLoading={rejectMutation.isLoading}
											>
												<FiX />
											</Button>
										</Tooltip>
									</>
								)}
							</div>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);

	return (
		<div className="container mx-auto space-y-6 p-4">
			<h1 className="font-bold text-3xl">Arena Token Gateway</h1>
			{vestingConfig && (
				<p className="text-lg">
					This area is designed for managing applications for DAO membership.
					Successful applicants will receive{" "}
					{Number(vestingConfig.upfront_ratio) * 100}% of their tokens upfront,
					with the remaining {(1 - Number(vestingConfig.upfront_ratio)) * 100}%
					vested linearly over a period of{" "}
					{vestingConfig.vesting_time / (24 * 60 * 60)} days.
				</p>
			)}

			{address && !isDAOAddress && (
				<Card>
					<CardHeader className="flex items-center justify-between">
						<h2 className="text-2xl">Your Applications</h2>
						<Button
							color="primary"
							onPress={() => handleOpenModal()}
							startContent={<FiPlus />}
						>
							New Application
						</Button>
					</CardHeader>
					<CardBody>{renderApplicationTable(userApplications)}</CardBody>
				</Card>
			)}

			<Card>
				<CardHeader className="block items-center justify-between sm:flex">
					<h2 className="text-2xl">All Applications</h2>
					<Tabs
						aria-label="Application Status"
						selectedKey={getApplicationStatusName(selectedStatus)}
						onSelectionChange={(key) => {
							setSelectedStatus(
								key === "Pending"
									? { pending: {} }
									: key === "Accepted"
										? { accepted: {} }
										: { rejected: {} },
							);
						}}
					>
						<Tab key="Pending" title="Pending" />
						<Tab key="Accepted" title="Accepted" />
						<Tab key="Rejected" title="Rejected" />
					</Tabs>
				</CardHeader>
				<CardBody>{renderApplicationTable(applications)}</CardBody>
			</Card>

			<Modal isOpen={isOpen} onClose={onClose} size="2xl">
				<ModalContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<ModalHeader>
							{isViewMode
								? "View Application"
								: selectedApplication
									? "Edit Application"
									: "New Application"}
						</ModalHeader>
						<ModalBody>
							<Controller
								name="title"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<Input
										{...field}
										label="Title"
										placeholder="Enter application title"
										isInvalid={!!error}
										errorMessage={error?.message}
										isReadOnly={isViewMode}
									/>
								)}
							/>
							<Controller
								name="description"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<Textarea
										{...field}
										label="Description"
										placeholder="Enter application description"
										isInvalid={!!error}
										errorMessage={error?.message}
										isReadOnly={isViewMode}
									/>
								)}
							/>
							<Controller
								name="requestedAmount"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<Input
										{...field}
										label="Requested Amount"
										placeholder="Enter requested amount"
										isInvalid={!!error}
										errorMessage={error?.message}
										isReadOnly={isViewMode}
										endContent={
											<div className="my-auto">
												<TokenInfo
													denomOrAddress={env.ARENA_ABC_SUPPLY_DENOM}
													isNative
												/>
											</div>
										}
									/>
								)}
							/>
							<div className="space-y-2">
								<label className="font-medium text-sm" htmlFor="projectLinks">
									Project Links
								</label>
								{fields.map((field, index) => (
									<div key={field.id} className="flex gap-2">
										<Controller
											name={`projectLinks.${index}.title`}
											control={control}
											render={({ field, fieldState: { error } }) => (
												<Input
													{...field}
													placeholder="Link title"
													isInvalid={!!error}
													errorMessage={error?.message}
													isReadOnly={isViewMode}
												/>
											)}
										/>
										<Controller
											name={`projectLinks.${index}.url`}
											control={control}
											render={({ field, fieldState: { error } }) => (
												<Input
													{...field}
													placeholder="Link URL"
													isInvalid={!!error}
													errorMessage={error?.message}
													isReadOnly={isViewMode}
												/>
											)}
										/>
										{!isViewMode && (
											<Button
												isIconOnly
												color="danger"
												variant="light"
												onPress={() => remove(index)}
											>
												<FiTrash />
											</Button>
										)}
									</div>
								))}
								{!isViewMode && (
									<Button
										size="sm"
										variant="flat"
										onPress={() => append({ title: "", url: "" })}
										startContent={<FiPlus />}
									>
										Add Link
									</Button>
								)}
							</div>
							{isViewMode &&
								selectedApplication &&
								"rejected" in selectedApplication.application.status && (
									<div className="mt-4">
										<h3 className="font-semibold text-lg">Rejection Reason</h3>
										<p className="mt-1">
											{selectedApplication.application.status.rejected.reason ||
												"No reason provided"}
										</p>
									</div>
								)}
						</ModalBody>
						<ModalFooter>
							<Button color="danger" variant="light" onPress={onClose}>
								{isViewMode ? "Close" : "Cancel"}
							</Button>
							{!isViewMode &&
								selectedApplication &&
								!("accepted" in selectedApplication.application.status) && (
									<Button
										color="warning"
										variant="flat"
										onPress={() =>
											handleWithdraw(selectedApplication.application_id)
										}
									>
										Withdraw
									</Button>
								)}
							{!isViewMode && (
								<Button
									color="primary"
									type="submit"
									isLoading={
										updateMutation.isLoading || applyMutation.isLoading
									}
								>
									{selectedApplication ? "Update" : "Submit"}
								</Button>
							)}
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>
			<Modal
				isOpen={isRejectModalOpen}
				onClose={() => setIsRejectModalOpen(false)}
			>
				<ModalContent>
					<ModalHeader>Reject Application</ModalHeader>
					<ModalBody>
						<Textarea
							label="Rejection Reason"
							placeholder="Enter the reason for rejection"
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="danger"
							variant="light"
							onPress={() => setIsRejectModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={() =>
								applicationToReject && handleReject(applicationToReject)
							}
							isLoading={rejectMutation.isLoading}
						>
							Reject
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ArenaTokenGatewayPage;
