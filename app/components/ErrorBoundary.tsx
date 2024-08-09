"use client";

import { Component, type ErrorInfo, type PropsWithChildren } from "react";
import { toast } from "react-toastify";

class ErrorBoundary extends Component<PropsWithChildren> {
	constructor(props: PropsWithChildren) {
		super(props);

		this.state = {};
	}
	static getDerivedStateFromError(_error: Error) {
		// Update state so the next render will show the fallback UI

		return {};
	}
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		toast.error(error.message);
		console.error({ error, errorInfo });
	}
	render() {
		return this.props.children;
	}
}

export default ErrorBoundary;
