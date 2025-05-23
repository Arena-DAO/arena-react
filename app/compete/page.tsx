"use client";

import {
	BreadcrumbItem,
	Breadcrumbs,
	Button,
	Card,
	CardBody,
	Link,
} from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Shield, Swords, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CategoryProvider } from "~/contexts/CategoryContext";
import {
	type CategoryItem,
	type SubCategory,
	useCategoryMap,
} from "~/hooks/useCategoryMap";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionEnrollmentItems from "./components/CompetitionEnrollmentItems";

const MotionCard = motion.create(Card);

const Compete = () => {
	const searchParams = useSearchParams();
	const { data: categories } = useCategoryMap();

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);

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

	if (!categoryItem) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
				<MotionCard
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="w-full max-w-md"
				>
					<CardBody className="flex flex-col items-center gap-4 p-8 md:p-12">
						<motion.div
							initial={{ rotate: -10, scale: 0.9 }}
							animate={{ rotate: 0, scale: 1 }}
							transition={{ delay: 0.2 }}
						>
							<Trophy className="h-16 w-16 opacity-50" />
						</motion.div>
						<h1 className="text-center font-bold text-3xl md:text-4xl">
							Category Not Found
						</h1>
						<p className="text-center opacity-80">
							The category "{category}" could not be found.
						</p>
						<Button
							as={Link}
							href="/compete"
							variant="bordered"
							startContent={<ArrowLeft />}
							className="mt-4"
						>
							Return to Categories
						</Button>
					</CardBody>
				</MotionCard>
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
					<div className="flex flex-wrap items-center justify-between">
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
						</Breadcrumbs>
					</div>

					<motion.h1
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="font-bold text-3xl md:text-4xl"
					>
						{categoryItem.title}
						<span className="ml-3 font-normal text-base opacity-80 md:text-lg">
							{"children" in categoryItem ? "Categories" : "Competitions"}
						</span>
					</motion.h1>
				</div>

				{/* Categories Grid */}
				{"children" in categoryItem && (
					<motion.div
						className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
						initial="hidden"
						animate="visible"
						variants={{
							visible: {
								transition: {
									staggerChildren: 0.1,
								},
							},
						}}
					>
						{categoryItem.children.map((item) => (
							<motion.div
								key={item.url}
								variants={{
									hidden: { y: 20, opacity: 0 },
									visible: { y: 0, opacity: 1 },
								}}
								transition={{ duration: 0.5 }}
							>
								<CompetitionCategoryCard
									category={item as SubCategory}
									className="h-full justify-self-center"
								/>
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Competitions Section */}
				{"category_id" in categoryItem && (
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
							<h2 className="font-bold text-xl md:text-2xl">
								Available Competitions
							</h2>
							<div className="flex gap-2">
								<Button
									as={Link}
									href={`/teams?category=${category}`}
									color="primary"
									variant="shadow"
									startContent={<Shield size={18} />}
									className="min-w-max whitespace-nowrap"
								>
									Find Teams
								</Button>
								<Button
									as={Link}
									href={`/compete/create?category=${category}`}
									color="primary"
									variant="shadow"
									className="min-w-max whitespace-nowrap"
									startContent={<Swords size={18} />}
								>
									Create Competition
								</Button>
							</div>
						</div>
						<CategoryProvider value={categoryItem.url}>
							<CompetitionEnrollmentItems category={categoryItem} />
						</CategoryProvider>
					</motion.div>
				)}
			</div>
		</motion.div>
	);
};

export default Compete;
