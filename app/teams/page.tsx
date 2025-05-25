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
	Tab,
	Tabs,
} from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Shield, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArenaTeamEnrollmentsQueryClient } from "~/codegen/ArenaTeamEnrollments.client";
import { useArenaTeamEnrollmentsListEntriesQuery } from "~/codegen/ArenaTeamEnrollments.react-query";
import type { EntryStatus, TeamEntryResponse } from "~/codegen/ArenaTeamEnrollments.types";
import { type CategoryItem, type CategoryLeaf, useCategoryMap } from "~/hooks/useCategoryMap";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import TeamEnrollmentCard from "./components/TeamEnrollmentCard";

const STATUSES: { key: EntryStatus; label: string; description: string }[] = [
	{
		key: "open",
		label: "Open",
		description: "Teams currently recruiting members",
	},
	{
		key: "created",
		label: "Created",
		description: "Teams that have been successfully formed",
	},
	{
		key: "closed",
		label: "Closed",
		description: "Teams no longer accepting applications",
	},
	{
		key: "aborted",
		label: "Aborted",
		description: "Teams that were cancelled or abandoned",
	},
];

const TeamEnrollments = () => {
	const searchParams = useSearchParams();
	const categoryId = searchParams?.get("category") || undefined;
	const { data: categories } = useCategoryMap();
	const [selectedStatus, setSelectedStatus] = useState<EntryStatus>("open");
	const limit = 50;

	const categoryItem = useMemo(() => {
		const category = categories.get(categoryId ?? "");
		if (category && "category_id" in category) return category;
		return undefined;
	}, [categoryId, categories]);

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

	if (!categoryItem) {
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
							href={`/teams/create?category=${categoryId}`}
							color="primary"
							variant="shadow"
							startContent={<Shield size={18} />}
						>
							Create Team Enrollment
						</Button>
					</div>
				</div>

				{/* Status Tabs */}
				<Tabs
					selectedKey={selectedStatus}
					onSelectionChange={(key) => setSelectedStatus(key as EntryStatus)}
					color="primary"
					variant="underlined"
					classNames={{
						tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
						cursor: "w-full bg-primary",
						tab: "max-w-fit px-0 h-12",
						tabContent: "group-data-[selected=true]:text-primary",
					}}
				>
					{STATUSES.map((status) => (
						<Tab
							key={status.key}
							title={
								<div className="flex items-center space-x-2">
									<span>{status.label}</span>
								</div>
							}
						>
							<div className="py-4">
								<div className="mb-4">
									<p className="text-default-600">{status.description}</p>
								</div>
								<TeamEnrollmentsList
									categoryItem={categoryItem}
									status={status.key}
									limit={limit}
								/>
							</div>
						</Tab>
					))}
				</Tabs>
			</div>
		</motion.div>
	);
};

// Separate component for the team enrollments list
interface TeamEnrollmentsListProps {
	categoryItem: CategoryLeaf;
	status: EntryStatus;
	limit: number;
}

const TeamEnrollmentsList = ({ categoryItem, status, limit }: TeamEnrollmentsListProps) => {
	const env = useEnv();
	const { data: client } = useCosmWasmClient();

	const { data: entries, isLoading: isEntriesLoading } = useArenaTeamEnrollmentsListEntriesQuery({
		client:
			client && new ArenaTeamEnrollmentsQueryClient(client, env.ARENA_TEAM_ENROLLMENTS_ADDRESS),
		args: {
			categoryStatus: categoryItem && {
				category_id: categoryItem.category_id?.toString(),
				status: status,
			},
			limit,
		},
		options: {
			enabled: !!client && !!categoryItem,
		},
	});

	if (isEntriesLoading) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!entries || entries.length === 0) {
		return (
			<Card className="w-full">
				<CardBody className="flex flex-col items-center justify-center py-16">
					<Users size={48} className="mb-4 opacity-30" />
					<h3 className="mb-2 font-medium text-xl">No {status} Team Enrollments</h3>
					<p className="text-center opacity-70">
						There are no {status} team enrollments in this category yet.
					</p>
				</CardBody>
			</Card>
		);
	}

	return (
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
			{entries.map((entry: TeamEntryResponse) => (
				<TeamEnrollmentCard key={entry.entry_id} entry={entry} />
			))}
		</motion.div>
	);
};

export default TeamEnrollments;
