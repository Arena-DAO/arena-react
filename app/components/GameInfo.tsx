import React from "react";
import {
  StackedCarousel,
  ResponsiveContainer,
} from "react-stacked-center-carousel";

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
export const data = [
  {
    cover: "/category_images/call-of-duty.webp",
    title: "Call Of Duty",
  },
  {
    cover: "/category_images/ea-sports-fc-24.webp",
    title: "FC 2024",
  },
  {
    cover: "/category_images/league-of-legends.jpg",
    title: "League of Legends",
  },
  {
    cover: "/category_images/rocket-league.webp",
    title: "Rocket League",
  },
  {
    cover: "/category_images/fortnite.webp",
    title: "Fortnite",
  },
  {
    cover: "/category_images/overwatch-2.webp",
    title: "Overwatch 2",
  },
  {
    cover: "/category_images/valorant.webp",
    title: "Valorant",
  },
  {
    cover: "/category_images/counter-strike.webp",
    title: "Counter Strike",
  },
  {
    cover: "/category_images/dota-2.jpg",
    title: "Dota 2",
  },
];


export default function GameInfo(props) {
  const ref = React.useRef();
  return (
    <div style={{ width: "100%", position: "relative" }} className="px-10 max-w-[1280px] mx-auto">
        <div className="title text-center text-6xl text-[#FF8000] mt-8 mb-4">
            Our Games
        </div>
      <ResponsiveContainer
        carouselRef={ref}
        render={(parentWidth, carouselRef) => {
          // If you want to use a ref to call the method of StackedCarousel, you cannot set the ref directly on the carousel component
          // This is because ResponsiveContainer will not render the carousel before its parent's width is determined
          // parentWidth is determined after your parent component mounts. Thus if you set the ref directly it will not work since the carousel is not rendered
          // Thus you need to pass your ref object to the ResponsiveContainer as the carouselRef prop and in your render function you will receive this ref object
          let currentVisibleSlide = 5;
          if (parentWidth <= 1440) currentVisibleSlide = 3;
          if (parentWidth <= 1080) currentVisibleSlide = 1;
          return (
            <StackedCarousel
              ref={carouselRef}
              slideComponent={Card}
              slideWidth={parentWidth < 800 ? parentWidth - 40 : 750}
              carouselWidth={parentWidth}
              data={data}
              currentVisibleSlide={currentVisibleSlide}
              maxVisibleSlide={5}
              useGrabCursor
            />
          );
        }}
      />
      <>
          <Arrow
          style={{ position: "absolute", top: "40%", left: 10, zIndex: 100 }}
          left
          size="small"
          color="primary"
          onClick={() => {
            ref.current?.goBack();
          }}
          />

          <Arrow
          style={{ position: "absolute", top: "40%", right: 10, zIndex: 100 }}
          size="small"
          color="primary"
          onClick={() => {
            ref.current?.goNext(6);
          }}
          />
      </>
    </div>
  );
}

// Very import to memoize your Slide component otherwise there might be performance issue
// At minimum your should do a simple React.memo(SlideComponent)
// If you want the absolute best performance then pass in a custom comparator function like below 
export const Card = React.memo(function (props) {
  const { data, dataIndex } = props;
  const { cover } = data[dataIndex];
  return (
    <div
      style={{
        width: "100%",
        height: 500,
        userSelect: "none",
      }}
      className="my-slide-component"
    >
      <img
        style={{
          height: "100%",
          width: "100%",
          objectFit: "cover",
          borderRadius: 0,
        }}
        draggable={false}
        src={cover}
      />
    </div>
  );
});