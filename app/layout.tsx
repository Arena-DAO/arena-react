import type { PropsWithChildren } from "react";
import Footer from "./components/Footer";
import AppNavbar from "./components/NavBar";
import { Providers } from "./providers";

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>The Ultimate Arena 🏆</title>
				<meta charSet="UTF-8" />
				<meta
					name="description"
					content="Where wagers ignite rivalries, tournaments crown champions, and leagues forge legends."
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
			<body className="font-roboto">
				<Providers>
					<div className="flex min-h-screen flex-col">
						<AppNavbar />
						<div className="container mx-auto flex-grow pt-8">{children}</div>
						<Footer />
					</div>
				</Providers>
			</body>
		</html>
	);
};

export default Layout;
