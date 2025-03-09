"use client";

import TokenInfo from "@/components/TokenInfo";
import { Button, ButtonGroup, Input, useDisclosure } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { DurationUnits } from "~/config/schemas/DurationSchema";
import DaoConfigForm from "./DaoConfigForm";
import EntryFeeForm from "./EntryFeeForm";

const EnrollmentInformationForm = () => {
	const {
		control,
		setValue,
		formState: { isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();
	const entryFee = useWatch({ control, name: "enrollmentInfo.entryFee" });
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4">
				<div className="mb-2">
					<h2 className="font-semibold text-xl">Enrollment Information</h2>
					<p className="mt-1 text-foreground/70 text-sm">
						Configure member limits and registration details
					</p>
				</div>

				{/* Member Limits */}
				<Controller
					name="enrollmentInfo.minMembers"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Minimum Members"
							placeholder="Enter the minimum number of members"
							description="The competition needs at least this many members to start"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
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
							placeholder="Enter the maximum number of members"
							description="The competition won't allow more than this many members"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
							isRequired
						/>
					)}
				/>

				<Controller
					name="enrollmentInfo.requiredTeamSize"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							max="30"
							type="number"
							label="Required Team Size"
							placeholder="Enter the required team size"
							description="Teams must have exactly this many members to participate"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
						/>
					)}
				/>

				{/* Duration Before */}
				<div className="flex flex-row gap-4">
					<Controller
						control={control}
						name="enrollmentInfo.duration_before.amount"
						render={({ field, fieldState: { error } }) => (
							<Input
								{...field}
								type="number"
								label="Registration Deadline"
								description="The time before the competition's start time when registration will close."
								isDisabled={isSubmitting}
								isInvalid={!!error}
								errorMessage={error?.message}
								value={field.value?.toString()}
								onChange={(e) => field.onChange(Number(e.target.value))}
								isRequired
								className="flex-1"
								step="1"
								min="1"
							/>
						)}
					/>

					<Controller
						control={control}
						name="enrollmentInfo.duration_before.units"
						render={({ field, fieldState: { error } }) => (
							<Select
								{...field}
								label="Units"
								isDisabled={isSubmitting}
								isInvalid={!!error}
								errorMessage={error?.message}
								isRequired
								className="flex-1"
								selectedKeys={[field.value]}
							>
								{DurationUnits.map((unit) => (
									<SelectItem key={unit}>
										{unit.charAt(0).toUpperCase() + unit.slice(1)}
									</SelectItem>
								))}
							</Select>
						)}
					/>
				</div>
			</div>

			{/* Entry Fee */}
			<div className="flex flex-col gap-2">
				<h3 className="font-medium">Entry Fee</h3>
				<p className="text-foreground/70 text-sm">
					Amount that each participant must pay to enter the competition
				</p>
				<div className="flex items-center justify-between">
					{entryFee ? (
						<>
							<TokenInfo
								amount={BigInt(entryFee.amount)}
								denomOrAddress={entryFee.denom}
								isNative={true}
							/>
							<ButtonGroup isDisabled={isSubmitting}>
								<Button
									onPress={() => setValue("enrollmentInfo.entryFee", undefined)}
								>
									Remove Fee
								</Button>
								<Button onPress={onOpen}>Update Fee</Button>
							</ButtonGroup>
						</>
					) : (
						<Button onPress={onOpen} isDisabled={isSubmitting}>
							Set Entry Fee
						</Button>
					)}
				</div>
			</div>

			{/* DAO Configuration Section with improved heading */}
			<div className="mt-4">
				<DaoConfigForm />
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
