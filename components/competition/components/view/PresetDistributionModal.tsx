import {
	FormControl,
	FormErrorMessage,
	FormLabel,
} from "@chakra-ui/form-control";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Heading, Stack } from "@chakra-ui/layout";
import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	IconButton,
	Input,
	InputGroup,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Skeleton,
	Tooltip,
	useToast,
} from "@chakra-ui/react";
import { UserOrDAOCard } from "@components/cards/UserOrDAOCard";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import env from "~/config/env";
import { DistributionSchema } from "~/config/schemas";
import { isValidBech32Address } from "~/helpers/AddressHelpers";
import {
	ArenaEscrowClient,
	ArenaEscrowQueryClient,
} from "~/ts-codegen/arena/ArenaEscrow.client";
import { useArenaEscrowDistributionQuery } from "~/ts-codegen/arena/ArenaEscrow.react-query";
import { MemberShareForString } from "~/ts-codegen/arena/ArenaEscrow.types";

const FormSchema = z.object({
	member_shares: DistributionSchema,
});
type FormValues = z.infer<typeof FormSchema>;

interface PresetDistributionModalProps {
	escrow_addr: string;
	cosmwasmClient: CosmWasmClient;
	isOpen: boolean;
	onClose: () => void;
	address: string;
}

interface PresetDistributionInnerProps extends PresetDistributionModalProps {
	data?: MemberShareForString[];
}

interface WrapperUserOrDAOCardProps {
	control: Control<FormValues, any>;
	index: number;
	cosmwasmClient: CosmWasmClient;
}

function WrapperUserOrDAOCard({
	control,
	index,
	cosmwasmClient,
}: WrapperUserOrDAOCardProps) {
	const address = useWatch({ control, name: `member_shares.${index}.addr` });

	if (!isValidBech32Address(address)) return null;
	return <UserOrDAOCard cosmwasmClient={cosmwasmClient} address={address} />;
}

export function PresetDistributionModal({
	escrow_addr,
	cosmwasmClient,
	isOpen,
	onClose,
	address,
}: PresetDistributionModalProps) {
	const { data, isLoading } = useArenaEscrowDistributionQuery({
		client: new ArenaEscrowQueryClient(cosmwasmClient, escrow_addr),
		args: { addr: address },
	});

	return (
		<Skeleton isLoaded={!isLoading}>
			<PresetDistributionInner
				escrow_addr={escrow_addr}
				cosmwasmClient={cosmwasmClient}
				isOpen={isOpen}
				onClose={onClose}
				address={address}
				data={data || undefined}
			/>
		</Skeleton>
	);
}

function PresetDistributionInner({
	escrow_addr,
	cosmwasmClient,
	isOpen,
	onClose,
	address,
	data,
}: PresetDistributionInnerProps) {
	const toast = useToast();
	const { isWalletConnected, getSigningCosmWasmClient } = useChain(env.CHAIN);

	const {
		formState: { isSubmitting, errors },
		handleSubmit,
		control,
		register,
		reset,
	} = useForm<FormValues>({
		defaultValues: {
			member_shares: data,
		},
		resolver: zodResolver(FormSchema),
	});

	const { fields, append, remove } = useFieldArray({
		name: "member_shares",
		control,
	});

	const onSubmit = async (values: FormValues) => {
		try {
			const cosmwasmClient = await getSigningCosmWasmClient();
			if (!cosmwasmClient) throw "Could not get the CosmWasm client";
			if (!address) throw "Could not get user address";

			const escrowClient = new ArenaEscrowClient(
				cosmwasmClient,
				address,
				escrow_addr,
			);

			await escrowClient.setDistribution({
				distribution: values.member_shares,
			});

			toast({
				title: "Success",
				isClosable: true,
				status: "success",
				description:
					"The escrow has been assigned a preset distribution for your address",
			});
		} catch (e: any) {
			toast({
				status: "error",
				title: "Error",
				description: e.toString(),
				isClosable: true,
			});
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent>
				<form onSubmit={handleSubmit(async (data) => await onSubmit(data))}>
					<ModalHeader>Set Preset Distribution</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Stack>
							{fields.map((x, i) => (
								<Card variant="outline" key={x.id}>
									<CardHeader>
										<Heading size="md">Member {i + 1}</Heading>
									</CardHeader>
									<CardBody>
										<Stack>
											<FormControl
												isInvalid={!!errors.member_shares?.[i]?.addr}
											>
												<FormLabel>Address</FormLabel>
												<InputGroup>
													<Input {...register(`member_shares.${i}.addr`)} />
												</InputGroup>
												<FormErrorMessage>
													{errors.member_shares?.[i]?.addr?.message}
												</FormErrorMessage>
											</FormControl>
											<WrapperUserOrDAOCard
												cosmwasmClient={cosmwasmClient}
												index={i}
												control={control}
											/>
											<FormControl
												isInvalid={!!errors.member_shares?.[i]?.shares}
											>
												<FormLabel>Shares</FormLabel>
												<InputGroup>
													<Input
														type="number"
														{...register(`member_shares.${i}.shares`)}
													/>
												</InputGroup>
												<FormErrorMessage>
													{errors.member_shares?.[i]?.shares?.message}
												</FormErrorMessage>
											</FormControl>
										</Stack>
									</CardBody>
									<CardFooter>
										<Tooltip label="Delete Member">
											<IconButton
												aria-label="delete"
												variant="ghost"
												icon={<DeleteIcon />}
												onClick={() => remove(i)}
											/>
										</Tooltip>
									</CardFooter>
								</Card>
							))}
							<Tooltip label="Add Member">
								<IconButton
									variant="ghost"
									colorScheme="secondary"
									aria-label="add"
									alignSelf="flex-start"
									onClick={() => append({ addr: "", shares: "1" })}
									icon={<AddIcon />}
								/>
							</Tooltip>
						</Stack>
					</ModalBody>
					<ModalFooter>
						<ButtonGroup>
							<Button variant="ghost" onClick={() => reset()}>
								Reset
							</Button>
							<Button
								type="submit"
								isDisabled={!isWalletConnected}
								isLoading={isSubmitting}
							>
								Submit
							</Button>
						</ButtonGroup>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
