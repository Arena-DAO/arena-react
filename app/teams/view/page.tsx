"use client";

import { useChain } from "@cosmos-kit/react";
import { BreadcrumbItem, Breadcrumbs, Button, Link, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import {
	useArenaTeamEnrollmentsGetApplicantQuery,
	useArenaTeamEnrollmentsGetEntryQuery,
} from "~/codegen/ArenaTeamEnrollments.react-query";
import { type CategoryItem, useCategoryMap } from "~/hooks/useCategoryMap";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { ApplicantsSection } from "./components/ApplicantsSection";
import { TeamInfoCard } from "./components/TeamInfoCard";

const TeamView = () => {
	const searchParams = useSearchParams();
	const entryId = searchParams?.get("entryId");
	const categoryId = searchParams?.get("category");
	const env = useEnv();
	const { data: client } = useCosmWasmClient();
	const { address: walletAddress } = useChain(env.CHAIN);
	const { data: categories } = useCategoryMap();

	// Validate entryId
	const parsedEntryId = entryId ? Number.parseInt(entryId, 10) : null;
	if (!entryId || Number.isNaN(parsedEntryId)) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">Invalid Team Entry</h2>
					<p className="text-default-600">Please provide a valid entry ID.</p>
					<Button as={Link} href="/teams" color="primary" className="mt-4">
						Browse Teams
					</Button>
				</div>
			</div>
		);
	}

	// Fetch team entry
	const {
		data: entry,
		isLoading: isEntryLoading,
		error: entryError,
	} = useArenaTeamEnrollmentsGetEntryQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: { entryId: parsedEntryId! },
		options: { enabled: !!client && !!parsedEntryId },
	});

	// Fetch user's application status
	const { data: userApplication } = useArenaTeamEnrollmentsGetApplicantQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: {
			entryId: parsedEntryId!,
			applicant: walletAddress || "",
		},
		options: {
			enabled: !!client && !!parsedEntryId && !!walletAddress,
			retry: false, // Don't retry if user hasn't applied
		},
	});

	const categoryItem = useMemo(() => {
		if (!entry?.category_id) return null;
		const category = categories.get(entry.category_id.toString());
		if (category && "category_id" in category) return category;
		return null;
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

	const isCreator = walletAddress === entry?.creator;

	if (isEntryLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (entryError || !entry) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="text-center">
					<h2 className="mb-2 font-semibold text-xl">Team Not Found</h2>
					<p className="text-default-600">The team entry you're looking for doesn't exist.</p>
					<Button as={Link} href="/teams" color="primary" className="mt-4">
						Browse Teams
					</Button>
				</div>
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
						<BreadcrumbItem href={categoryId ? `/teams?category=${categoryId}` : "/teams"}>
							Team Enrollments
						</BreadcrumbItem>
						<BreadcrumbItem>{entry.title}</BreadcrumbItem>
					</Breadcrumbs>

					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<Button
								as={Link}
								href={categoryId ? `/teams?category=${categoryId}` : "/teams"}
								variant="light"
								startContent={<ArrowLeft size={18} />}
								className="mb-2"
							>
								Back to Teams
							</Button>
							<h1 className="font-bold text-2xl md:text-3xl">{entry.title}</h1>
						</div>
					</div>
				</div>

				{/* Team Info */}
				<TeamInfoCard
					entry={entry}
					walletAddress={walletAddress}
					userApplication={userApplication}
					isCreator={isCreator}
					entryId={parsedEntryId!}
				/>

				{/* Applicants Section */}
				<ApplicantsSection isCreator={isCreator} entryId={parsedEntryId!} />
			</div>
		</motion.div>
	);
};

export default TeamView;
