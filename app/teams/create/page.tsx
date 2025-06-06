// app/teams/create/page.tsx
"use client";

import ImageUploader from "@/components/ImageUpload";
import type { ImageUploaderRef } from "@/components/ImageUpload";
import { useChain } from "@cosmos-kit/react";
import {
	Alert,
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Link,
	Select,
	SelectItem,
	Spinner,
	Textarea,
	addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	ChevronRight,
	Clock,
	ExternalLink,
	Image as ImageIcon,
	Shield,
	Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ArenaTeamEnrollmentsClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsCreateEntryMutation } from "~/codegen/ArenaTeamEnrollments.react-query";
import type { TeamDaoConfig } from "~/codegen/ArenaTeamEnrollments.types";
import { type CategoryItem, useCategoryMap } from "~/hooks/useCategoryMap";
import { useEnv } from "~/hooks/useEnv";

// Zod schema for form validation - aligned with actual usage
const createTeamSchema = z.object({
	title: z
		.string()
		.min(3, "Team title must be at least 3 characters")
		.max(100, "Team title must be less than 100 characters")
		.trim(),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description must be less than 1000 characters")
		.trim(),
	daoName: z
		.string()
		.min(3, "DAO name must be at least 3 characters")
		.max(50, "DAO name must be less than 50 characters")
		.trim()
		.optional(),
	daoDescription: z
		.string()
		.min(10, "DAO description must be at least 10 characters")
		.max(500, "DAO description must be less than 500 characters")
		.trim()
		.optional(),
	teamImageUrl: z.string().optional(),
	votingPeriodDays: z
		.number()
		.min(1, "Voting period must be at least 1 day")
		.max(30, "Voting period cannot exceed 30 days")
		.default(1),
	approvalThreshold: z
		.number()
		.min(50, "Threshold must be at least 50%")
		.max(100, "Threshold cannot exceed 100%")
		.default(100),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

// Preset options for common configurations
const VOTING_PERIOD_OPTIONS = [
	{ value: 1, label: "1 Day", description: "Quick decisions" },
	{ value: 3, label: "3 Days", description: "Standard period" },
	{ value: 7, label: "1 Week", description: "Extended discussion" },
	{ value: 14, label: "2 Weeks", description: "Major decisions" },
];

const THRESHOLD_OPTIONS = [
	{
		value: 100,
		label: "100%",
		description: "Unanimous (Recommended for new teams)",
	},
	{ value: 75, label: "75%", description: "Super majority" },
	{ value: 66, label: "66%", description: "Two-thirds majority" },
	{ value: 51, label: "51%", description: "Simple majority" },
];

const CreateTeamEnrollment = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categoryParam = searchParams?.get("category") || "";
	const { data: categories } = useCategoryMap();
	const env = useEnv();
	const { address: walletAddress, getSigningCosmWasmClient } = useChain(env.CHAIN);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const teamImageRef = useRef<ImageUploaderRef>(null);

	const categoryItem = useMemo(() => {
		const category = categories.get(categoryParam);
		if (category && "category_id" in category) return category;
		return undefined;
	}, [categoryParam, categories]);

	const breadcrumbItems: CategoryItem[] = useMemo(() => {
		if (!categoryItem) return [];

		const result = [];
		let currentItem: CategoryItem | undefined = categoryItem;

		while (currentItem) {
			result.unshift(currentItem);
			currentItem = currentItem.parent_url ? categories.get(currentItem.parent_url) : undefined;
		}

		result.unshift({ title: "Categories", url: "", children: [], img: "" });
		return result;
	}, [categoryItem, categories]);

	const { mutateAsync: createEntry } = useArenaTeamEnrollmentsCreateEntryMutation();

	const {
		control,
		register,
		handleSubmit,
		watch,
		formState: { errors, isValid },
	} = useForm<CreateTeamForm>({
		resolver: zodResolver(createTeamSchema),
		defaultValues: {
			title: "",
			description: "",
			daoName: "",
			daoDescription: "",
			teamImageUrl: "",
			votingPeriodDays: 1, // Default to 1 day
			approvalThreshold: 100, // Default to 100% (unanimous)
		},
		mode: "onChange",
	});

	// Watch form values for dynamic descriptions
	const watchVotingPeriod = watch("votingPeriodDays");
	const watchThreshold = watch("approvalThreshold");

	const onSubmit = async (data: CreateTeamForm) => {
		if (!walletAddress || !categoryItem) return;

		setIsSubmitting(true);
		try {
			addToast({
				color: "primary",
				description: "Creating your team enrollment...",
			});

			// Upload team image if provided
			const teamImageUrl = await teamImageRef.current?.uploadToS3();

			// Create DAO config with form data
			const daoConfig: TeamDaoConfig = {
				dao_code_id: env.CODE_ID_DAO_CORE,
				cw4_voting_code_id: env.CODE_ID_CW4_VOTING,
				proposal_single_code_id: env.CODE_ID_DAO_PROPOSAL_SINGLE,
				prepropose_single_code_id: env.CODE_ID_DAO_PREPROPOSE_SINGLE,
				max_voting_period: {
					time: data.votingPeriodDays * 24 * 60 * 60, // Convert days to seconds
				},
				threshold: {
					absolute_percentage: {
						percentage: {
							percent: (data.approvalThreshold / 100).toString(),
						},
					},
				},
				image_url: teamImageUrl,
				cw4_group_code_id: env.CODE_ID_CW4_GROUP,
				dao_name: data.daoName || undefined,
				dao_description: data.daoDescription || undefined,
			};

			const client = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				client,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS
			);

			await createEntry({
				client: enrollmentClient,
				msg: {
					title: data.title,
					description: data.description,
					categoryId: categoryItem.category_id?.toString() || undefined,
					daoConfig,
				},
			});

			addToast({
				color: "success",
				description: "Team enrollment created successfully!",
			});

			// Navigate back to the teams page for this category
			router.push(`/teams?category=${categoryParam}`);
		} catch (error) {
			console.error("Error creating team enrollment:", error);
			addToast({
				color: "danger",
				description: (error as Error).message || "Failed to create team enrollment",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!categoryItem) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!walletAddress) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardBody className="flex flex-col items-center gap-4 p-8 md:p-12">
						<h1 className="text-center font-bold text-3xl md:text-4xl">Wallet Required</h1>
						<p className="text-center opacity-80">
							Please connect your wallet to create a team enrollment.
						</p>
						<Button
							as={Link}
							href={`/teams?category=${categoryParam}`}
							variant="bordered"
							startContent={<ArrowLeft />}
							className="mt-4"
						>
							Back to Team Enrollments
						</Button>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
			<div className="container mx-auto max-w-4xl space-y-6 px-4 py-6 md:space-y-8 md:py-8">
				{/* Header Section */}
				<div className="flex flex-col gap-4 md:gap-6">
					<Breadcrumbs
						separator={<ChevronRight className="opacity-50" size={16} />}
						className="ml-1 overflow-x-auto"
					>
						{breadcrumbItems.map((item) => (
							<BreadcrumbItem
								key={item.title}
								href={item.url ? `/compete?category=${item.url}` : "/compete"}
							>
								{item.title}
							</BreadcrumbItem>
						))}
						<BreadcrumbItem href={`/teams?category=${categoryParam}`}>
							Team Enrollments
						</BreadcrumbItem>
						<BreadcrumbItem>Create</BreadcrumbItem>
					</Breadcrumbs>

					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<Button
								as={Link}
								href={`/teams?category=${categoryParam}`}
								variant="light"
								startContent={<ArrowLeft size={18} />}
								className="mb-2"
							>
								Back to Team Enrollments
							</Button>
							<h1 className="font-bold text-2xl md:text-3xl">Create Team Enrollment</h1>
							<p className="mt-1 opacity-70">{categoryItem.title} • Team Formation</p>
						</div>
					</div>
				</div>

				{/* Create Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader className="px-6 py-4">
							<div className="flex items-center gap-2">
								<Users size={20} className="text-primary" />
								<h2 className="font-bold text-xl">Team Information</h2>
							</div>
						</CardHeader>
						<CardBody className="space-y-6 px-6 py-4">
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
								{/* Left Column - Team Logo */}
								<div className="lg:col-span-1">
									<Controller
										name="teamImageUrl"
										control={control}
										render={({ field, fieldState }) => (
											<div className="space-y-4">
												<ImageUploader
													field={field}
													error={fieldState.error}
													label="Team Logo"
													startContent={<ImageIcon size={16} className="text-default-400" />}
													ref={teamImageRef}
													description="Square image recommended for best results"
												/>
												{field.value && (
													<div className="flex justify-center">
														<div className="h-24 w-24 rounded-xl border-2 border-default-200 bg-default-50 p-1">
															<img
																src={field.value}
																alt="Team logo preview"
																className="h-full w-full rounded-lg object-cover"
															/>
														</div>
													</div>
												)}
											</div>
										)}
									/>
								</div>

								{/* Right Column - Text Inputs */}
								<div className="space-y-6 lg:col-span-2">
									<Input
										{...register("title")}
										label="Team Name"
										placeholder="Enter your team name"
										description="A clear, descriptive name that represents your team"
										errorMessage={errors.title?.message}
										isInvalid={!!errors.title}
										isRequired
										variant="bordered"
										startContent={<Shield size={16} className="text-default-400" />}
									/>

									<Textarea
										{...register("description")}
										label="Team Description"
										placeholder="Describe your team's goals, requirements, and what you're looking for in teammates..."
										description="Provide details about your team's objectives, required skills, experience level, and expectations for new members"
										errorMessage={errors.description?.message}
										isInvalid={!!errors.description}
										minRows={4}
										maxRows={6}
										isRequired
										variant="bordered"
									/>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<Input
											{...register("daoName")}
											label="DAO Name"
											placeholder="e.g., Apex Legends Champions"
											description="Optional: Name for your team's governance DAO"
											errorMessage={errors.daoName?.message}
											isInvalid={!!errors.daoName}
											variant="bordered"
											startContent={<Users size={16} className="text-default-400" />}
										/>

										<Input
											{...register("daoDescription")}
											label="DAO Description"
											placeholder="e.g., Competitive team focused on tournament play"
											description="Optional: Brief description of your DAO's purpose"
											errorMessage={errors.daoDescription?.message}
											isInvalid={!!errors.daoDescription}
											variant="bordered"
										/>
									</div>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Governance Settings */}
					<Card>
						<CardHeader className="px-6 py-4">
							<div>
								<div className="mb-2 flex items-center gap-2">
									<Clock size={20} className="text-primary" />
									<h2 className="font-bold text-xl">Team Governance</h2>
								</div>
								<p className="text-sm opacity-70">
									Configure how your team will make decisions and vote on proposals
								</p>
							</div>
						</CardHeader>
						<CardBody className="space-y-6 px-6 py-4">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Voting Period */}
								<Controller
									name="votingPeriodDays"
									control={control}
									render={({ field }) => (
										<Select
											label="Voting Period"
											placeholder="Select voting duration"
											description={`Proposals will be open for ${watchVotingPeriod} day${watchVotingPeriod !== 1 ? "s" : ""}`}
											errorMessage={errors.votingPeriodDays?.message}
											isInvalid={!!errors.votingPeriodDays}
											variant="bordered"
											selectedKeys={field.value ? [field.value.toString()] : []}
											onSelectionChange={(keys) => {
												const value = Array.from(keys)[0] as string;
												field.onChange(Number.parseInt(value));
											}}
											startContent={<Clock size={16} className="text-default-400" />}
										>
											{VOTING_PERIOD_OPTIONS.map((option) => (
												<SelectItem key={option.value.toString()} description={option.description}>
													{option.label}
												</SelectItem>
											))}
										</Select>
									)}
								/>

								{/* Approval Threshold */}
								<Controller
									name="approvalThreshold"
									control={control}
									render={({ field }) => (
										<Select
											label="Approval Threshold"
											placeholder="Select approval percentage"
											description={`${watchThreshold}% of members must approve proposals`}
											errorMessage={errors.approvalThreshold?.message}
											isInvalid={!!errors.approvalThreshold}
											variant="bordered"
											selectedKeys={field.value ? [field.value.toString()] : []}
											onSelectionChange={(keys) => {
												const value = Array.from(keys)[0] as string;
												field.onChange(Number.parseInt(value));
											}}
											startContent={<Users size={16} className="text-default-400" />}
										>
											{THRESHOLD_OPTIONS.map((option) => (
												<SelectItem key={option.value.toString()} description={option.description}>
													{option.label}
												</SelectItem>
											))}
										</Select>
									)}
								/>
							</div>

							{/* Governance Explanation */}
							<Alert
								variant="solid"
								title="Governance Rules"
								description={
									<div className="mt-2 space-y-2">
										<p>• All approved members get equal voting power</p>
										<p>
											•{" "}
											{watchThreshold === 100
												? "Unanimous consent required"
												: `${watchThreshold}% approval needed`}{" "}
											for proposals to pass
										</p>
										<p>
											• Voting period: {watchVotingPeriod} day
											{watchVotingPeriod !== 1 ? "s" : ""}
										</p>
										<p className="mt-2 text-xs opacity-80">
											💡 New teams often start with 100% approval threshold for important decisions
										</p>
										<div className="flex items-center text-primary text-sm">
											<Link
												href={`${env.DAO_DAO_URL}/dao/create?chain=${env.CHAIN}`}
												isExternal
												className="flex items-center hover:underline"
												size="sm"
											>
												Need more customization options? Visit DAO DAO
												<ExternalLink size={12} className="ml-1" />
											</Link>
										</div>
									</div>
								}
							/>
						</CardBody>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end gap-2 pt-4">
						<Button
							as={Link}
							href={`/teams?category=${categoryParam}`}
							variant="bordered"
							startContent={<ArrowLeft size={18} />}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							color="primary"
							variant="shadow"
							size="lg"
							startContent={isSubmitting ? <Spinner size="sm" /> : <Shield size={18} />}
							isLoading={isSubmitting}
							isDisabled={!isValid || isSubmitting}
							className="min-w-[200px]"
						>
							{isSubmitting ? "Creating Team..." : "Create Team Enrollment"}
						</Button>
					</div>
				</form>
			</div>
		</motion.div>
	);
};

export default CreateTeamEnrollment;
