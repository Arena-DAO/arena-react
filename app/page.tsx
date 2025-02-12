"use client";
import { Button, Image, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { Coins, Gavel, Scale, Trophy } from "lucide-react";
import NextImage from "next/image";
import type { PropsWithChildren } from "react";
import { useEnv } from "~/hooks/useEnv";

const AnimatedIcon = ({ children }: PropsWithChildren) => (
	<motion.div
		className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10"
		animate={{
			scale: [1, 1.1, 1],
			rotate: [0, 5, -5, 0],
		}}
		transition={{
			duration: 4,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut",
		}}
	>
		{children}
	</motion.div>
);

const FloatingElement = ({
	delay = 0,
	children,
}: PropsWithChildren & { delay: number }) => (
	<motion.div
		animate={{
			y: [0, -20, 0],
		}}
		transition={{
			duration: 3,
			repeat: Number.POSITIVE_INFINITY,
			delay,
			ease: "easeInOut",
		}}
	>
		{children}
	</motion.div>
);

const HomePage = () => {
	const env = useEnv();

	return (
		<div className="relative min-h-screen">
			{/* Hero Section */}
			<section className="relative flex min-h-screen items-center justify-center overflow-hidden">
				{/* Background Pattern */}
				<motion.div
					className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,128,0,0.1)_0%,rgba(0,0,0,0)_50%)]"
					animate={{
						opacity: [0.5, 0.8, 0.5],
					}}
					transition={{
						repeat: Number.POSITIVE_INFINITY,
						duration: 3,
						repeatType: "mirror",
					}}
				/>

				{/* Floating Icons */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-32 left-10">
						<FloatingElement delay={0}>
							<Trophy className="h-16 w-16 text-primary/30" />
						</FloatingElement>
					</div>
					<div className="absolute top-48 right-20">
						<FloatingElement delay={1}>
							<Coins className="h-12 w-12 text-primary/20" />
						</FloatingElement>
					</div>
					<div className="absolute bottom-32 left-1/4">
						<FloatingElement delay={0.5}>
							<Scale className="h-14 w-14 text-primary/25" />
						</FloatingElement>
					</div>
				</div>
				{/* Hero Content */}
				<motion.div
					className="relative z-20 px-4 text-center"
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<motion.div
						className="mb-8 inline-block"
						animate={{ scale: [1, 1.05, 1] }}
						transition={{
							duration: 4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="Arena DAO Logo"
							width="120"
							height="100"
							priority
							className="text-glow"
						/>
					</motion.div>

					<h1 className="font-bold font-cinzel text-6xl text-glow md:text-8xl">
						ARENA DAO
						<span className="mt-4 block font-normal text-2xl">
							The Premier Web3 Competition Platform
						</span>
					</h1>

					<p className="mt-6 flex flex-wrap justify-center gap-2 text-lg md:gap-4 md:text-xl lg:text-2xl">
						<span>Host Tournaments</span>
						<span className="hidden md:inline">•</span>
						<span>Create Leagues</span>
						<span className="hidden md:inline">•</span>
						<span>Place Wagers</span>
					</p>
					<p className="mt-2 text-lg">
						Fair Competition Powered by Decentralized Mediation
					</p>

					<motion.div
						className="mt-8 flex flex-wrap justify-center gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						<Button
							as={Link}
							href="/compete"
							size="lg"
							color="primary"
							className="card-hover"
						>
							Compete
						</Button>
						<Button
							as={Link}
							href={env.DOCS_URL}
							size="lg"
							variant="bordered"
							color="primary"
							isExternal
							className="card-hover"
						>
							Learn More
						</Button>
					</motion.div>
				</motion.div>
			</section>

			{/* Features Section */}
			<section className="relative z-10 space-y-20 py-20">
				{/* Host Events */}
				<div className="container mx-auto px-6">
					<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
						<div className="flex flex-col justify-center">
							<div className="flex items-center gap-4">
								<Trophy className="h-8 w-8 text-primary" />
								<h2 className="font-bold font-cinzel text-4xl text-glow text-primary">
									HOST EVENTS
								</h2>
							</div>
							<p className="mt-4 text-xl">
								Create and manage your own tournaments, leagues, or wager-based
								competitions. Set your rules, prize pools, and let Arena DAO
								handle the rest.
							</p>
						</div>
						<div className="relative flex h-64 items-center justify-center">
							<AnimatedIcon>
								<Trophy className="h-16 w-16 text-primary" />
							</AnimatedIcon>
						</div>
					</div>
				</div>

				{/* Wagers */}
				<div className="container mx-auto px-6">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="relative order-2 flex h-64 items-center justify-center md:order-1">
							<AnimatedIcon>
								<Coins className="h-16 w-16 text-primary" />
							</AnimatedIcon>
						</div>
						<div className="order-1 flex flex-col justify-center md:order-2">
							<div className="flex items-center gap-4">
								<Coins className="h-8 w-8 text-primary" />
								<h2 className="font-bold font-cinzel text-4xl text-glow text-primary">
									SECURE WAGERS
								</h2>
							</div>
							<p className="mt-4 text-xl">
								Place and manage wagers with confidence. Smart contracts ensure
								transparent stake handling and automated payouts upon
								resolution.
							</p>
						</div>
					</div>
				</div>

				{/* Mediation */}
				<div className="container mx-auto px-6">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="flex flex-col justify-center">
							<div className="flex items-center gap-4">
								<Gavel className="h-8 w-8 text-primary" />
								<h2 className="font-bold font-cinzel text-4xl text-glow text-primary">
									FAIR MEDIATION
								</h2>
							</div>
							<p className="mt-4 text-xl">
								Our DAO serves as an impartial mediator for any disputes.
								Community-governed resolution ensures fairness and transparency
								in all competitions.
							</p>
						</div>
						<div className="relative flex h-64 items-center justify-center">
							<AnimatedIcon>
								<Scale className="h-16 w-16 text-primary" />
							</AnimatedIcon>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
