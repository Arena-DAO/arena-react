import { Button, Image, Link } from "@nextui-org/react";
import NextImage from "next/image";

function HomePage() {
	return (
		<main className="space-y-12">
			{/* Hero Section */}
			<section className="mt-8 w-full text-center">
				<h1 className="mb-6 font-bold text-6xl">
					Welcome to <span className="text-primary">The Arena</span>
				</h1>
				<p className="mb-8 text-xl">A hub for competitive communities</p>
				<div className="space-x-4">
					<Button
						size="lg"
						as={Link}
						href="/compete"
						color="primary"
						variant="solid"
					>
						Get Started
					</Button>
					<Button
						size="lg"
						as={Link}
						href="/resources/docs"
						color="primary"
						variant="ghost"
					>
						Learn More
					</Button>
				</div>
			</section>
			<Image
				as={NextImage}
				src="/future_of_competition.png"
				alt="The future of competition"
				priority
				width="800"
				height="400"
				className="trophy_cursor mx-auto"
			/>
		</main>
	);
}

export default HomePage;
