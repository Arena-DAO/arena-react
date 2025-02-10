"use client";

import { Card, CardFooter, Image } from "@heroui/react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubCategory } from "~/hooks/useCategoryMap";
import { useEnv } from "~/hooks/useEnv";

interface CompetitionCategoryCardProps {
	category: SubCategory;
	className?: string;
}

const MotionCard = motion.create(Card);

export default function CompetitionCategoryCard({
	category,
	className,
	...props
}: CompetitionCategoryCardProps) {
	const router = useRouter();
	const env = useEnv();
	const [isHovered, setIsHovered] = useState(false);

	return (
		<MotionCard
			isPressable
			isFooterBlurred
			className={`border-none ${className}`}
			radius="lg"
			onPress={() => router.push(`/compete?category=${category.url}`)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			{...props}
		>
			<Image
				as={NextImage}
				removeWrapper
				alt={category.title}
				fallbackSrc={env.JACKAL_PATH + category.img}
				src={`/images/${category.img}`}
				className="object-cover"
				height={250}
				width={500}
			/>
			<CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-md before:rounded-xl before:bg-white/10">
				<h3>{category.title}</h3>
				<motion.div
					className="flex h-8 w-8 items-center justify-center"
					initial={{ x: 20, opacity: 0 }}
					animate={{
						x: isHovered ? 0 : 20,
						opacity: isHovered ? 1 : 0,
					}}
					transition={{ duration: 0.2 }}
				>
					<ArrowRight className="h-4 w-4" />
				</motion.div>
			</CardFooter>
		</MotionCard>
	);
}
