"use client";

import { Card, CardFooter, type CardProps } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
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
	const { data: env } = useEnv();

	return (
		<Card
			isPressable
			onPress={() => router.push(`/compete?category=${category.url}`)}
			{...props}
		>
			<Image
				as={NextImage}
				alt={category.title}
				src={env.JACKAL_PATH + category.img}
				className="z-0 h-full w-full object-cover"
				removeWrapper
				width={1280}
				height={720}
			/>
			<CardFooter>
				<h2 className="font-bold text-2xl">{category.title}</h2>
			</CardFooter>
		</Card>
	);
}
