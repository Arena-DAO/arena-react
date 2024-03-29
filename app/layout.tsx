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
				<meta
					name="description"
					content="A hub for competitive communities. 
					Dive into our framework for secure competitions including wagers, leagues, & tournaments. Play games for money."
				/>
				<link rel="icon" href="/favicon.ico" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
			</head>
			<body className="font-roboto min-h-screen">
				<Providers>
					<AppNavbar />
					<div
						className="container min-h-full max-h-fit mx-auto"
						style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
					>
						<ErrorBoundary>{children}</ErrorBoundary>
					</div>
					<Footer />
				</Providers>
			</body>
		</html>
	);
};

export default Layout;
