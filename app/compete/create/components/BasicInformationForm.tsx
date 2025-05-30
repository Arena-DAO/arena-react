"use client";

import ImageUpload from "@/components/ImageUpload";
import type { ImageUploaderRef } from "@/components/ImageUpload";
import { DatePicker, Input, Textarea } from "@heroui/react";
import { Select, SelectItem } from "@heroui/react";
import { getLocalTimeZone, now } from "@internationalized/date";
import { Image as ImageIcon } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { DurationUnits } from "~/config/schemas/DurationSchema";

export type BasicInformationFormRef = {
	uploadBannerImage: () => Promise<string | null>;
};

const BasicInformationSection = forwardRef<BasicInformationFormRef>((_props, ref) => {
	const {
		control,
		formState: { isSubmitting },
	} = useFormContext();
	const bannerImageRef = useRef<ImageUploaderRef>(null);

	useImperativeHandle(ref, () => ({
		uploadBannerImage: async () => {
			return bannerImageRef.current?.uploadToS3() ?? null;
		}
	}));

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div className="lg:col-span-2">
				<Controller
					name="banner"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<ImageUpload
							field={field}
							error={error}
							label="Banner Image"
							startContent={<ImageIcon size={16} className="text-default-400" />}
							ref={bannerImageRef}
							description="Optional banner image (16:9 ratio recommended)"
							className="w-full"
						/>
					)}
				/>
			</div>

			<Controller
				name="name"
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Competition Name"
						placeholder="Enter a unique and memorable name"
						description="Choose a clear, descriptive name"
						isRequired
						isDisabled={isSubmitting}
						isInvalid={!!error}
						errorMessage={error?.message}
						variant="bordered"
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
						label="Start Date & Time"
						description="When the competition begins"
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
						variant="bordered"
					/>
				)}
			/>

			<div className="lg:col-span-2">
				<Controller
					name="description"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Textarea
							{...field}
							label="Description"
							placeholder="Describe your competition rules, objectives, and any special requirements..."
							description="Provide clear details about what participants can expect"
							isDisabled={isSubmitting}
							isRequired
							isInvalid={!!error}
							errorMessage={error?.message}
							minRows={4}
							variant="bordered"
						/>
					)}
				/>
			</div>

			<div className="flex flex-row gap-4">
				<Controller
					control={control}
					name="duration.amount"
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Duration"
							description="How long the competition runs"
							isDisabled={isSubmitting}
							isInvalid={!!error}
							errorMessage={error?.message}
							isRequired
							className="flex-1"
							step="1"
							min="1"
							variant="bordered"
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
							variant="bordered"
						>
							{DurationUnits.map((unit) => (
								<SelectItem key={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>
							))}
						</Select>
					)}
				/>
			</div>
		</div>
	);
});

export default BasicInformationSection;
