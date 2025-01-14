import { ProfileInput } from "@/components/ProfileInput";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@nextui-org/react";
import type React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { DaoDaoCoreClient } from "~/codegen/DaoDaoCore.client";
import { AddressSchema } from "~/config/schemas";
import { useEnv } from "~/hooks/useEnv";
import { useTeamStore } from "~/store/teamStore";

const AddressFormSchema = z.object({
	address: AddressSchema,
});

type AddressFormValues = z.infer<typeof AddressFormSchema>;

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
	const {
		control,
		handleSubmit,
		formState: { errors, isLoading, isSubmitting },
		setError,
	} = useForm<AddressFormValues>({
		resolver: zodResolver(AddressFormSchema),
	});
	console.log(errors);
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
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<ModalContent>
					<ModalHeader>Add Existing Team</ModalHeader>
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
							Add
						</Button>
					</ModalFooter>
				</ModalContent>
			</form>
		</Modal>
	);
};

export default AddExistingTeamModal;
