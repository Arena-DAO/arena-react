import { parseAbsoluteToLocal } from "@internationalized/date";
import { Card, CardBody, DateInput, Input } from "@nextui-org/react";
import { Controller, useFormContext } from "react-hook-form";
import { FiDollarSign, FiUsers } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const EnrollmentInformationForm = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

	return (
		<Card>
			<CardBody className="p-6">
				<h2 className="mb-6 font-semibold text-2xl">Enrollment Information</h2>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<Controller
						name="enrollmentInfo.minMembers"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								type="number"
								label="Minimum Members"
								placeholder="Enter min members"
								labelPlacement="outside"
								startContent={<FiUsers />}
								className="max-w-xs"
								isInvalid={!!error}
								errorMessage={error?.message}
								{...field}
								value={field.value.toString()}
								onChange={(e) =>
									field.onChange(Number.parseInt(e.target.value, 10))
								}
							/>
						)}
					/>
					<Controller
						name="enrollmentInfo.maxMembers"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								type="number"
								label="Maximum Members"
								placeholder="Enter max members"
								labelPlacement="outside"
								startContent={<FiUsers />}
								className="max-w-xs"
								isInvalid={!!error}
								isRequired
								errorMessage={error?.message}
								{...field}
								value={field.value.toString()}
								onChange={(e) =>
									field.onChange(Number.parseInt(e.target.value, 10))
								}
							/>
						)}
					/>
					<Controller
						name="enrollmentInfo.entryFee.amount"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								type="text"
								label="Entry Fee Amount"
								placeholder="Enter fee amount"
								labelPlacement="outside"
								startContent={<FiDollarSign />}
								className="max-w-xs"
								isInvalid={!!error}
								errorMessage={error?.message}
								{...field}
							/>
						)}
					/>
					<Controller
						name="enrollmentInfo.entryFee.denom"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								type="text"
								label="Entry Fee Denom"
								placeholder="Enter fee denom"
								labelPlacement="outside"
								className="max-w-xs"
								isInvalid={!!error}
								errorMessage={error?.message}
								{...field}
							/>
						)}
					/>
					<Controller
						name="enrollmentInfo.enrollment_expiration.at_time"
						control={control}
						render={({ field, fieldState: { error } }) => (
							<DateInput
								label="Enrollment Expiration"
								labelPlacement="outside"
								className="max-w-xs"
								isInvalid={!!error}
								errorMessage={error?.message}
								isRequired
								defaultValue={parseAbsoluteToLocal(field.value)}
								onChange={(date) => field.onChange(date.toDate().toISOString())}
							/>
						)}
					/>
				</div>
			</CardBody>
		</Card>
	);
};

export default EnrollmentInformationForm;
