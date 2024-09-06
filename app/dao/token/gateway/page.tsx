"use client";

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
import { FiCheck, FiEdit, FiEye, FiPlus, FiTrash } from "react-icons/fi";
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
	useArenaTokenGatewayUpdateMutation,
	useArenaTokenGatewayWithdrawMutation,
} from "~/codegen/ArenaTokenGateway.react-query";
import type {
	ApplicationInfo,
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
		useState<ApplicationInfo | null>(null);
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
		args: { status: selectedStatus },
		options: { enabled: !!cosmWasmClient },
	});

	const applyMutation = useArenaTokenGatewayApplyMutation();
	const updateMutation = useArenaTokenGatewayUpdateMutation();
	const withdrawMutation = useArenaTokenGatewayWithdrawMutation();
	const acceptMutation = useArenaTokenGatewayAcceptApplicationMutation();

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

			const msg = {
				title: data.title,
				description: data.description,
				requestedAmount,
				projectLinks: data.projectLinks,
			};

			if (selectedApplication) {
				await updateMutation.mutateAsync(
					{ client: tokenGatewayClient, msg },
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ status: { pending: {} } },
								),
							);
							toast.success("Application updated successfully");
						},
					},
				);
			} else {
				await applyMutation.mutateAsync(
					{ client: tokenGatewayClient, msg },
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries(
								arenaTokenGatewayQueryKeys.applications(
									env.ARENA_TOKEN_GATEWAY_ADDRESS,
									{ status: { pending: {} } },
								),
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

	const handleOpenModal = (application?: ApplicationInfo, viewMode = false) => {
		setIsViewMode(viewMode);
		if (application) {
			if (!govToken) throw new Error("Governance token not found");

			const requestedAmount = getDisplayToken(
				{ denom: govToken.base, amount: application.requested_amount },
				govToken,
			).amount;

			setSelectedApplication(application);
			setValue("title", application.title);
			setValue("description", application.description);
			setValue("requestedAmount", requestedAmount);
			setValue("projectLinks", application.project_links);
		} else {
			setSelectedApplication(null);
			reset();
		}
		onOpen();
	};

	const handleWithdraw = async () => {
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
				},
				{
					onSuccess: async () => {
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ status: selectedStatus },
							),
							(oldData) => {
								if (!oldData) return oldData;
								return oldData.filter((app) => app.applicant !== address);
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

	const handleAccept = async (applicant: string, requestedAmount: string) => {
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
					msg: { applicant },
					args: {
						funds: coins(requestedAmount, env.ARENA_ABC_SUPPLY_DENOM),
					},
				},
				{
					onSuccess: () => {
						// Update the cache to move the application from pending to accepted
						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ status: { pending: {} } },
							),
							(oldData) =>
								oldData?.filter((app) => app.applicant !== applicant),
						);

						queryClient.setQueryData<ArrayOfApplicationResponse | undefined>(
							arenaTokenGatewayQueryKeys.applications(
								env.ARENA_TOKEN_GATEWAY_ADDRESS,
								{ status: { accepted: {} } },
							),
							(oldData) => {
								const acceptedApp = oldData?.find(
									(app) => app.applicant === applicant,
								);
								if (acceptedApp) {
									return [
										...(oldData || []),
										{
											...acceptedApp,
											application: {
												...acceptedApp.application,
												status: { accepted: {} },
											},
										},
									];
								}
								return oldData;
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

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-6 font-bold text-3xl">Arena Token Gateway</h1>
			<p className="mb-6 text-lg">
				This area is designed for managing applications for DAO membership.
				Successful applicants will receive 20% of their tokens upfront, with the
				remaining 80% vested linearly over a period of 1 year.
			</p>
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

			<Card className="mt-6">
				<CardHeader className="flex items-center justify-between">
					<h2 className="text-2xl">Applications</h2>
					<Button
						color="primary"
						onPress={() => handleOpenModal()}
						startContent={<FiPlus />}
					>
						New Application
					</Button>
				</CardHeader>
				<CardBody>
					<Table aria-label="Applications table" removeWrapper>
						<TableHeader>
							<TableColumn>Title</TableColumn>
							<TableColumn>Requested Amount</TableColumn>
							<TableColumn>Status</TableColumn>
							<TableColumn>Actions</TableColumn>
						</TableHeader>
						<TableBody
							items={applications || []}
							emptyContent={"No applications found"}
						>
							{(app) => (
								<TableRow key={app.applicant}>
									<TableCell>{app.application.title}</TableCell>
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
													onPress={() => handleOpenModal(app.application, true)}
												>
													<FiEye />
												</Button>
											</Tooltip>
											{app.applicant === address && (
												<Tooltip content="Edit">
													<Button
														isIconOnly
														size="sm"
														variant="light"
														onPress={() =>
															handleOpenModal(app.application, false)
														}
													>
														<FiEdit />
													</Button>
												</Tooltip>
											)}
											{isDAOAddress && "pending" in app.application.status && (
												<Tooltip content="Accept">
													<Button
														isIconOnly
														size="sm"
														color="success"
														variant="flat"
														onPress={() =>
															handleAccept(
																app.applicant,
																app.application.requested_amount,
															)
														}
													>
														<FiCheck />
													</Button>
												</Tooltip>
											)}
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardBody>
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
								<label className="font-medium text-sm">Project Links</label>
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
						</ModalBody>
						<ModalFooter>
							<Button color="danger" variant="light" onPress={onClose}>
								{isViewMode ? "Close" : "Cancel"}
							</Button>
							{!isViewMode && selectedApplication && (
								<Button color="warning" variant="flat" onPress={handleWithdraw}>
									Withdraw
								</Button>
							)}
							{!isViewMode && (
								<Button color="primary" type="submit">
									{selectedApplication ? "Update" : "Submit"}
								</Button>
							)}
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>
		</div>
	);
};

export default ArenaTokenGatewayPage;
