"use client";

import { Card, CardBody, CardFooter } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import type { SubCategory } from "~/hooks/useCategories";

interface CompetitionCategoryCardProps {
	category: SubCategory;
}

export default function CompetitionCategoryCard({
	category,
}: CompetitionCategoryCardProps) {
	const router = useRouter();

	return (
		<Card
			isPressable
			onPress={() => router.push(`/compete?category=${category.url}`)}
			className="col-span-12 lg:col-span-3 md:col-span-4 sm:col-span-6"
		>
			<CardBody className="overflow-visible p-0">
				<Image
					alt={category.title}
					src={category.img}
					className="w-full object-cover"
				/>
			</CardBody>
			<CardFooter>
				<p className="font-bold text-2xl">{category.title}</p>
			</CardFooter>
		</Card>
	);
}
