import type { PropsWithChildren } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import AppNavbar from "./components/NavBar";
import { Providers } from "./providers";

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>Arena DAO - Premier Web3 Competition Platform</title>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content="Join the future of competitive gaming on Arena DAO. Create tournaments, leagues, and wagers with smart contracts, DAO governance, and instant payouts. Fair, transparent, and decentralized."
				/>
				<meta
					name="keywords"
					content="web3 gaming, blockchain tournaments, crypto wagers, esports dao, decentralized gaming, smart contract competitions, arena dao, neutron blockchain, competitive gaming platform, gaming dao"
				/>
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<meta property="og:image" content="/logo.png" />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:width" content="1081" />
				<meta property="og:image:height" content="1081" />
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#FF8000" />
			</head>
			<body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
				<Providers>
					<AppNavbar />
					<main className="mx-auto min-h-full w-full max-w-[1920px] flex-1">
						<ErrorBoundary>{children}</ErrorBoundary>
					</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
};

export default Layout;
