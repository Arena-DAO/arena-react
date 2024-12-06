import NFTInfo from "@/components/NFTInfo";
import TokenInfo from "@/components/TokenInfo";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
	Spinner,
	useDraggable,
} from "@nextui-org/react";
import _ from "lodash";
import type React from "react";
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
		amount: z.number().positive().optional(),
		tokenIds: z.array(z.object({ id: z.string() })).optional(),
	})
	.superRefine((value, context) => {
		if (
			(value.tokenType === "cw20" || value.tokenType === "native") &&
			(!value.amount || value.amount <= 0)
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

const AddDueForm: React.FC<AddDueFormProps> = ({
	isOpen,
	onOpenChange,
	index,
	onClose,
}) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { assets } = useChain(env.CHAIN);
	const { control: competitionControl } =
		useFormContext<CreateCompetitionFormValues>();
	const targetRef = useRef(null);
	const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });

	const { append: appendNative, fields: nativeFields } = useFieldArray({
		control: competitionControl,
		name: `directParticipation.dues.${index}.balance.native`,
	});

	const { append: appendCw20, fields: cw20Fields } = useFieldArray({
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
			denomOrAddress: env.DEFAULT_NATIVE,
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
	const [isLoading, setIsLoading] = useState(false);

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
		setIsLoading(true);
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
			setError("denomOrAddress", { message: "Invalid address or denom" });
		} finally {
			setIsLoading(false);
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
			cw20Fields.find((x) =>
				cw20.denom_units.find((y) => y.denom === x.address),
			)
		) {
			throw new Error("Cannot add duplicates");
		}
		if (!values.amount) {
			throw new Error("Amount is required for fungible tokens");
		}
		const token = getBaseToken(
			{ denom: values.denomOrAddress, amount: values.amount.toString() },
			cw20,
		);
		appendCw20({ address: token.denom, amount: BigInt(token.amount) });
	};

	const handleNativeSubmission = async (values: DueFormValues) => {
		const native = await getNativeAsset(
			values.denomOrAddress,
			env.RPC_URL,
			assets?.assets,
		);
		if (
			nativeFields.find((x) =>
				native.denom_units.find((y) => y.denom === x.denom),
			)
		) {
			throw new Error("Cannot add duplicates");
		}
		if (!values.amount) {
			throw new Error("Amount is required for fungible tokens");
		}
		const token = getBaseToken(
			{ denom: values.denomOrAddress, amount: values.amount.toString() },
			native,
		);
		appendNative({ denom: token.denom, amount: BigInt(token.amount) });
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
			ref={targetRef}
		>
			<ModalContent>
				<ModalHeader {...moveProps} className="flex justify-between pr-8">
					<div>Add Due</div>
					{watchTokenType !== "cw721" && debouncedDenomOrAddress.length > 0 && (
						<TokenInfo
							denomOrAddress={debouncedDenomOrAddress}
							isNative={watchTokenType === "native"}
						/>
					)}
				</ModalHeader>
				<ModalBody className="space-y-4">
					<Controller
						control={control}
						name="tokenType"
						render={({ field }) => (
							<RadioGroup
								label="Token Type"
								value={field.value}
								onValueChange={handleTokenTypeChange}
							>
								<Radio value="native">Native</Radio>
								<Radio value="cw20">Cw20</Radio>
								<Radio value="cw721" isDisabled>
									NFT
								</Radio>
							</RadioGroup>
						)}
					/>
					<Controller
						control={control}
						name="denomOrAddress"
						render={({ field }) => (
							<Input
								{...field}
								autoFocus
								isRequired
								label={watchTokenType === "native" ? "Denom" : "Address"}
								isDisabled={isSubmitting}
								isInvalid={!!errors.denomOrAddress}
								errorMessage={errors.denomOrAddress?.message}
							/>
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
									isRequired
									isDisabled={isSubmitting}
									isInvalid={!!errors.amount}
									errorMessage={errors.amount?.message}
									value={field.value?.toString() || ""}
									onChange={(e) =>
										field.onChange(Number.parseFloat(e.target.value))
									}
								/>
							)}
						/>
					)}
					{watchTokenType === "cw721" && (
						<div>
							{tokenIdFields.map((field, index) => (
								<div
									key={field.id}
									className="mb-2 flex items-center space-x-2"
								>
									<Controller
										control={control}
										name={`tokenIds.${index}.id`}
										render={({ field }) => (
											<Input
												{...field}
												isRequired
												label={`Token ID ${index + 1}`}
												isDisabled={isSubmitting}
											/>
										)}
									/>
									<Button
										color="danger"
										onClick={() => removeTokenId(index)}
										isDisabled={isSubmitting}
									>
										Remove
									</Button>
								</div>
							))}
							<Button
								onClick={() => appendTokenId({ id: "" })}
								isDisabled={isSubmitting}
							>
								Add Token ID
							</Button>
						</div>
					)}
					{watchTokenType === "cw721" &&
						watchTokenIds &&
						watchTokenIds.length > 0 &&
						debouncedDenomOrAddress && (
							<NFTInfo
								address={debouncedDenomOrAddress}
								tokenIds={watchTokenIds.map((t) => t.id)}
							/>
						)}
				</ModalBody>
				<ModalFooter>
					<Button
						onClick={handleSubmit(onSubmit)}
						isLoading={isSubmitting || isLoading}
					>
						{isLoading ? <Spinner size="sm" /> : "Submit"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddDueForm;
