"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Button, Image, Link } from "@nextui-org/react";
import NextImage from "next/image";
import { useState } from "react";
import { useEnv } from "~/hooks/useEnv";

function Arrow(props: {
	disabled: boolean;
	left?: boolean;
	onClick: (e: React.MouseEvent<SVGSVGElement>) => void;
}) {
	const disabled = props.disabled ? " arrow--disabled" : "";
	return (
		<svg
			onClick={(e: React.MouseEvent<SVGSVGElement>) => {
				e.stopPropagation();
				props.onClick?.(e);
			}}
			onKeyUp={(e: React.KeyboardEvent<SVGSVGElement>) => {
				if (e.key === "Enter" || e.key === " ") {
					props.onClick?.(e as unknown as React.MouseEvent<SVGSVGElement>);
				}
			}}
			onKeyDown={(e: React.KeyboardEvent<SVGSVGElement>) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
				}
			}}
			className={`${
				props.left ? "arrow arrow--left" : "arrow arrow--right"
				// biome-ignore lint/nursery/useSortedClasses: Simplest option
			} ${disabled}`}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
		>
			<title>{props.left ? "Previous slide" : "Next slide"}</title>
			{props.left && (
				<path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
			)}
			{!props.left && (
				<path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
			)}
		</svg>
	);
}

function HomePage() {
	const { data: env } = useEnv();
	const [currentSlide, setCurrentSlide] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
		{
			initial: 0,
			slideChanged(slider) {
				setCurrentSlide(slider.track.details.rel);
			},
			created() {
				setLoaded(true);
			},
			loop: true,
		},
		[
			(slider) => {
				let timeout: ReturnType<typeof setTimeout>;
				function clearNextTimeout() {
					clearTimeout(timeout);
				}
				function nextTimeout() {
					clearTimeout(timeout);
					timeout = setTimeout(() => {
						slider.next();
					}, 5000);
				}
				slider.on("created", () => {
					nextTimeout();
				});
				slider.on("dragStarted", clearNextTimeout);
				slider.on("animationEnded", nextTimeout);
				slider.on("updated", nextTimeout);
			},
		],
	);
	return (
		<>
			<div
				ref={sliderRef}
				className="keen-slider relative flex min-h-[50vh] md:min-h-[100vh]"
			>
				{[1, 2, 3, 4].map((id) => (
					<div key={id} className="keen-slider__slide relative flex">
						<div
							className="absolute inset-0 z-[-1] bg-center bg-cover bg-no-repeat"
							style={{
								backgroundImage: `url('${env.JACKAL_PATH}landing_${id}.jpg')`,
								opacity: 0.5, // Set the opacity value (0 to 1)
							}}
						/>
					</div>
				))}
				<div className="absolute top-[30%] mx-10 my-auto opacity-100 md:top-[20%] md:left-[5%]">
					<div className="title text-center text-[180%] leading-none md:max-w-[70%] md:text-left md:text-[400%] sm:text-[250%]">
						Welcome to{" "}
						<span className="whitespace-nowrap text-primary">The Arena</span>
					</div>
					<div className="text-center text-[100%] md:text-left md:text-[150%] sm:text-[120%]">
						The next iteration of competition infrastructure
					</div>
					<div className="mt-2 flex justify-center gap-4 md:justify-normal">
						<Button as={Link} href="/compete" color="primary" variant="shadow">
							Get Started
						</Button>
						<Button
							as={Link}
							href={env.DOCS_URL}
							color="primary"
							isExternal
							variant="shadow"
						>
							Learn More
						</Button>
					</div>
				</div>

				{loaded && instanceRef.current && (
					<>
						<Arrow
							left
							onClick={(e: React.MouseEvent<SVGSVGElement>) => {
								e.stopPropagation();
								instanceRef.current?.prev();
							}}
							disabled={currentSlide === 0}
						/>

						<Arrow
							onClick={(e: React.MouseEvent<SVGSVGElement>) => {
								e.stopPropagation();
								instanceRef.current?.next();
							}}
							disabled={
								currentSlide ===
								instanceRef.current.track.details.slides.length - 1
							}
						/>
					</>
				)}

				{loaded && instanceRef.current && (
					<div className="dots absolute bottom-0 w-full">
						{[
							...Array(instanceRef.current.track.details.slides.length).keys(),
						].map((idx) => {
							return (
								<button
									key={idx}
									type="button"
									onClick={() => {
										instanceRef.current?.moveToIdx(idx);
									}}
									className={currentSlide === idx ? "dot active" : "dot"}
								/>
							);
						})}
					</div>
				)}
			</div>
			<section className="mx-auto mt-8 flex w-full max-w-screen-xl flex-col-reverse items-center gap-[10%] px-10 md:flex-row-reverse">
				<div className="text-center md:mx-auto md:w-1/2 md:text-left">
					<h1 className="title text-[250%] text-primary">
						Empowering Management at All Levels
					</h1>
					<p>
						The Arena DAO revolutionizes team management and organizational
						transparency within competitive communities by providing competition
						infrastructure built around the best DAO tooling available: DAO DAO.
						<br />
						<br />
						Users can leverage DAO DAO to create their own teams in a fully
						customizable and interactive way. Our platform allows teams to
						become more than just a group chat; they can set up unique
						governance structures, grow a treasury together, and compete with
						complete representation.
						<br />
						<br />
						Our platform enables teams to configure preset reward distributions,
						automating and ensuring fair payouts directly to team members'
						accounts. This automation eliminates manual calculation, hassles,
						and delays, providing peace of mind for both managers and players.
					</p>
				</div>
				<div className="w-[80%] md:mx-auto md:w-1/2">
					<Image
						as={NextImage}
						src={`${env.JACKAL_PATH}helmet.png`}
						alt="Helmet"
						width={2048}
						height={2048}
					/>
				</div>
			</section>
			<section className="mx-auto mt-8 flex w-full max-w-screen-xl flex-col-reverse items-center gap-[10%] px-10 md:flex-row">
				<div className="text-center md:mx-auto md:w-1/2 md:text-left">
					<h1 className="title text-[250%] text-primary">
						Decentralized Competition Infrastructure
					</h1>
					<p>
						The Arena DAO provides the best competitive platform by reducing the
						reliance on trust and centralized credit systems. Utilizing
						blockchain technology, the Arena DAO guarantees secure transactions,
						with funds always under the user's control unless in an active
						escrow.
						<br /> <br />
						This not only enhances security but also lowers costs, leveraging
						Neutron's minimal gas fees to provide a seamless and efficient
						experience for competitors.
						<br />
						<br />
						By embracing open-source principles, the Arena DAO fosters an
						ecosystem of continuous innovation, allowing users to craft custom
						rules and unique competition formats, ultimately driving a dynamic,
						inclusive, and forward-thinking competitive environment.
					</p>
				</div>
				<div className="w-[80%] md:mx-auto md:w-1/2">
					<Image
						as={NextImage}
						src={`${env.JACKAL_PATH}colosseum.png`}
						alt="Colosseum"
						width={2048}
						height={2048}
					/>
				</div>
			</section>
		</>
	);
}

export default HomePage;
