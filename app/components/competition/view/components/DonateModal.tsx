"use client";

import TokenInfo from "@/components/TokenInfo";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	addToast,
	useDisclosure,
	useDraggable,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";
import { ArenaEscrowClient } from "~/codegen/ArenaEscrow.client";
import {
	arenaEscrowQueryKeys,
	useArenaEscrowReceiveNativeMutation,
} from "~/codegen/ArenaEscrow.react-query";
import { getBaseToken, getNativeAsset } from "~/helpers/TokenHelpers";
import { useEnv } from "~/hooks/useEnv";

const donateFormSchema = z.object({
	denom: z.string().min(1, "Denom is required"),
	amount: z.coerce
		.number()
		.positive("Amount must be greater than 0")
		.transform((x) => x.toString()),
});

type DonateFormData = z.infer<typeof donateFormSchema>;

interface DonateModalProps {
	escrow: string;
}

const DonateModal: React.FC<DonateModalProps> = ({ escrow }) => {
	const env = useEnv();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { getSigningCosmWasmClient, address, assets } = useChain(env.CHAIN);
	const [isLoading, setIsLoading] = useState(false);
	// biome-ignore lint/style/noNonNullAssertion: correct
	const targetRef = useRef(null!);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
	const queryClient = useQueryClient();

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<DonateFormData>({
		resolver: zodResolver(donateFormSchema),
		defaultValues: {
			denom: env.DEFAULT_NATIVE,
			amount: undefined,
		},
	});

	const watchDenom = watch("denom");
	const [debouncedDenom, setDebouncedDenom] = useState(watchDenom);

	useEffect(() => {
		const debouncer = _.debounce(setDebouncedDenom, 500);
		debouncer(watchDenom);
		return debouncer.cancel;
	}, [watchDenom]);

	const receiveNativeMutation = useArenaEscrowReceiveNativeMutation();

	const onSubmit = async (data: DonateFormData) => {
		setIsLoading(true);
		try {
			if (!address) throw new Error("Wallet not connected");

			const native = await getNativeAsset(
				data.denom,
				env.RPC_URL,
				assets?.assets,
			);

			const token = getBaseToken(
				{ denom: data.denom, amount: data.amount.toString() },
				native,
			);

			const client = await getSigningCosmWasmClient();
			const escrowClient = new ArenaEscrowClient(client, address, escrow);

			await receiveNativeMutation.mutateAsync({
				client: escrowClient,
				args: {
					funds: [
						{
							denom: token.denom,
							amount: token.amount,
						},
					],
				},
			});
			await queryClient.invalidateQueries(
				arenaEscrowQueryKeys.dumpState(escrow, { addr: address }),
			);

			await queryClient.invalidateQueries(
				arenaEscrowQueryKeys.balances(escrow),
			);

			addToast({ color: "success", description: "Donation successful!" });
			reset();
			onClose();
		} catch (error) {
			console.error("Donation failed:", error);
			addToast({
				color: "danger",
				description: error instanceof Error ? error.message : "Donation failed",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<>
			<Button onPress={onOpen} color="primary">
				Donate
			</Button>
			<Modal isOpen={isOpen} onClose={handleClose} ref={targetRef}>
				<ModalContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<ModalHeader {...moveProps} className="flex justify-between pr-8">
							<div>Prize Pool Donation</div>
							{debouncedDenom.length > 0 && (
								<TokenInfo denomOrAddress={debouncedDenom} isNative={true} />
							)}
						</ModalHeader>
						<ModalBody className="space-y-4">
							<Controller
								name="denom"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										autoFocus
										label="Denom"
										placeholder="Enter denom"
										errorMessage={errors.denom?.message}
										isInvalid={!!errors.denom}
										isDisabled={isSubmitting}
									/>
								)}
							/>
							<Controller
								name="amount"
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="number"
										label="Amount"
										placeholder="Enter amount"
										errorMessage={errors.amount?.message}
										isInvalid={!!errors.amount}
										isDisabled={isSubmitting}
									/>
								)}
							/>
						</ModalBody>
						<ModalFooter>
							<Button
								color="danger"
								variant="light"
								onPress={handleClose}
								isDisabled={isSubmitting || isLoading}
							>
								Cancel
							</Button>
							<Button
								color="primary"
								type="submit"
								isLoading={isSubmitting || isLoading}
							>
								Donate
							</Button>
						</ModalFooter>
					</form>
				</ModalContent>
			</Modal>
		</>
	);
};

export default DonateModal;
