"use client";

import { Button, DatePicker, Input, Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { getLocalTimeZone, now } from "@internationalized/date";
import { Controller, useFormContext } from "react-hook-form";
import { DurationUnits } from "~/config/schemas/DurationSchema";

const BasicInformationSection = () => {
	const {
		control,
		formState: { isSubmitting },
	} = useFormContext();

	return (
		<div className="flex flex-col gap-6">
			<Controller
				name="banner"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Banner Image URL"
						placeholder="Enter the URL for your banner image (16:9 recommended)"
						isDisabled={isSubmitting}
						isInvalid={!!error}
						errorMessage={error?.message}
					/>
				)}
			/>

			<Controller
				name="name"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Competition Name"
						placeholder="Enter a unique and memorable name"
						isRequired
						isDisabled={isSubmitting}
						isInvalid={!!error}
						errorMessage={error?.message}
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
						isDisabled={isSubmitting}
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
						minRows={4}
					/>
				)}
			/>

			<Controller
				name="date"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<DatePicker
						{...field}
						showMonthAndYearPickers
						minValue={now(getLocalTimeZone())}
						placeholderValue={now(getLocalTimeZone())}
						isDisabled={isSubmitting}
						granularity="minute"
						label="Date"
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
					/>
				)}
			/>

			<div className="flex flex-row gap-4">
				<Controller
					control={control}
					name="duration.amount"
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Duration"
							description="Duration needed for competition to be fully processed"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
							isRequired
							className="flex-1"
							step="1"
							min="1"
						/>
					)}
				/>

				<Controller
					control={control}
					name="duration.units"
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
			<Controller
				name="competitionType"
				control={control}
				render={({ field }) => (
					<div className="space-y-2">
						<div className="block font-medium text-sm">Competition Type</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							{[
								{
									value: "wager",
									label: "Wager",
									emoji: "🎲",
									desc: "Simple competition with wagering",
								},
								{
									value: "league",
									label: "League",
									emoji: "🥇",
									desc: "Round-robin style matches",
								},
								{
									value: "tournament",
									label: "Tournament",
									emoji: "🏆",
									desc: "Elimination brackets",
								},
							].map(({ value, label, emoji, desc }) => (
								<Button
									key={value}
									isDisabled={isSubmitting}
									onPress={() => field.onChange(value)}
									variant="bordered"
									className={`flex min-h-40 flex-col items-center rounded-xl border-2 p-6 transition-all ${
										field.value === value
											? "border-primary bg-primary/10"
											: "border-default-200 hover:border-primary/50"
									}`}
								>
									<span className="mb-3 text-4xl">{emoji}</span>
									<h3 className="font-semibold text-lg">{label}</h3>
									<p className="mt-1 text-center text-default-500 text-sm">
										{desc}
									</p>
								</Button>
							))}
						</div>
					</div>
				)}
			/>
		</div>
	);
};

export default BasicInformationSection;
