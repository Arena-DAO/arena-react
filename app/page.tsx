"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";

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
								backgroundImage: `url('/landing/${id}.jpg')`,
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
					<div className="text-center text-[100%] md:max-w-[40%] md:text-left md:text-[150%] sm:text-[120%]">
						Jump into the world of web3 games, enjoy the life as a crypto holder
						inside our wonderful world.
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
			{/* About Section */}
			<section className="mx-auto mt-8 flex w-full max-w-[1280px] flex-col-reverse items-center gap-[10%] px-10 md:flex-row">
				<div className="text-center md:mx-auto md:w-1/2 md:text-left">
					<h1 className="title text-[250%] text-primary">About Arena DAO</h1>
					<p>
						At Arena DAO, we're revolutionizing gaming by merging the
						captivating world of GameFi with Neutron's power. Our mission is to
						create an immersive, decentralized experience that empowers players
						to explore, compete, and thrive through ownership.
						<br />
						<br />
						By integrating smart contracts, DeFi, and NFTs, we give players
						unprecedented control over their in-game assets and experiences. As
						a crypto holder, you can immerse yourself in our enchanting virtual
						realm, where your every decision holds real consequences.
					</p>
				</div>
				<div className="w-[80%] md:mx-auto md:w-1/2">
					<img src="/landing/about.png" alt="about" />
				</div>
			</section>
			{/* Join Us Section */}
			<section className="mx-auto mt-8 flex w-full max-w-[1280px] flex-col-reverse items-center gap-[10%] px-10 md:flex-row-reverse">
				<div className="text-center md:mx-auto md:w-1/2 md:text-left">
					<h1 className="title text-[250%] text-primary">
						Join Us and Embrace the Life of a Gladiator
					</h1>
					<p>
						Engage in thrilling battles and epic quests in our diverse arenas,
						where you can prove your worth and earn rewards.
						<br />
						<br />
						Join our vibrant community of warriors, crypto enthusiasts, and game
						aficionados to form alliances, compete, and acquire rare NFTs.{" "}
						<br />
						<br />
						Immerse yourself in the boundless possibilities of the ArenaDAO
						world.
					</p>
				</div>
				<div className="w-[80%] md:mx-auto md:w-1/2">
					<img src="/landing/join.png" alt="join" />
				</div>
			</section>
		</>
	);
}

export default HomePage;
