"use client";

import {
	Alert,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { isValidContractAddress } from "~/helpers/AddressHelpers";
import { useEnv } from "~/hooks/useEnv";
import { ProfileInput } from "./ProfileInput";

// Define the Zod schema
const formSchema = z.object({
	daoAddress: z
		.string()
		.min(1, "DAO address is required")
		.refine((value) => isValidContractAddress(value), {
			message: "Please enter a valid DAO address",
		}),
});

// Type for the form values
type FormValues = z.infer<typeof formSchema>;

interface TeamViewModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function TeamViewModal({ isOpen, onClose }: TeamViewModalProps) {
	const env = useEnv();

	// Get current URL for the redirect
	const currentUrl = typeof window !== "undefined" ? window.location.href : "";

	// Initialize react-hook-form with zod resolver
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			daoAddress: "",
		},
	});

	// Handle form submission
	const onSubmit = (data: FormValues) => {
		// Construct the URL and navigate to it
		const teamViewUrl = `${env.DAO_DAO_URL}/dao/${data.daoAddress}/apps?url=${encodeURIComponent(currentUrl)}`;
		window.open(teamViewUrl, "_blank");

		// Reset form and close modal
		reset();
		onClose();
	};

	// Handle modal close
	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Modal size="2xl" isOpen={isOpen} onClose={handleClose}>
			<ModalContent>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalHeader className="flex flex-col gap-1">
						Enter DAO Address
					</ModalHeader>
					<ModalBody>
						<Alert description="Enter your DAO address to switch to Team Mode. This lets your team take actions, like signing up for competitions, using the team’s account instead of your personal one. When you sign up or take action, the team will be the one making decisions and receiving rewards, not individuals. You’ll be redirected to a page where your team can manage these actions together." />
						<Controller
							name="daoAddress"
							control={control}
							render={({ field }) => (
								<ProfileInput
									label="DAO Address"
									field={field}
									error={errors.daoAddress}
									isRequired
									isDisabled={isSubmitting}
									excludeSelf
								/>
							)}
						/>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={handleClose} type="button">
							Cancel
						</Button>
						<Button
							color="primary"
							type="submit"
							isLoading={isSubmitting}
							className="shadow-glow"
						>
							Open Team View
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
