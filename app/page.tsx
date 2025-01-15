"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Button, Link } from "@nextui-org/react";
import { useState } from "react";
import { useEnv } from "~/hooks/useEnv";
import LandingPageSections from "./components/LandingPageSections";

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
	const env = useEnv();
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
		<div>
			<div
				ref={sliderRef}
				className="keen-slider relative flex min-h-[50vh] md:min-h-[100vh]"
			>
				{[1, 2, 3, 4].map((id) => (
					<div key={id} className="keen-slider__slide relative flex">
						<div
							className="absolute inset-0 z-[-1] bg-center bg-cover bg-no-repeat"
							style={{
								backgroundImage: `url('${env.JACKAL_PATH}landing_${id}.jpg'), url('/images/landing_${id}.jpg')`,
								opacity: 0.5, // Set the opacity value (0 to 1)
							}}
						/>
					</div>
				))}
				<div className="absolute top-[30%] mx-10 my-auto opacity-100 md:top-[20%] md:left-[5%]">
					<div className="title text-center text-[180%] leading-none sm:text-[250%] md:max-w-[70%] md:text-left md:text-[400%]">
						Welcome to{" "}
						<span className="whitespace-nowrap text-primary">The Arena</span>
					</div>
					<div className="text-center text-[100%] sm:text-[120%] md:text-left md:text-[150%]">
						⚔️ Empower Communities to Compete, Govern, and Win ⚔️
					</div>
					<div className="mt-2 flex justify-center gap-4 md:justify-normal">
						<Button as={Link} href="/compete" color="primary">
							Compete
						</Button>
						<Button as={Link} href={env.DOCS_URL} color="secondary" isExternal>
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
			<LandingPageSections />
		</div>
	);
}

export default HomePage;
