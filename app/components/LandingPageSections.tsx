import type React from "react";
import Image from "next/image";
import { BsShieldCheck, BsPeople, BsLightning } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";

interface FeatureProps {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	title: string;
	description: string;
}

const Feature: React.FC<FeatureProps> = ({
	icon: Icon,
	title,
	description,
}) => (
	<div className="flex flex-col items-center text-center md:items-start md:text-left">
		<Icon className="h-8 w-8 text-primary" />
		<h3 className="mt-4 font-semibold text-xl">{title}</h3>
		<p className="mt-2">{description}</p>
	</div>
);

interface LandingSectionProps {
	title: string;
	description: string;
	features: FeatureProps[];
	imageSrc: string;
	imageAlt: string;
	reverse?: boolean;
}

const LandingSection: React.FC<LandingSectionProps> = ({
	title,
	description,
	features,
	imageSrc,
	imageAlt,
	reverse = false,
}) => (
	<section
		className={`my-16 flex flex-col items-center gap-12 px-4 md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}
	>
		<div className="w-full md:w-1/2">
			<h2 className="font-bold text-4xl text-primary md:text-5xl lg:text-6xl">
				{title}
			</h2>
			<p className="mt-4 text-lg">{description}</p>
			<div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{features.map((feature, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: best option
					<Feature key={index} {...feature} />
				))}
			</div>
		</div>
		<div className="w-full md:w-1/2">
			<Image src={imageSrc} alt={imageAlt} width={500} height={500} />
		</div>
	</section>
);

const LandingPageSections: React.FC = () => (
	<div className="container mx-auto">
		<LandingSection
			title="Empowering Management at All Levels"
			description="Arena DAO revolutionizes team management and organizational transparency in competitive communities, leveraging cutting-edge DAO technology."
			features={[
				{
					icon: FiUsers,
					title: "Customizable Team Creation",
					description:
						"Build unique teams with tailored governance structures and shared treasuries.",
				},
				{
					icon: BsLightning,
					title: "Automated Rewards",
					description:
						"Configure preset distributions for fair, instant payouts to team members.",
				},
				{
					icon: BsPeople,
					title: "Complete Representation",
					description:
						"Ensure every team member has a voice in decision-making processes.",
				},
			]}
			imageSrc="/images/landing_helmet.png"
			imageAlt="Helmet representing team unity"
		/>
		<LandingSection
			title="Decentralized Competition Infrastructure"
			description="Arena DAO provides a secure, efficient, and innovative platform for competitions, reducing reliance on centralized systems."
			features={[
				{
					icon: BsShieldCheck,
					title: "Enhanced Security",
					description:
						"Utilize blockchain technology for secure transactions and user-controlled funds.",
				},
				{
					icon: BsLightning,
					title: "Cost-Efficient",
					description:
						"Leverage Neutron's minimal gas fees for seamless, low-cost operations.",
				},
				{
					icon: FiUsers,
					title: "Open Innovation",
					description:
						"Foster a dynamic ecosystem with customizable rules and competition formats.",
				},
			]}
			imageSrc="/images/landing_colosseum.png"
			imageAlt="Colosseum representing the competitive arena"
			reverse={true}
		/>
	</div>
);

export default LandingPageSections;
