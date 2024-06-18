"use client";

import { Card, CardFooter } from "@nextui-org/react";
import { Image } from "@nextui-org/react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import type { SubCategory } from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";

interface CompetitionCategoryCardProps {
	category: SubCategory;
}

export default function CompetitionCategoryCard({
	category,
}: CompetitionCategoryCardProps) {
	const router = useRouter();
	const { data: env } = useEnv();

	return (
		<Card
			isPressable
			onPress={() => router.push(`/compete?category=${category.url}`)}
			className="col-span-12 lg:col-span-3 md:col-span-4 sm:col-span-6"
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
