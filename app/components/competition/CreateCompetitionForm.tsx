"use client";

import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { Control, useFormContext } from "react-hook-form";
import { z } from "zod";
import { CreateCompetitionSchema } from "~/config/schemas";

export type CreateCompetitionFormValues = z.infer<
	typeof CreateCompetitionSchema
>;

export interface FormComponentProps {
	cosmWasmClient: CosmWasmClient;
	control: Control<CreateCompetitionFormValues>;
}

interface CreateCompetitionFormProps {
	cosmWasmClient: CosmWasmClient;
	category_id?: number | null;
}

// biome-ignore lint/correctness/noEmptyPattern: <explanation>
export default function CreateCompetitionForm({}: CreateCompetitionFormProps) {
	const formMethods = useFormContext<CreateCompetitionFormValues>();
	const {
		register,
		control,
		watch,
		formState: { errors, isSubmitting, defaultValues },
		setValue,
	} = formMethods;

	const watchExpiration = watch("expiration");
	console.log(watchExpiration);

	return (
		<>
			<Input
				{...register("name")}
				label="Name"
				isDisabled={isSubmitting}
				isInvalid={!!errors.name}
				errorMessage={errors.name?.message}
				color={errors.name ? "danger" : "default"}
			/>
			<Textarea
				{...register("description")}
				label="Description"
				isDisabled={isSubmitting}
				isInvalid={!!errors.description}
				errorMessage={errors.description?.message}
				color={errors.description ? "danger" : "default"}
			/>
			<div className="grid grid-cols-12 gap-4">
				<Select
					label="Expiration"
					className="col-span-12 sm:col-span-6 md:col-span-4"
					onChange={(e) => {
						switch (e.target.value) {
							case "never":
								setValue("expiration", { never: {} });
								break;
							case "at_time":
								setValue("expiration", {
									at_time:
										defaultValues?.expiration &&
										"at_time" in defaultValues.expiration &&
										defaultValues.expiration.at_time
											? defaultValues.expiration.at_time
											: new Date().toString(),
								});
								break;
							case "at_height":
								setValue("expiration", { at_height: 0 });
								break;
						}
					}}
				>
					<SelectItem value="at_time" key="at_time">
						At Time
					</SelectItem>
					<SelectItem value="at_height" key="at_height">
						At Height
					</SelectItem>
					<SelectItem value="never" key="never">
						Never
					</SelectItem>
				</Select>
				{"at_height" in watchExpiration && (
					<Input
						className="col-span-12 sm:col-span-6"
						{...register("expiration.at_height")}
						label="Height"
						isDisabled={isSubmitting}
						isInvalid={!!errors.expiration}
						errorMessage={errors.expiration?.message}
						color={errors.expiration ? "danger" : "default"}
					/>
				)}
				{"at_time" in watchExpiration && (
					<Input
						{...register("expiration.at_time")}
						className="col-span-12 sm:col-span-6"
						type="datetime-local"
						placeholder="Select date and time"
						value={watchExpiration.at_time}
						label="Time"
						isDisabled={isSubmitting}
						isInvalid={!!errors.expiration}
						errorMessage={errors.expiration?.message}
						color={errors.expiration ? "danger" : "default"}
					/>
				)}
			</div>
		</>
	);
}
