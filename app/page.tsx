"use client";
import { Button, Card, CardBody, Chip, Image, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { Coins, Gamepad2, Gavel, Shield, Swords, Trophy, Users, Zap } from "lucide-react";
import NextImage from "next/image";
import { useEnv } from "~/hooks/useEnv";

const FeatureCard = ({
	title,
	description,
	icon,
	delay = 0,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	delay?: number;
}) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		whileInView={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay }}
		viewport={{ once: true }}
	>
		<Card className="group h-full border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20">
			<CardBody className="space-y-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
						{icon}
					</div>
					<h3 className="font-bold text-xl">{title}</h3>
				</div>
				<p className="text-foreground/70">{description}</p>
			</CardBody>
		</Card>
	</motion.div>
);

const HomePage = () => {
	const env = useEnv();

	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Hero Section */}
			<section className="relative flex min-h-screen items-center justify-center">
				{/* Simplified Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />

				{/* Hero Content */}
				<motion.div
					className="relative z-10 max-w-6xl px-4 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<div className="mb-8 inline-block">
						<Image
							as={NextImage}
							src="/logo.svg"
							alt="Arena DAO Logo"
							width={120}
							height={100}
							priority
							className="drop-shadow-lg"
						/>
					</div>

					<h1 className="mb-6 bg-gradient-to-r from-primary via-primary-400 to-primary bg-clip-text font-bold text-5xl text-transparent md:text-7xl lg:text-8xl">
						ARENA DAO
					</h1>
					<p className="mx-auto mb-8 max-w-3xl font-medium text-foreground/90 text-xl md:text-2xl">
						Empowering communities to compete. Build tournaments, organize leagues, and create wagers with
						complete transparency and instant payouts.
					</p>

					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						{/* Main Action Button */}
						<div className="flex justify-center">
							<Button
								as={Link}
								href="/compete"
								size="lg"
								color="primary"
								variant="shadow"
								className="bg-gradient-to-r from-primary to-primary-600 px-12 py-4 font-bold text-xl transition-all duration-300 hover:scale-105"
								endContent={<Swords className="h-6 w-6" />}
							>
								Enter the Arena
							</Button>
						</div>

						{/* Discord Community */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.8, duration: 0.6 }}
							className="flex justify-center"
						>
							<Card className="border border-secondary/30 bg-gradient-to-r from-secondary/10 to-secondary/5 backdrop-blur-sm">
								<CardBody className="flex flex-row items-center gap-4 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="rounded-full bg-secondary/20 p-2">
											<Users className="h-5 w-5 text-secondary" />
										</div>
										<div>
											<p className="font-semibold text-secondary text-sm">Join our community</p>
											<p className="text-foreground/70 text-xs">Connect with players worldwide</p>
										</div>
									</div>
									<Button
										as={Link}
										href="https://discord.arenadao.org"
										isExternal
										size="sm"
										color="secondary"
										variant="flat"
										className="font-semibold"
									>
										Discord
									</Button>
								</CardBody>
							</Card>
						</motion.div>
					</motion.div>

					<motion.div
						className="mt-12 flex flex-wrap justify-center gap-8 text-foreground/60 text-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1, duration: 0.6 }}
					>
						<div className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Smart Contract Security
						</div>
						<div className="flex items-center gap-2">
							<Gavel className="h-4 w-4" />
							DAO Governance
						</div>
						<div className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							Instant Payouts
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* Features Section */}
			<section className="relative py-20">
				<div className="container mx-auto px-6">
					<motion.div
						className="mb-16 text-center"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="mb-4 font-bold text-4xl md:text-5xl">Competition Formats</h2>
						<p className="mx-auto max-w-2xl text-foreground/70 text-lg">
							Secure, transparent, and fair competitions for all skill levels
						</p>
					</motion.div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<FeatureCard
							title="Wagers"
							description="Quick head-to-head competitions with direct stakes. Challenge opponents and settle disputes through DAO governance."
							icon={<Coins className="h-6 w-6 text-primary" />}
							delay={0}
						/>
						<FeatureCard
							title="Tournaments"
							description="Bracket-style elimination competitions. Create or join tournaments with automated prize distribution."
							icon={<Trophy className="h-6 w-6 text-primary" />}
							delay={0.2}
						/>
						<FeatureCard
							title="Leagues"
							description="Season-long point-based competitions. Build teams, track performance, and compete for championship titles."
							icon={<Gamepad2 className="h-6 w-6 text-primary" />}
							delay={0.4}
						/>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-24">
				<div className="container mx-auto px-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<h2 className="mb-6 font-bold text-4xl md:text-5xl">Ready to Compete?</h2>
						<p className="mx-auto mb-8 max-w-2xl text-foreground/80 text-lg">
							Join the Arena DAO community for fair, transparent, and secure gaming competitions.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Button
								as={Link}
								href="/compete"
								size="lg"
								color="primary"
								variant="shadow"
								className="bg-gradient-to-r from-primary to-primary-600 px-8 py-3 font-bold text-lg"
							>
								Explore Competitions
							</Button>
							<Button
								as={Link}
								href={env.DOCS_URL}
								isExternal
								size="lg"
								variant="bordered"
								color="primary"
								className="border-2 px-8 py-3 font-bold text-lg"
							>
								Learn More
							</Button>
						</div>

						{env.ENV === "development" && (
							<div className="mt-8">
								<Chip color="primary" variant="bordered" size="lg" className="bg-primary/10">
									🚧 Currently running on testnet
								</Chip>
							</div>
						)}
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
