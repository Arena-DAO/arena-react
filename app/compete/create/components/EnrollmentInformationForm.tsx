import TokenInfo from "@/components/TokenInfo";
import { parseAbsoluteToLocal } from "@internationalized/date";
import {
	Button,
	ButtonGroup,
	DatePicker,
	Input,
	useDisclosure,
} from "@nextui-org/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import EntryFeeForm from "./EntryFeeForm";

const EnrollmentInformationForm = () => {
	const { control, setValue } = useFormContext<CreateCompetitionFormValues>();
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	const entryFee = useWatch({ control, name: "enrollmentInfo.entryFee" });
	const competitionExpiration = useWatch({
		control,
		name: "expiration.at_time",
	});

	return (
		<div className="space-y-6">
			<h2 className="font-semibold text-lg">Enrollment Information</h2>
			<div className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Controller
						name="enrollmentInfo.minMembers"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								{...field}
								type="number"
								label="Minimum Members"
								placeholder="Enter minimum members"
								isInvalid={!!error}
								errorMessage={error?.message}
								description="The minimum number of participants required"
								value={field.value?.toString()}
								onChange={(e) =>
									field.onChange(Number.parseInt(e.target.value))
								}
							/>
						)}
					/>
					<Controller
						name="enrollmentInfo.maxMembers"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								{...field}
								type="number"
								label="Maximum Members"
								placeholder="Enter maximum members"
								isInvalid={!!error}
								errorMessage={error?.message}
								isRequired
								description="The maximum number of participants allowed"
								value={field.value.toString()}
								onChange={(e) =>
									field.onChange(Number.parseInt(e.target.value))
								}
							/>
						)}
					/>
				</div>
				<div>
					<h3 className="mb-2 font-medium text-md">Entry Fee</h3>
					{entryFee ? (
						<div className="flex items-center justify-between">
							<TokenInfo
								amount={BigInt(entryFee.amount)}
								denomOrAddress={entryFee.denom}
								isNative={true}
							/>
							<ButtonGroup>
								<Button
									onPress={() => setValue("enrollmentInfo.entryFee", undefined)}
								>
									Remove Fee
								</Button>
								<Button onPress={onOpen}>Update Fee</Button>
							</ButtonGroup>
						</div>
					) : (
						<Button onPress={onOpen}>Set Entry Fee</Button>
					)}
				</div>

				<div>
					<Controller
						name="enrollmentInfo.enrollment_expiration.at_time"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<DatePicker
								showMonthAndYearPickers
								label="Enrollment Expiration"
								value={parseAbsoluteToLocal(field.value)}
								onChange={(x) => field.onChange(x.toAbsoluteString())}
								minValue={parseAbsoluteToLocal(competitionExpiration)}
								isInvalid={!!error}
								errorMessage={error?.message}
								isRequired
								description="The deadline for enrolling in the competition"
								className="max-w-xs"
							/>
						)}
					/>
				</div>
			</div>
			<EntryFeeForm
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				onClose={onOpenChange}
			/>
		</div>
	);
};

export default EnrollmentInformationForm;
