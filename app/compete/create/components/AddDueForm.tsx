"use client";

import NFTInfo from "@/components/NFTInfo";
import TokenInfo from "@/components/TokenInfo";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Card,
	Divider,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Tab,
	Tabs,
	useDraggable,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import { Coins, ImagePlus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	Controller,
	useFieldArray,
	useForm,
	useFormContext,
} from "react-hook-form";
import { z } from "zod";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import {
	getBaseToken,
	getCw20Asset,
	getNativeAsset,
} from "~/helpers/TokenHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const DueFormSchema = z
	.object({
		tokenType: z.enum(["native", "cw20", "cw721"]),
		denomOrAddress: z
			.string()
			.min(1, { message: "Denom or address is required" }),
		amount: z.coerce
			.number()
			.positive()
			.optional()
			.transform((x) => x?.toString()),
		tokenIds: z.array(z.object({ id: z.string() })).optional(),
	})
	.superRefine((value, context) => {
		if (
			(value.tokenType === "cw20" || value.tokenType === "native") &&
			Number.isNaN(value.amount)
		) {
			context.addIssue({
				path: ["amount"],
				code: z.ZodIssueCode.custom,
				message: "Amount is required for fungible tokens",
			});
		}
		if (
			value.tokenType === "cw721" &&
			(!value.tokenIds || value.tokenIds.length === 0)
		) {
			context.addIssue({
				path: ["tokenIds"],
				code: z.ZodIssueCode.custom,
				message: "At least one Token ID is required for NFTs",
			});
		}
	});

type DueFormValues = z.infer<typeof DueFormSchema>;

interface AddDueFormProps {
	isOpen: boolean;
	onOpenChange: () => void;
	index: number;
	onClose: () => void;
}

const AddDueForm = ({
	isOpen,
	onOpenChange,
	index,
	onClose,
}: AddDueFormProps) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { assets } = useChain(env.CHAIN);
	const { control: competitionControl, getValues } =
		useFormContext<CreateCompetitionFormValues>();
	const targetRef = useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	const { append: appendNative } = useFieldArray({
		control: competitionControl,
		name: `directParticipation.dues.${index}.balance.native`,
	});

	const { append: appendCw20 } = useFieldArray({
		control: competitionControl,
		name: `directParticipation.dues.${index}.balance.cw20`,
	});

	const { append: appendCw721 } = useFieldArray({
		control: competitionControl,
		name: `directParticipation.dues.${index}.balance.cw721`,
	});

	const {
		control,
		handleSubmit,
		watch,
		setError,
		formState: { errors, isSubmitting },
		reset,
		setValue,
	} = useForm<DueFormValues>({
		resolver: zodResolver(DueFormSchema),
		defaultValues: {
			tokenType: "native",
			denomOrAddress: env.DEFAULT_NATIVE.toUpperCase(),
			tokenIds: [],
		},
	});

	const {
		fields: tokenIdFields,
		append: appendTokenId,
		remove: removeTokenId,
	} = useFieldArray({
		control,
		name: "tokenIds",
	});

	const watchDenomOrAddress = watch("denomOrAddress");
	const watchTokenType = watch("tokenType");
	const watchTokenIds = watch("tokenIds");

	const [debouncedDenomOrAddress, setDebouncedDenomOrAddress] =
		useState(watchDenomOrAddress);
	const [isSubmissionLoading, setIsSubmissionLoading] = useState(false);

	// Only set up debouncing - no validation
	useEffect(() => {
		const debouncer = _.debounce(setDebouncedDenomOrAddress, 500);
		debouncer(watchDenomOrAddress);
		return debouncer.cancel;
	}, [watchDenomOrAddress]);

	const handleTokenTypeChange = (value: string) => {
		setValue("tokenType", value as "native" | "cw20" | "cw721");
		setValue("denomOrAddress", value === "native" ? env.DEFAULT_NATIVE : "");
		setValue("amount", undefined);
		setValue("tokenIds", []);
	};

	const onSubmit = async (values: DueFormValues) => {
		setIsSubmissionLoading(true);
		try {
			switch (values.tokenType) {
				case "cw20":
					await handleCw20Submission(values);
					break;
				case "native":
					await handleNativeSubmission(values);
					break;
				case "cw721":
					await handleCw721Submission(values);
					break;
			}

			onClose();
		} catch (e) {
			console.error(e);
			setError("denomOrAddress", {
				message: (e as Error).message || "Invalid address or denom",
			});
		} finally {
			setIsSubmissionLoading(false);
		}
	};

	const handleCw20Submission = async (values: DueFormValues) => {
		if (!cosmWasmClient) throw new Error("Cannot get CosmWasm client");

		const cw20 = await getCw20Asset(
			cosmWasmClient,
			values.denomOrAddress,
			assets?.assets,
			env.BECH32_PREFIX,
		);

		if (
			getValues(`directParticipation.dues.${index}.balance.cw20`)?.find((x) =>
				cw20.denom_units.find((y) => y.denom === x.address),
			)
		) {
			throw new Error("This token has already been added");
		}

		if (!values.amount) {
			throw new Error("Amount is required for fungible tokens");
		}

		const token = getBaseToken(
			{ denom: values.denomOrAddress, amount: values.amount.toString() },
			cw20,
		);

		appendCw20({ address: token.denom, amount: token.amount });
	};

	const handleNativeSubmission = async (values: DueFormValues) => {
		const native = await getNativeAsset(
			values.denomOrAddress,
			env.RPC_URL,
			assets?.assets,
		);

		if (
			getValues(`directParticipation.dues.${index}.balance.native`)?.find((x) =>
				native.denom_units.find((y) => y.denom === x.denom),
			)
		) {
			throw new Error("This token has already been added");
		}

		if (!values.amount) {
			throw new Error("Amount is required for fungible tokens");
		}

		const token = getBaseToken(
			{ denom: values.denomOrAddress, amount: values.amount.toString() },
			native,
		);

		appendNative({ denom: token.denom, amount: token.amount });
	};

	const handleCw721Submission = async (values: DueFormValues) => {
		if (!values.tokenIds || values.tokenIds.length === 0) {
			throw new Error("Token IDs are required for NFTs");
		}

		appendCw721({
			address: values.denomOrAddress,
			token_ids: values.tokenIds.map((t) => t.id),
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			onClose={() => {
				reset();
				onClose();
			}}
			size="lg"
			ref={targetRef}
			classNames={{
				body: "p-6",
			}}
		>
			<ModalContent>
				<ModalHeader
					{...moveProps}
					className="flex items-center justify-between border-primary/10 border-b pb-3"
				>
					<div className="font-semibold text-xl">Add Due</div>
					{watchTokenType !== "cw721" && debouncedDenomOrAddress.length > 0 && (
						<div className="flex items-center gap-2">
							<TokenInfo
								denomOrAddress={debouncedDenomOrAddress}
								isNative={watchTokenType === "native"}
							/>
						</div>
					)}
				</ModalHeader>

				<ModalBody className="p-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<Controller
							control={control}
							name="tokenType"
							render={({ field }) => (
								<Tabs
									aria-label="Token type options"
									selectedKey={field.value}
									onSelectionChange={(key) =>
										handleTokenTypeChange(key as string)
									}
									color="primary"
									variant="bordered"
									fullWidth
								>
									<Tab
										key="native"
										title={
											<div className="flex items-center gap-2 px-1">
												<Coins size={18} />
												<span>Native</span>
											</div>
										}
									/>
									<Tab
										key="cw20"
										title={
											<div className="flex items-center gap-2 px-1">
												<Coins size={18} />
												<span>CW20</span>
											</div>
										}
									/>
									<Tab
										key="cw721"
										title={
											<div className="flex items-center gap-2 px-1">
												<ImagePlus size={18} />
												<span>NFT</span>
											</div>
										}
										isDisabled
									/>
								</Tabs>
							)}
						/>

						<Card className="border border-primary/10">
							<div className="space-y-4 p-4">
								<Controller
									control={control}
									name="denomOrAddress"
									render={({ field }) => (
										<div className="space-y-1">
											<Input
												{...field}
												autoFocus
												isRequired
												label={
													watchTokenType === "native"
														? "Token Denom"
														: "Token Address"
												}
												placeholder={
													watchTokenType === "native"
														? "Enter token denomination"
														: "Enter token contract address"
												}
												isDisabled={isSubmitting}
												isInvalid={!!errors.denomOrAddress}
												errorMessage={errors.denomOrAddress?.message}
												description={
													watchTokenType === "native"
														? "The denomination of the native token (e.g. ATOM, USDC)"
														: "The contract address of the CW20 token"
												}
											/>
										</div>
									)}
								/>

								{watchTokenType !== "cw721" && (
									<Controller
										control={control}
										name="amount"
										render={({ field }) => (
											<Input
												{...field}
												type="number"
												label="Amount"
												placeholder="Enter token amount"
												isRequired
												isDisabled={isSubmitting}
												isInvalid={!!errors.amount}
												errorMessage={errors.amount?.message}
												description="The amount of tokens to request"
											/>
										)}
									/>
								)}

								{watchTokenType === "cw721" && (
									<div className="space-y-4">
										<Divider className="my-2" />
										<div className="font-medium">NFT Token IDs</div>

										{tokenIdFields.map((field, index) => (
											<div key={field.id} className="flex items-center gap-2">
												<Controller
													control={control}
													name={`tokenIds.${index}.id`}
													render={({ field }) => (
														<Input
															{...field}
															isRequired
															label={`Token ID ${index + 1}`}
															placeholder="Enter NFT token ID"
															isDisabled={isSubmitting}
															className="flex-1"
														/>
													)}
												/>
												<Button
													color="danger"
													variant="flat"
													isIconOnly
													onPress={() => removeTokenId(index)}
													isDisabled={isSubmitting}
													className="mt-7"
												>
													<Trash size={18} />
												</Button>
											</div>
										))}

										<Button
											onPress={() => appendTokenId({ id: "" })}
											isDisabled={isSubmitting}
											variant="flat"
											color="primary"
											className="w-full"
										>
											Add Token ID
										</Button>
									</div>
								)}
							</div>
						</Card>

						{watchTokenType === "cw721" &&
							watchTokenIds &&
							watchTokenIds.length > 0 &&
							debouncedDenomOrAddress && (
								<Card className="border border-primary/10">
									<div className="p-4">
										<NFTInfo
											address={debouncedDenomOrAddress}
											tokenIds={watchTokenIds.map((t) => t.id)}
										/>
									</div>
								</Card>
							)}
					</form>
				</ModalBody>

				<ModalFooter className="border-primary/10 border-t">
					<Button
						variant="flat"
						onPress={onClose}
						isDisabled={isSubmitting || isSubmissionLoading}
					>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={() => handleSubmit(onSubmit)()}
						isLoading={isSubmitting || isSubmissionLoading}
					>
						Add Token
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddDueForm;
