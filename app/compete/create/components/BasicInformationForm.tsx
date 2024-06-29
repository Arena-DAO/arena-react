import { parseAbsoluteToLocal } from "@internationalized/date";
import {
	DatePicker,
	Input,
	Radio,
	RadioGroup,
	Textarea,
} from "@nextui-org/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const BasicInformationForm = () => {
	const {
		control,
		formState: { isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();
	const competitionExpiration = useWatch({ control, name: "expiration" });

	return (
		<div className="space-y-4">
			<h3>Competition Info</h3>
			<Controller
				name="name"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Competition Name"
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
						description="Provide details about the competition (markdown is supported)"
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
						label="Competition Expiration"
						orientation="horizontal"
						isDisabled={isSubmitting}
						defaultValue="at_time"
						isInvalid={!!error}
						errorMessage={error?.message}
						onValueChange={(value) => {
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
							{...field}
							value={field.value.toString()}
							onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
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
							{...field}
							value={parseAbsoluteToLocal(field.value)}
							onChange={(x) => field.onChange(x.toAbsoluteString())}
							description="Select the date and time when the competition should expire"
						/>
					)}
				/>
			)}
			<Controller
				name="competitionType"
				control={control}
				render={({ field }) => (
					<RadioGroup
						{...field}
						label="Competition Type"
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
