"use client";
import { Button, Card, CardBody, Chip, Image, Link } from "@heroui/react";
import { motion } from "framer-motion";
import {
	Coins,
	Gamepad2,
	Gavel,
	Globe,
	Lock,
	Scale,
	Shield,
	Swords,
	Trophy,
	Users,
	Zap,
} from "lucide-react";
import NextImage from "next/image";
import type { PropsWithChildren } from "react";
import { useEnv } from "~/hooks/useEnv";

const FloatingElement = ({ delay = 0, children }: PropsWithChildren & { delay: number }) => (
	<motion.div
		animate={{
			y: [0, -20, 0],
			rotate: [0, 2, -2, 0],
		}}
		transition={{
			duration: 6,
			repeat: Number.POSITIVE_INFINITY,
			delay,
			ease: "easeInOut",
		}}
	>
		{children}
	</motion.div>
);

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
				{/* Animated Background */}
				<div className="absolute inset-0">
					<motion.div
						className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
						animate={{
							opacity: [0.3, 0.6, 0.3],
							scale: [1, 1.1, 1],
						}}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							duration: 8,
							ease: "easeInOut",
						}}
					/>
					{/* Floating decorative elements */}
					<div className="absolute top-20 left-10">
						<FloatingElement delay={0}>
							<Trophy className="h-12 w-12 text-primary/30" />
						</FloatingElement>
					</div>
					<div className="absolute top-32 right-20">
						<FloatingElement delay={2}>
							<Coins className="h-8 w-8 text-primary/20" />
						</FloatingElement>
					</div>
					<div className="absolute bottom-40 left-1/4">
						<FloatingElement delay={4}>
							<Gamepad2 className="h-10 w-10 text-primary/25" />
						</FloatingElement>
					</div>
					<div className="absolute right-1/3 bottom-20">
						<FloatingElement delay={1}>
							<Scale className="h-14 w-14 text-primary/20" />
						</FloatingElement>
					</div>
				</div>

				{/* Hero Content */}
				<motion.div
					className="relative z-10 max-w-6xl px-4 text-center"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<motion.div
						className="mb-8 inline-block"
						animate={{ scale: [1, 1.02, 1] }}
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
							width={120}
							height={100}
							priority
							className="drop-shadow-lg"
						/>
					</motion.div>

					<h1 className="mb-6 bg-gradient-to-r from-primary via-primary-400 to-primary bg-clip-text font-bold text-5xl text-transparent md:text-7xl lg:text-8xl">
						ARENA DAO
					</h1>
					<p className="mb-4 font-medium text-2xl md:text-3xl lg:text-4xl">
						The Premier Web3 Competition Platform
					</p>
					<p className="mx-auto mb-8 max-w-3xl text-foreground/80 text-lg md:text-xl">
						Compete in tournaments, leagues, and wagers with complete transparency. Smart contracts
						handle stakes, payouts, and dispute resolution through decentralized governance.
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
						<h2 className="mb-4 font-bold text-4xl md:text-5xl">Why Choose Arena DAO?</h2>
						<p className="mx-auto max-w-2xl text-foreground/70 text-lg">
							Built for competitive gaming communities, powered by blockchain technology
						</p>
					</motion.div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<FeatureCard
							title="Decentralized & Fair"
							description="Community-governed dispute resolution ensures all competitions are fair and transparent. No central authority controls outcomes."
							icon={<Scale className="h-6 w-6 text-primary" />}
							delay={0}
						/>
						<FeatureCard
							title="Secure Smart Contracts"
							description="All stakes and payouts are handled by audited smart contracts. Your funds are secure and automatically distributed."
							icon={<Lock className="h-6 w-6 text-primary" />}
							delay={0.2}
						/>
						<FeatureCard
							title="Global Community"
							description="Compete with players worldwide across multiple games and formats. Build your reputation in the Arena ecosystem."
							icon={<Globe className="h-6 w-6 text-primary" />}
							delay={0.4}
						/>
						<FeatureCard
							title="Multiple Formats"
							description="From quick wagers to season-long leagues and elimination tournaments. Find the competition format that suits you best."
							icon={<Trophy className="h-6 w-6 text-primary" />}
							delay={0.6}
						/>
						<FeatureCard
							title="Easy Team Management"
							description="Create and manage teams effortlessly. Invite members, track performance, and compete as a unified group."
							icon={<Users className="h-6 w-6 text-primary" />}
							delay={0.8}
						/>
						<FeatureCard
							title="Instant Settlements"
							description="No waiting for manual payouts. Smart contracts automatically distribute winnings the moment results are confirmed."
							icon={<Zap className="h-6 w-6 text-primary" />}
							delay={1}
						/>
					</div>
				</div>
			</section>

			{/* Competition Types Section */}
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
							Choose the perfect format for your competitive gaming needs
						</p>
					</motion.div>

					<div className="space-y-8">
						{/* Competition Types Overview */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0 }}
								viewport={{ once: true }}
								className="text-center"
							>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
									<Coins className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-2 font-bold text-xl">Wagers</h3>
								<p className="text-foreground/70">
									Quick head-to-head competitions with direct stakes
								</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								viewport={{ once: true }}
								className="text-center"
							>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
									<Trophy className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-2 font-bold text-xl">Tournaments</h3>
								<p className="text-foreground/70">Bracket-style elimination competitions</p>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								viewport={{ once: true }}
								className="text-center"
							>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
									<Gamepad2 className="h-8 w-8 text-primary" />
								</div>
								<h3 className="mb-2 font-bold text-xl">Leagues</h3>
								<p className="text-foreground/70">Season-long point-based competitions</p>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="relative py-20">
				<div className="container mx-auto px-6">
					<motion.div
						className="mb-16 text-center"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="mb-4 font-bold text-4xl md:text-5xl">How It Works</h2>
						<p className="mx-auto max-w-2xl text-foreground/70 text-lg">
							Get started in minutes with our simple process
						</p>
					</motion.div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
								<Shield className="h-8 w-8 text-primary" />
							</div>
							<div className="mb-4 font-bold text-6xl text-primary/20">01</div>
							<h3 className="mb-4 font-bold text-xl">Connect Wallet</h3>
							<p className="text-foreground/70">
								Connect your wallet to get started. We support all major wallets including Keplr,
								Leap, and MetaMask.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
								<Users className="h-8 w-8 text-primary" />
							</div>
							<div className="mb-4 font-bold text-6xl text-primary/20">02</div>
							<h3 className="mb-4 font-bold text-xl">Form a Team</h3>
							<p className="text-foreground/70">
								<span className="font-medium text-primary">Optional:</span> Create or join a team
								for group competitions. Collaborate with friends or find teammates in our community.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
								<Trophy className="h-8 w-8 text-primary" />
							</div>
							<div className="mb-4 font-bold text-6xl text-primary/20">03</div>
							<h3 className="mb-4 font-bold text-xl">Join or Create</h3>
							<p className="text-foreground/70">
								Browse existing competitions or create your own. Set rules, entry fees, and prize
								distributions.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
								<Zap className="h-8 w-8 text-primary" />
							</div>
							<div className="mb-4 font-bold text-6xl text-primary/20">04</div>
							<h3 className="mb-4 font-bold text-xl">Compete & Win</h3>
							<p className="text-foreground/70">
								Compete fairly with automated results verification and instant payouts through smart
								contracts.
							</p>
						</motion.div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative py-20">
				<div className="container mx-auto px-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						<Card className="border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5">
							<CardBody className="px-8 py-16 text-center">
								<h2 className="mb-6 font-bold text-4xl md:text-5xl">Ready to Compete?</h2>
								<p className="mx-auto mb-8 max-w-2xl text-foreground/80 text-lg">
									Join thousands of competitors already using Arena DAO for fair, transparent, and
									secure gaming competitions.
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
										Read Documentation
									</Button>
								</div>

								{env.ENV === "development" && (
									<div className="mt-8">
										<Chip color="primary" variant="bordered" size="lg" className="bg-primary/10">
											🚧 Currently running on testnet
										</Chip>
									</div>
								)}
							</CardBody>
						</Card>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
