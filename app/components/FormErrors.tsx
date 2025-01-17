import { Card, CardBody, CardHeader } from "@heroui/react";
import type React from "react";
import type { FieldErrors } from "react-hook-form";
import { FiAlertTriangle } from "react-icons/fi";

interface FormErrorsProps {
	errors: FieldErrors;
}

const FormErrors: React.FC<FormErrorsProps> = ({ errors }) => {
	const renderError = (error: unknown, key: string): React.ReactNode => {
		if (typeof error === "string") {
			return (
				<li key={key}>
					{key}: {error}
				</li>
			);
		}
		if (
			error &&
			typeof error === "object" &&
			"message" in error &&
			typeof error.message === "string"
		) {
			return (
				<li key={key}>
					{key}: {error.message}
				</li>
			);
		}
		if (error && typeof error === "object") {
			return (
				<li key={key}>
					{key}:
					<ul className="list-disc pl-5">
						{Object.entries(error).map(([subKey, subError]) =>
							renderError(subError, subKey),
						)}
					</ul>
				</li>
			);
		}
		return null;
	};

	if (Object.keys(errors).length === 0) {
		return null;
	}

	return (
		<Card className="mb-6 text-danger">
			<CardHeader>
				<h3 className="flex items-center font-semibold text-xl">
					<FiAlertTriangle className="mr-2" /> Form Errors
				</h3>
			</CardHeader>
			<CardBody>
				<ul className="list-disc pl-5">
					{Object.entries(errors).map(([key, error]) =>
						renderError(error, key),
					)}
				</ul>
			</CardBody>
		</Card>
	);
};

export default FormErrors;
