import { ProfileInput } from "@/components/ProfileInput";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDraggable,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
	AddressFormSchema,
	type AddressFormValues,
} from "~/config/schemas/AddressSchema";
import { useEnv } from "~/hooks/useEnv";

interface TeamActionModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onClose: () => void;
	action: (team?: string) => Promise<void>;
}

const TeamActionModal: React.FC<TeamActionModalProps> = ({
	isOpen,
	onOpenChange,
	onClose,
	action,
}) => {
	const env = useEnv();
	const { address } = useChain(env.CHAIN);
	const targetRef = useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
	const {
		control,
		handleSubmit,
		formState: { errors, isLoading, isSubmitting },
	} = useForm<AddressFormValues>({
		resolver: zodResolver(AddressFormSchema),
	});
	const onSubmit = async (data: AddressFormValues) => {
		try {
			if (!address) throw Error("Wallet is not connected");

			await action(data.address);

			onClose();
		} catch (e) {
			console.error(e);
			toast.error((e as Error).message);
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} ref={targetRef}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<ModalContent>
					<ModalHeader {...moveProps}>Team Selection</ModalHeader>
					<ModalBody>
						<Controller
							name="address"
							control={control}
							render={({ field }) => (
								<ProfileInput
									label="Address"
									field={field}
									error={errors.address}
									isRequired
								/>
							)}
						/>
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							type="submit"
							isLoading={isLoading}
							isDisabled={isSubmitting}
						>
							Submit
						</Button>
					</ModalFooter>
				</ModalContent>
			</form>
		</Modal>
	);
};

export default TeamActionModal;
