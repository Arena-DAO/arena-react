import NFTInfo from "@/components/NFTInfo";
import TokenAmount from "@/components/TokenAmount";
import TokenInfo from "@/components/TokenInfo";
import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	Card,
	CardBody,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
} from "@nextui-org/react";
import _ from "lodash";
import { useEffect, useState } from "react";
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

const AddDueForm = ({
	isOpen,
	onOpenChange,
	index,
	onClose,
}: AddDueFormProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { assets } = useChain(env.CHAIN);
	const { getValues } = useFormContext<CreateCompetitionFormValues>();

	const {
		handleSubmit,
		watch,
		setError,
		formState: { errors, isSubmitting, defaultValues },
		resetField,
		setValue,
		control,
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
	const watchAmount = watch("amount");
	const watchTokenIds = watch("tokenIds");
	const [isInit, setIsInit] = useState(true);

	const [debouncedDenomOrAddress, setDebouncedDenomOrAddress] =
		useState(watchDenomOrAddress);

	useEffect(() => {
		const debouncer = _.debounce((value) => {
			setDebouncedDenomOrAddress(value);
		}, 500);

		if (watchDenomOrAddress.trim() === "") {
			debouncer.cancel();
			setDebouncedDenomOrAddress("");
		} else if (isInit) {
			debouncer.cancel();
			setDebouncedDenomOrAddress(watchDenomOrAddress);
			setIsInit(false);
		} else {
			debouncer(watchDenomOrAddress);
		}

		return () => {
			debouncer.cancel();
		};
	}, [watchDenomOrAddress, isInit]);

	const onSubmit = async (values: DueFormValues) => {
		try {
			if (!cosmWasmClient) {
				throw "Could not get the CosmWasm client";
			}
			const { setValue } = useFormContext<CreateCompetitionFormValues>();
			switch (values.tokenType) {
				case "cw20": {
					const cw20 = await getCw20Asset(
						cosmWasmClient,
						values.denomOrAddress,
						env.IPFS_GATEWAY,
						assets?.assets,
						env.BECH32_PREFIX,
					);

					if (
						getValues(`dues.${index}.balance.cw20`).find(
							(x: { address: string }) =>
								cw20.denom_units.find((y) => y.denom === x.address),
						)
					) {
						setError("denomOrAddress", { message: "Cannot add duplicates" });
						return;
					}

					if (!values.amount) {
						throw new Error("Amount is required for fungible tokens");
					}

					const token = getBaseToken(
						{
							denom: values.denomOrAddress,
							amount: values.amount.toString(),
						},
						cw20,
					);

					setValue(`dues.${index}.balance.cw20`, [
						...getValues(`dues.${index}.balance.cw20`),
						{
							address: token.denom,
							amount: BigInt(token.amount),
						},
					]);
					break;
				}
				case "cw721": {
					if (!values.tokenIds || values.tokenIds.length === 0) {
						throw new Error("Token IDs are required for NFTs");
					}
					setValue(`dues.${index}.balance.cw721`, [
						...getValues(`dues.${index}.balance.cw721`),
						{
							address: values.denomOrAddress,
							token_ids: values.tokenIds.map((t) => t.id),
						},
					]);
					break;
				}
				case "native": {
					try {
						const native = await getNativeAsset(
							values.denomOrAddress,
							env.RPC_URL,
							assets?.assets,
						);

						if (
							getValues(`dues.${index}.balance.native`).find(
								(x: { denom: string }) =>
									native.denom_units.find((y) => y.denom === x.denom),
							)
						) {
							setError("denomOrAddress", { message: "Cannot add duplicates" });
							return;
						}

						if (!values.amount) {
							throw new Error("Amount is required for fungible tokens");
						}

						const token = getBaseToken(
							{
								denom: values.denomOrAddress,
								amount: values.amount.toString(),
							},
							native,
						);

						setValue(`dues.${index}.balance.native`, [
							...getValues(`dues.${index}.balance.native`),
							{ denom: token.denom, amount: BigInt(token.amount) },
						]);
					} catch {
						if (
							getValues(`dues.${index}.balance.native`).find(
								(x: { denom: string }) => values.denomOrAddress === x.denom,
							)
						) {
							setError("denomOrAddress", { message: "Cannot add duplicates" });
							return;
						}

						if (!values.amount) {
							throw new Error("Amount is required for fungible tokens");
						}

						setValue(`dues.${index}.balance.native`, [
							...getValues(`dues.${index}.balance.native`),
							{
								denom: values.denomOrAddress,
								amount: BigInt(values.amount),
							},
						]);
					}
					break;
				}
				default:
					break;
			}

			onClose();
			// biome-ignore lint/suspicious/noExplicitAny: try-catch
		} catch (e: any) {
			console.error(e);
			setError("denomOrAddress", { message: "Invalid address or denom" });
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			aria-label="Add Due"
			onClose={() => {
				resetField("denomOrAddress");
				setIsInit(true);
			}}
		>
			<ModalContent>
				<ModalHeader className="flex justify-between pr-8">
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
								defaultValue={defaultValues?.tokenType}
								{...field}
								onChange={(e) => {
									field.onChange(e);
									const denomOrAddress =
										e.target.value === "native"
											? defaultValues?.denomOrAddress ?? ""
											: "";
									setValue("denomOrAddress", denomOrAddress, {
										shouldTouch: true,
									});
									setDebouncedDenomOrAddress(denomOrAddress);
									setValue("amount", undefined, {
										shouldTouch: true,
									});
									setValue("tokenIds", [], {
										shouldTouch: true,
									});
								}}
							>
								<Radio value="native">Native</Radio>
								<Radio value="cw20">Cw20</Radio>
								<Radio value="cw721">NFT</Radio>
							</RadioGroup>
						)}
					/>
					<Controller
						control={control}
						name="denomOrAddress"
						render={({ field }) => (
							<Input
								autoFocus
								label={watchTokenType === "native" ? "Denom" : "Address"}
								isDisabled={isSubmitting}
								isInvalid={!!errors.denomOrAddress}
								errorMessage={errors.denomOrAddress?.message}
								{...field}
							/>
						)}
					/>
					{watchTokenType !== "cw721" && (
						<Controller
							control={control}
							name="amount"
							render={({ field }) => (
								<Input
									type="number"
									label="Amount"
									isDisabled={isSubmitting}
									isInvalid={!!errors.amount}
									errorMessage={errors.amount?.message}
									{...field}
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
												label={`Token ID ${index + 1}`}
												isDisabled={isSubmitting}
												{...field}
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
					{watchTokenType !== "cw721" &&
						watchAmount &&
						debouncedDenomOrAddress && (
							<Card>
								<CardBody>
									<TokenAmount
										amount={BigInt(watchAmount)}
										denomOrAddress={debouncedDenomOrAddress}
										isNative={watchTokenType === "native"}
									/>
								</CardBody>
							</Card>
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
					<Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
						Submit
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddDueForm;
