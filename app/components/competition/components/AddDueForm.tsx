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
} from "@nextui-org/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
	Controller,
	UseFieldArrayAppend,
	UseFormGetValues,
	useForm,
} from "react-hook-form";
import { z } from "zod";
import {
	getBaseToken,
	getCw20Asset,
	getNativeAsset,
} from "~/helpers/TokenHelpers";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";
import { CreateCompetitionFormValues } from "../CreateCompetitionForm";

const DueFormSchema = z
	.object({
		tokenType: z.enum(["native", "cw20", "cw721"]),
		denomOrAddress: z
			.string()
			.min(1, { message: "Denom or address is required" }),
		amount: z.number().positive().optional(),
		tokenIds: z.array(z.object({ token_id: z.string() })).optional(),
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
	})
	.superRefine((value, context) => {
		if (
			value.tokenType === "cw721" &&
			(!value.tokenIds || value.tokenIds.length === 0)
		) {
			context.addIssue({
				path: ["tokenIds"],
				code: z.ZodIssueCode.custom,
				message: "Token id's are required for NFT's",
			});
		}
	});
type DueFormValues = z.infer<typeof DueFormSchema>;

interface AddDueFormProps {
	isOpen: boolean;
	onOpenChange: () => void;
	index: number;
	onClose: () => void;
	getValues: UseFormGetValues<CreateCompetitionFormValues>;
	cw20Append: UseFieldArrayAppend<
		CreateCompetitionFormValues,
		`dues.${number}.balance.cw20`
	>;
	nativeAppend: UseFieldArrayAppend<
		CreateCompetitionFormValues,
		`dues.${number}.balance.native`
	>;
	cw721Append: UseFieldArrayAppend<
		CreateCompetitionFormValues,
		`dues.${number}.balance.cw721`
	>;
}

const AddDueForm = ({
	isOpen,
	onOpenChange,
	cosmWasmClient,
	index,
	onClose,
	cw20Append,
	nativeAppend,
	getValues,
}: WithClient<AddDueFormProps>) => {
	const { data: env } = useEnv();
	const { assets } = useChain(env.CHAIN);
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
		},
	});
	const watchDenomOrAddress = watch("denomOrAddress");
	const watchTokenType = watch("tokenType");
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

		// Cleanup function to cancel the debounced call if the component unmounts
		return () => {
			debouncer.cancel();
		};
	}, [watchDenomOrAddress, isInit]);

	const onSubmit = async (values: DueFormValues) => {
		try {
			switch (values.tokenType) {
				case "cw20": {
					const cw20 = await getCw20Asset(
						cosmWasmClient,
						values.denomOrAddress,
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

					cw20Append({
						address: token.denom,
						amount: token.amount,
					});
					break;
				}
				case "cw721": {
					break;
				}
				case "native": {
					const native = await getNativeAsset(
						values.denomOrAddress,
						env.JUNO_API_URL,
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

					nativeAppend(token);
					break;
				}
				default:
					break;
			}

			onClose();
		} catch {
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
					{cosmWasmClient &&
						watchTokenType !== "cw721" &&
						debouncedDenomOrAddress.length > 0 && (
							<TokenInfo
								denomOrAddress={debouncedDenomOrAddress}
								isNative={watchTokenType === "native"}
								cosmWasmClient={cosmWasmClient}
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
									setValue("amount", 0, {
										shouldTouch: true,
									});
									setValue("tokenIds", [], {
										shouldTouch: true,
									});
								}}
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
								autoFocus
								label={watchTokenType === "native" ? "Denom" : "Address"}
								isDisabled={isSubmitting}
								isInvalid={!!errors.denomOrAddress}
								errorMessage={errors.denomOrAddress?.message}
								{...field}
							/>
						)}
					/>
					<Controller
						control={control}
						name="amount"
						render={({ field }) => (
							<Input
								hidden={watchTokenType === "cw721"}
								type="number"
								label="Amount"
								isDisabled={isSubmitting}
								isInvalid={!!errors.amount}
								errorMessage={errors.amount?.message}
								{...field}
								value={field.value?.toString()}
								onChange={(e) => field.onChange(parseFloat(e.target.value))}
							/>
						)}
					/>
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
