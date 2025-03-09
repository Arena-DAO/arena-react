import type { PropsWithChildren } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import AppNavbar from "./components/NavBar";
import { Providers } from "./providers";

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>The Arena 🏆</title>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content="Empowering Communities to Compete, Govern, and Win"
				/>
				<meta
					name="keywords"
					content="wagers, leagues, tournaments, dao, arena dao, arena, gaming, esports, neutron, competitive gaming, decentralized competition, open-source"
				/>
				<link rel="icon" href="/favicon.ico" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<meta property="og:image" content="/logo.png" />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:width" content="1081" />
				<meta property="og:image:height" content="1081" />
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#FF8000" />
			</head>
			<body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
				<Providers>
					<AppNavbar />
					<div className="mx-auto min-h-full w-full max-w-[1920px] flex-1 px-4 pb-10 sm:px-6 lg:px-8">
						<ErrorBoundary>{children}</ErrorBoundary>
					</div>
					<Footer />
				</Providers>
			</body>
		</html>
	);
};

export default Layout;
