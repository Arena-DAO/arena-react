import {
	type ZonedDateTime,
	getLocalTimeZone,
	now,
	parseAbsoluteToLocal,
} from "@internationalized/date";
import {
	Accordion,
	AccordionItem,
	Button,
	DatePicker,
	Image,
	Input,
	Radio,
	RadioGroup,
	Textarea,
	Tooltip,
} from "@nextui-org/react";
import NextImage from "next/image";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { FiInfo, FiPlus } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { withIpfsSupport } from "~/helpers/IPFSHelpers";
import AdditionalLayeredFeeItem from "./AdditionalLayeredFee";

const BasicInformationForm = () => {
	const {
		control,
		formState: { isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();
	const competitionExpiration = useWatch({ control, name: "expiration" });
	const {
		fields: additionalFeeFields,
		append: appendFee,
		remove: removeFee,
	} = useFieldArray({
		control,
		name: "additionalLayeredFees",
	});
	const bannerUrl = useWatch({ control, name: "banner" });

	return (
		<div className="space-y-6">
			<Controller
				name="banner"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<div className="space-y-2">
						<Input
							{...field}
							label="Banner URL"
							placeholder="Enter banner image URL"
							isInvalid={!!error}
							errorMessage={error?.message}
							description="Provide a URL for the banner image (aspect ratio 16:9 recommended)"
						/>
						{bannerUrl && (
							<Image
								as={NextImage}
								removeWrapper
								width="320"
								height="180"
								alt="Competition Banner"
								// biome-ignore lint/style/noNonNullAssertion: not null
								src={withIpfsSupport(bannerUrl)!}
							/>
						)}
					</div>
				)}
			/>
			<Controller
				name="name"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Name"
						placeholder="Enter competition name"
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
						description="Provide a unique and descriptive name for your competition"
					/>
				)}
			/>
			<Controller
				name="description"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Textarea
						{...field}
						label="Description"
						placeholder="Describe your competition"
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
						description="Provide details about the competition"
					/>
				)}
			/>
			<Controller
				control={control}
				name="expiration"
				render={({
					field,
					fieldState: { error },
					formState: { defaultValues },
				}) => (
					<RadioGroup
						label="Expiration"
						orientation="horizontal"
						isDisabled={isSubmitting}
						defaultValue="at_time"
						isInvalid={!!error}
						errorMessage={error?.message}
						onValueChange={(value: string) => {
							switch (value) {
								case "never":
									field.onChange({ never: {} });
									break;
								case "at_time":
									field.onChange({
										at_time:
											defaultValues?.expiration &&
											"at_time" in defaultValues.expiration &&
											defaultValues.expiration.at_time
												? defaultValues.expiration.at_time
												: new Date().toString(),
									});
									break;
								case "at_height":
									field.onChange({ at_height: 0 });
									break;
							}
						}}
						description="Select when the competition should expire"
					>
						<Radio value="at_time">At Time</Radio>
						<Radio value="at_height">At Height</Radio>
						<Radio value="never">Never</Radio>
					</RadioGroup>
				)}
			/>
			{"at_height" in competitionExpiration && (
				<Controller
					control={control}
					name="expiration.at_height"
					render={({ field, fieldState: { error } }) => (
						<Input
							className="col-span-12 sm:col-span-6 lg:col-span-4"
							label="Height"
							type="number"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
							isRequired
							{...field}
							value={field.value.toString()}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								field.onChange(Number.parseInt(e.target.value))
							}
							description="Specify the block height at which the competition should expire"
						/>
					)}
				/>
			)}
			{"at_time" in competitionExpiration && (
				<Controller
					control={control}
					name="expiration.at_time"
					render={({ field, fieldState: { error } }) => (
						<DatePicker
							showMonthAndYearPickers
							className="col-span-12 sm:col-span-6 lg:col-span-4"
							label="Time"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
							isRequired
							minValue={parseAbsoluteToLocal(
								now(getLocalTimeZone()).toAbsoluteString(),
							)}
							{...field}
							value={parseAbsoluteToLocal(field.value)}
							onChange={(x: ZonedDateTime | null) =>
								field.onChange(x?.toAbsoluteString())
							}
							description="Select the date and time when the competition should expire"
						/>
					)}
				/>
			)}
			<Accordion variant="bordered">
				<AccordionItem
					key="1"
					aria-label="Additional Layered Fees"
					title={
						<div className="flex items-center">
							Additional Layered Fees
							<Tooltip content="Allocate layered fees after the platform tax">
								<span className="ml-2 cursor-help">
									<FiInfo />
								</span>
							</Tooltip>
						</div>
					}
					classNames={{ title: "text-medium", content: "gap-2" }}
				>
					{additionalFeeFields.map((field, index) => (
						<AdditionalLayeredFeeItem
							key={field.id}
							index={index}
							remove={removeFee}
						/>
					))}
					<Button
						onPress={() => appendFee({ addr: "", percentage: 0 })}
						startContent={<FiPlus />}
					>
						Add Fee
					</Button>
				</AccordionItem>
			</Accordion>
			<Controller
				name="competitionType"
				control={control}
				render={({ field }) => (
					<RadioGroup
						{...field}
						label="Type"
						orientation="horizontal"
						description="Choose the format of your competition"
					>
						<Radio value="wager">Wager</Radio>
						<Radio value="league">League</Radio>
						<Radio value="tournament">Tournament</Radio>
					</RadioGroup>
				)}
			/>
		</div>
	);
};

export default BasicInformationForm;
