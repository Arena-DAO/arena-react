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
import { DaoDaoCoreClient } from "~/codegen/DaoDaoCore.client";
import {
	AddressFormSchema,
	type AddressFormValues,
} from "~/config/schemas/AddressSchema";
import { useEnv } from "~/hooks/useEnv";
import { useTeamStore } from "~/store/teamStore";

interface AddExistingTeamModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	onClose: () => void;
}

const AddExistingTeamModal: React.FC<AddExistingTeamModalProps> = ({
	isOpen,
	onOpenChange,
	onClose,
}) => {
	const env = useEnv();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const teamStore = useTeamStore();
	const targetRef = useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
	const {
		control,
		handleSubmit,
		formState: { errors, isLoading, isSubmitting },
		setError,
	} = useForm<AddressFormValues>({
		resolver: zodResolver(AddressFormSchema),
	});
	const onSubmit = async (data: AddressFormValues) => {
		try {
			if (!address) throw Error("Wallet is not connected");
			if (teamStore.teams.find((x) => x === data.address)) {
				setError("address", {
					message: "This team is already in the user's list",
				});
				return;
			}

			const signingCosmWasmClient = await getSigningCosmWasmClient();

			const client = new DaoDaoCoreClient(
				signingCosmWasmClient,
				address,
				data.address,
			);

			const votingPower = await client.votingPowerAtHeight({ address });

			if (Number(votingPower.power) === 0) {
				setError("address", {
					message: "You are not a member of this team",
				});
				return;
			}

			teamStore.addTeam(data.address);
			onClose();
			toast.success("Team has been added");
		} catch (e) {
			console.error(e);
			toast.error((e as Error).message);
		}
	};

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} ref={targetRef}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<ModalContent>
					<ModalHeader {...moveProps}>Add Existing Team</ModalHeader>
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
									emptyTeams
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
							Add
						</Button>
					</ModalFooter>
				</ModalContent>
			</form>
		</Modal>
	);
};

export default AddExistingTeamModal;
