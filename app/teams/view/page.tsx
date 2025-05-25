// app/teams/entry/[entryId]/page.tsx
"use client";

import { useChain } from "@cosmos-kit/react";
import { BreadcrumbItem, Breadcrumbs, Button, Link, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import {
	useArenaTeamEnrollmentsGetEntryQuery,
	useArenaTeamEnrollmentsListApplicantsQuery,
} from "~/codegen/ArenaTeamEnrollments.react-query";
import { type CategoryItem, useCategoryMap } from "~/hooks/useCategoryMap";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { ApplicantsSection } from "./components/ApplicantsSection";
import { TeamInfoCard } from "./components/TeamInfoCard";

const TeamEntryDetail = () => {
	const params = useSearchParams();
	const id = params.get("id");
	const entryId = id ? Number.parseInt(id) : undefined;
	const { data: client } = useCosmWasmClient();
	const { data: categories } = useCategoryMap();
	const env = useEnv();
	const { address: walletAddress } = useChain(env.CHAIN);

	// Queries
	const { data: entry, isLoading: isEntryLoading } = useArenaTeamEnrollmentsGetEntryQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: { entryId: entryId! },
		options: { enabled: !!client && !Number.isNaN(entryId) },
	});

	const { data: applicants, isLoading: isApplicantsLoading } =
		useArenaTeamEnrollmentsListApplicantsQuery({
			client:
				client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
			args: { entryId: entryId!, limit: 100 },
			options: { enabled: !!client && !Number.isNaN(entryId) },
		});

	// Derived data
	const categoryItem = useMemo(() => {
		if (!entry?.category_id) return undefined;
		const categoryId = entry.category_id.toString();
		const category = categories.get(categoryId);
		return category && "category_id" in category ? category : undefined;
	}, [entry?.category_id, categories]);

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

	// Check if current user is creator or has applied
	const isCreator = walletAddress === entry?.creator;
	const userApplication = applicants?.find((a) => a.applicant === walletAddress);

	if (isEntryLoading || !entry) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
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
						<BreadcrumbItem href={`/teams?category=${entry.category_id}`}>
							Team Enrollments
						</BreadcrumbItem>
						<BreadcrumbItem>{entry.title}</BreadcrumbItem>
					</Breadcrumbs>

					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
						<div>
							<Button
								as={Link}
								href={`/teams?category=${entry.category_id}`}
								variant="light"
								startContent={<ArrowLeft size={18} />}
								className="mb-2"
							>
								Back to Team Enrollments
							</Button>
						</div>
					</div>
				</div>

				{/* Team Information */}
				<TeamInfoCard
					entry={entry}
					walletAddress={walletAddress}
					userApplication={userApplication}
					isCreator={isCreator}
					entryId={entryId!}
				/>

				{/* Applicants Section */}
				<ApplicantsSection
					entry={entry}
					applicants={applicants}
					isApplicantsLoading={isApplicantsLoading}
					isCreator={isCreator}
					entryId={entryId!}
				/>
			</div>
		</motion.div>
	);
};

export default TeamEntryDetail;
