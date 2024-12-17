"use client";

import { Button } from "@nextui-org/react";
import { Component, type ErrorInfo, type PropsWithChildren } from "react";
import { toast } from "react-toastify";

type ErrorBoundaryState = {
	hasError: boolean;
};

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
	constructor(props: PropsWithChildren) {
		super(props);
		this.state = { hasError: false }; // Track error state
	}

	static getDerivedStateFromError(_error: Error) {
		// Update state to show fallback UI
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error and show toast notification
		toast.error("Something went wrong! Please try again.");
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// Render fallback UI when an error occurs
			return (
				<div style={{ padding: "20px", textAlign: "center" }}>
					<h1>Something went wrong 😢</h1>
					<p>We’re sorry for the inconvenience.</p>
					<Button
						className="mt-2"
						onPress={() => {
							// Reset the state and reload the page
							this.setState({ hasError: false });
							window.location.reload();
						}}
					>
						Reload Page
					</Button>
				</div>
			);
		}

		// Render children when no error has occurred
		return this.props.children;
	}
}

export default ErrorBoundary;
