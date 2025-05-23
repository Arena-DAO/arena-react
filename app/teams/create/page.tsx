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
	Spinner,
	Textarea,
	addToast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	ChevronRight,
	Shield,
	Image as ImageIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ArenaTeamEnrollmentsClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsCreateEntryMutation } from "~/codegen/ArenaTeamEnrollments.react-query";
import type { DaoConfigForUint64 } from "~/codegen/ArenaTeamEnrollments.types";
import { useCategoryMap, type CategoryItem } from "~/hooks/useCategoryMap";
import { useEnv } from "~/hooks/useEnv";

// Zod schema for form validation
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
	teamImageUrl: z.string().optional(),
	votingPeriodDays: z
		.number()
		.min(1, "Voting period must be at least 1 day")
		.max(30, "Voting period cannot exceed 30 days")
		.default(7),
	approvalThreshold: z
		.number()
		.min(1, "Threshold must be at least 1%")
		.max(100, "Threshold cannot exceed 100%")
		.default(51),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;

const CreateTeamEnrollment = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categoryParam = searchParams?.get("category") || "";
	const { data: categories } = useCategoryMap();
	const env = useEnv();
	const { address: walletAddress, getSigningCosmWasmClient } = useChain(
		env.CHAIN,
	);
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
			currentItem = currentItem.parent_url
				? categories.get(currentItem.parent_url)
				: undefined;
		}

		result.unshift({ title: "Categories", url: "", children: [], img: "" });
		return result;
	}, [categoryItem, categories]);

	const { mutateAsync: createEntry } =
		useArenaTeamEnrollmentsCreateEntryMutation();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<CreateTeamForm>({
		resolver: zodResolver(createTeamSchema),
		defaultValues: {
			title: "",
			description: "",
			teamImageUrl: "",
			votingPeriodDays: 1,
			approvalThreshold: 51,
		},
		mode: "onChange",
	});

	const onSubmit = async (data: CreateTeamForm) => {
		if (!walletAddress || !categoryItem?.category_id) return;

		setIsSubmitting(true);
		try {
			addToast({
				color: "primary",
				description: "Creating your team enrollment...",
			});

			// Upload team image if provided
			const teamImageUrl = await teamImageRef.current?.uploadToS3();

			// Create DAO config with form data
			const daoConfig: DaoConfigForUint64 = {
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
				extension: env.CODE_ID_CW4_GROUP,
			};

			const client = await getSigningCosmWasmClient();
			const enrollmentClient = new ArenaTeamEnrollmentsClient(
				client,
				walletAddress,
				env.ARENA_TEAM_ENROLLMENTS_ADDRESS,
			);

			console.log(data.title, data.description, daoConfig);
			await createEntry({
				client: enrollmentClient,
				msg: {
					title: data.title,
					description: data.description,
					categoryId: categoryItem.category_id?.toString(),
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
				description:
					(error as Error).message || "Failed to create team enrollment",
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
						<h1 className="text-center font-bold text-3xl md:text-4xl">
							Wallet Required
						</h1>
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
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="min-h-screen"
		>
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
							<h1 className="font-bold text-2xl md:text-3xl">
								Create Team Enrollment
							</h1>
							<p className="mt-1 opacity-70">
								{categoryItem.title} • Team Formation
							</p>
						</div>
					</div>
				</div>

				{/* Create Form */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader className="px-6 py-4">
							<h2 className="font-bold text-xl">Team Information</h2>
						</CardHeader>
						<CardBody className="space-y-6 px-6 py-4">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{/* Left Column - Text Inputs */}
								<div className="space-y-6">
									<Input
										{...register("title")}
										label="Team Name"
										placeholder="Enter your team name"
										description="A clear, descriptive name that represents your team"
										errorMessage={errors.title?.message}
										isInvalid={!!errors.title}
										isRequired
										variant="bordered"
									/>

									<Textarea
										{...register("description")}
										label="Team Description"
										placeholder="Describe your team's goals, requirements, and what you're looking for in teammates..."
										description="Provide details about your team's objectives, required skills, experience level, and expectations for new members"
										errorMessage={errors.description?.message}
										isInvalid={!!errors.description}
										minRows={4}
										maxRows={8}
										isRequired
										variant="bordered"
									/>
								</div>

								{/* Right Column - Team Image */}
								<div className="space-y-6">
									<Controller
										name="teamImageUrl"
										control={control}
										render={({ field, fieldState }) => (
											<div>
												<ImageUploader
													field={field}
													error={fieldState.error}
													label="Team Logo"
													startContent={
														<ImageIcon size={16} className="text-default-400" />
													}
													ref={teamImageRef}
													description="Square image recommended (optional)"
												/>
												{field.value && (
													<div className="mt-3 h-24 w-24 rounded-lg border border-default-200 p-1">
														<img
															src={field.value}
															alt="Team logo preview"
															className="h-full w-full rounded-md object-cover"
														/>
													</div>
												)}
											</div>
										)}
									/>
								</div>
							</div>
						</CardBody>
					</Card>

					{/* Governance Settings */}
					<Card>
						<CardHeader className="px-6 py-4">
							<div>
								<h2 className="font-bold text-xl">Team Governance</h2>
								<p className="mt-1 text-sm opacity-70">
									Configure how your team will make decisions and vote on
									proposals
								</p>
							</div>
						</CardHeader>
						<CardBody className="space-y-6 px-6 py-4">
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<Input
									{...register("votingPeriodDays", { valueAsNumber: true })}
									type="number"
									label="Voting Period"
									placeholder="7"
									description="How many days team members have to vote on proposals"
									errorMessage={errors.votingPeriodDays?.message}
									isInvalid={!!errors.votingPeriodDays}
									min={1}
									max={30}
									endContent={
										<span className="text-default-400 text-small">day(s)</span>
									}
									variant="bordered"
								/>

								<Input
									{...register("approvalThreshold", { valueAsNumber: true })}
									type="number"
									label="Approval Threshold"
									placeholder="51"
									description="Percentage of votes needed for a proposal to pass"
									errorMessage={errors.approvalThreshold?.message}
									isInvalid={!!errors.approvalThreshold}
									min={1}
									max={100}
									endContent={
										<span className="text-default-400 text-small">%</span>
									}
									variant="bordered"
								/>
							</div>
							<Alert
								color="primary"
								variant="solid"
								title="All approved
										members get equal voting power"
							/>
						</CardBody>
					</Card>

					{/* Submit Button */}
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="submit"
							color="primary"
							variant="shadow"
							startContent={
								isSubmitting ? <Spinner size="sm" /> : <Shield size={18} />
							}
							isLoading={isSubmitting}
							isDisabled={!isValid || isSubmitting}
						>
							Create Team Enrollment
						</Button>
					</div>
				</form>
			</div>
		</motion.div>
	);
};

export default CreateTeamEnrollment;
