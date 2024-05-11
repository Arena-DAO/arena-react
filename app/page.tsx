"use client"; 

import { Button, Image, Link } from "@nextui-org/react";
import NextImage from "next/image";
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import { useState } from "react"
import { Height } from "cosmjs-types/ibc/core/client/v1/client";

const items = [
	{
		id:1,
		title:"ArenaDAO - Immersing GameFi experience on Neuron",
		description:"Jump into the world of web3 games, enjoy the life as a crypto holder inside our wonderful world."
	},
	{
		id:2,
		title:"ArenaDAO - Immersing GameFi experience on Neuron",
		description:"Jump into the world of web3 games, enjoy the life as a crypto holder inside our wonderful world."
	},
	{
		id:3,
		title:"ArenaDAO - Immersing GameFi experience on Neuron",
		description:"Jump into the world of web3 games, enjoy the life as a crypto holder inside our wonderful world."
	},
	{
		id:4,
		title:"ArenaDAO - Immersing GameFi experience on Neuron",
		description:"Jump into the world of web3 games, enjoy the life as a crypto holder inside our wonderful world."
	}
]

function Arrow(props: {
	disabled: boolean
	left?: boolean
	onClick: (e: any) => void
  }) {
	const disabled = props.disabled ? " arrow--disabled" : ""
	return (
		<>
			<svg
			onClick={props.onClick}
			className={`arrow ${
				props.left ? "arrow--left" : "arrow--right"
			} ${disabled}`}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			>
			{props.left && (
				<path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
			)}
			{!props.left && (
				<path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
			)}
			</svg>
		</>
	)
  }

function HomePage() {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [loaded, setLoaded] = useState(false)
	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
		
		{
			initial: 0,
			slideChanged(slider) {
				setCurrentSlide(slider.track.details.rel)
			},
			created() {
				setLoaded(true)
			},
			loop: true,
		},
		[
		  (slider) => {
			let timeout: ReturnType<typeof setTimeout>
			let mouseOver = false
			function clearNextTimeout() {
			  clearTimeout(timeout)
			}
			function nextTimeout() {
			  clearTimeout(timeout)
			  timeout = setTimeout(() => {
				slider.next()
			  }, 5000)
			}
			slider.on("created", () => {
			  nextTimeout()
			})
			slider.on("dragStarted", clearNextTimeout)
			slider.on("animationEnded", nextTimeout)
			slider.on("updated", nextTimeout)
		  },
		]
	  )	
	return (
		<>
			<div ref={sliderRef} className="keen-slider relative flex">
				{items.map((item) => (
					<div key={item.id} className="keen-slider__slide relative" style={{height:"calc(100% - 128px)"}}>
						<img src={`/landing/${item.id}.jpg`} className="opacity-50" alt={`Image ${item.id}`} />
						<div className='absolute top-[20%] left-[5%]'>
							<div className="text-[400%] font-bold text-primary max-w-[70%]">{item.title}</div>
							<div className="font-semibold text-[150%] max-w-[40%]">{item.description}</div>
						</div>
					</div>	
				))}
				
				{loaded && instanceRef.current && (
					<>
						<Arrow
						left
						onClick={(e: any) =>
							e.stopPropagation() || instanceRef.current?.prev()
						}
						disabled={currentSlide === 0}
						/>

						<Arrow
						onClick={(e: any) =>
							e.stopPropagation() || instanceRef.current?.next()
						}
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
							onClick={() => {
							instanceRef.current?.moveToIdx(idx)
							}}
							className={"dot" + (currentSlide === idx ? " active" : "")}
						></button>
						)
					})}
					</div>
				)}
			</div>

			
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
				src="/future_of_competition.webp"
				alt="The future of competition"
				priority
				width="800"
				height="400"
				className="trophy_cursor mx-auto"
			/>
			<section className="mt-8 w-full flex gap-[10%] flex-row mx-auto max-w-[1280px] items-center">
				<div className="w-1/2">
					<h1 className='text-primary'>About ArenaDAO</h1>
					<p>
						At ArenaDAO, we are on a mission to revolutionize the gaming industry by combining the immersive experience of GameFi with the power of Neuron. We believe that gaming should be more than just a pastime; it should be an opportunity for players to explore, compete, and thrive in a world that embraces the principles of decentralization and ownership.
						<br/><br/>By leveraging Neuron's capabilities, we offer a seamless integration of smart contracts, decentralized finance (DeFi), and non-fungible tokens (NFTs). This integration gives players unprecedented control over their in-game assets and experiences. As a crypto holder, you can immerse yourself in our enchanting virtual realm, where every decision you make has real and tangible consequences.
					</p>
				</div>
				<div className="w-1/2">
					<img src="/landing/about.png"/>
				</div>
			</section>
			<section className="mt-8 w-full flex gap-[10%] flex-row-reverse mx-auto max-w-[1280px] items-center">
				<div className="w-1/2">
					<h1 className='text-primary'>Join Us and Embrace the Life of a Gladiator</h1>
					<p>
						Engage in thrilling battles that will test your skills, strategy, and courage. Whether you prefer one-on-one combat or large-scale multiplayer clashes, our platform offers a diverse range of challenging arenas where you can prove your worth. Embark on epic quests that will take you through treacherous dungeons, enchanted forests, and ancient ruins, each offering unique rewards and uncovering captivating storylines.
						<br/><br/>Join our vibrant community of fellow warriors, crypto enthusiasts, and game aficionados. Connect with like-minded individuals, form alliances, and engage in friendly competition. As you progress in your journey, you'll have the opportunity to acquire rare and valuable NFTs, trade them with other players, and even earn rewards through our innovative gameplay mechanics. The more you immerse yourself in the ArenaDAO world, the more you'll discover the boundless possibilities and the thrilling rewards that await you.
					</p>
				</div>
				<div className="w-1/2">
					<img src="/landing/join.png"/>
				</div>
			</section>
		</>
	);
}

export default HomePage;
