// app/teams/page.tsx
"use client";

import {
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	Link,
	Spinner,
} from "@heroui/react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ChevronRight, Plus, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsListEntriesQuery } from "~/codegen/ArenaTeamEnrollments.react-query";
import type {
	EntryStatus,
	TeamEntryResponse,
} from "~/codegen/ArenaTeamEnrollments.types";
import { useCategoryMap, type CategoryItem } from "~/hooks/useCategoryMap";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { useProfileData } from "~/hooks/useProfile";

const TeamEnrollments = () => {
	const searchParams = useSearchParams();
	const categoryId = searchParams?.get("category") || undefined;
	const { data: client } = useCosmWasmClient();
	const { data: categories } = useCategoryMap();
	const env = useEnv();
	const limit = 50;
	const categoryItem = useMemo(() => {
		const category = categories.get(searchParams.get("category") ?? "");
		if (category && "category_id" in category) return category;
		return undefined;
	}, [searchParams.get, categories.get]);
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
	}, [categoryItem, categories.get]);
	const { data: entries, isLoading: isEntriesLoading } =
		useArenaTeamEnrollmentsListEntriesQuery({
			client:
				client &&
				new ArenaTeamEnrollmentsQueryClient(
					client,
					env.ARENA_TEAM_ENROLLMENTS_ADDRESS,
				),
			args: {
				categoryId: categoryItem?.category_id?.toString() || undefined,
				limit,
			},
			options: {
				enabled: !!client && !!categoryItem?.category_id,
			},
		});

	if (!categoryItem || isEntriesLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="min-h-screen"
		>
			<div className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:py-8">
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
						<BreadcrumbItem>Team Enrollments</BreadcrumbItem>
					</Breadcrumbs>

					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<Button
								as={Link}
								href="/compete"
								variant="light"
								startContent={<ArrowLeft size={18} />}
								className="mb-2"
							>
								Back to Categories
							</Button>
							<h1 className="font-bold text-2xl md:text-3xl">
								{categoryItem.title} Team Enrollments
							</h1>
						</div>

						<Button
							as={Link}
							href={`/teams/create?categoryId=${categoryId}`}
							color="primary"
							variant="shadow"
							startContent={<Plus size={18} />}
						>
							Create Team Enrollment
						</Button>
					</div>
				</div>

				{/* Team Enrollments List */}
				{!entries || entries.length === 0 ? (
					<Card className="w-full">
						<CardBody className="flex flex-col items-center justify-center py-16">
							<Users size={48} className="mb-4 opacity-30" />
							<h3 className="mb-2 font-medium text-xl">No Team Enrollments</h3>
							<p className="text-center opacity-70">
								There are no team enrollments in this category yet.
							</p>
						</CardBody>
					</Card>
				) : (
					<motion.div
						className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
						initial="hidden"
						animate="visible"
						variants={{
							visible: {
								transition: {
									staggerChildren: 0.05,
								},
							},
						}}
					>
						{entries.map((entry) => (
							<TeamEnrollmentCard key={entry.entry_id} entry={entry} />
						))}
					</motion.div>
				)}
			</div>
		</motion.div>
	);
};

// TeamEnrollmentCard component to show each team enrollment entry
const TeamEnrollmentCard = ({ entry }: { entry: TeamEntryResponse }) => {
	const { data: creatorProfile } = useProfileData(entry.creator);
	const createdTime = new Date(Number(entry.created_at) * 1000);

	const getStatusColor = (status: EntryStatus) => {
		switch (status) {
			case "open":
				return "success";
			case "created":
				return "primary";
			case "closed":
				return "warning";
			case "aborted":
				return "danger";
			default:
				return "default";
		}
	};

	return (
		<motion.div
			variants={{
				hidden: { y: 20, opacity: 0 },
				visible: { y: 0, opacity: 1 },
			}}
			transition={{ duration: 0.4 }}
		>
			<Card className="h-full">
				<CardBody className="flex flex-col p-0">
					<div className="p-4">
						<div className="mb-2 flex items-start justify-between">
							<h3 className="line-clamp-2 font-bold text-lg">{entry.title}</h3>
							<span
								className={`text-${getStatusColor(entry.status)} rounded-full px-2 py-1 font-medium text-sm bg-${getStatusColor(entry.status)}-100`}
							>
								{entry.status}
							</span>
						</div>

						<p className="mb-4 line-clamp-3 text-sm opacity-80">
							{entry.description}
						</p>

						<div className="mb-2 flex items-center gap-3 text-sm opacity-70">
							<div className="flex items-center gap-1">
								<Calendar size={14} />
								<span>
									{formatDistanceToNow(createdTime, { addSuffix: true })}
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Users size={14} />
								<Link
									href={`/profile/${entry.creator}`}
									className="hover:underline"
								>
									{creatorProfile?.name || `${entry.creator.slice(0, 8)}...`}
								</Link>
							</div>
						</div>
					</div>

					<div className="mt-auto">
						<div className="flex justify-end border-t p-3">
							<Button
								as={Link}
								href={`/teams/entry/${entry.entry_id}`}
								color="primary"
								size="sm"
							>
								View Details
							</Button>
						</div>
					</div>
				</CardBody>
			</Card>
		</motion.div>
	);
};

export default TeamEnrollments;
