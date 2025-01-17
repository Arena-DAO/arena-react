"use client";

import { Card, CardFooter, type CardProps } from "@heroui/react";
import { Image } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { SubCategory } from "~/hooks/useCategoryMap";
import { useEnv } from "~/hooks/useEnv";

interface CompetitionCategoryCardProps extends CardProps {
	category: SubCategory;
}

export default function CompetitionCategoryCard({
	category,
	...props
}: CompetitionCategoryCardProps) {
	const router = useRouter();
	const env = useEnv();

	return (
		<Card
			isPressable
			onPress={() => router.push(`/compete?category=${category.url}`)}
			{...props}
		>
			<Image
				alt={category.title}
				fallbackSrc={env.JACKAL_PATH + category.img}
				src={`/images/${category.img}`}
				className="z-0 h-full w-full object-cover"
				removeWrapper
			/>
			<CardFooter>
				<h2 className="font-bold text-2xl">{category.title}</h2>
			</CardFooter>
		</Card>
	);
}
