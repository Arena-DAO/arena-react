import Profile from "@/components/Profile"; // Adjust the import path as needed
import { Button, Input } from "@nextui-org/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiMinus } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

interface AdditionalLayeredFeeProps {
	index: number;
	remove: (index: number) => void;
}

const AdditionalLayeredFeeItem: React.FC<AdditionalLayeredFeeProps> = ({
	index,
	remove,
}) => {
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const addr = useWatch({
		control,
		name: `additionalLayeredFees.${index}.addr`,
	});

	return (
		<div className="mb-4 flex items-center space-x-2">
			<Profile address={addr} justAvatar className="min-w-max" />
			<Controller
				name={`additionalLayeredFees.${index}.addr`}
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label="Address"
						placeholder="Enter address"
						isRequired
						isInvalid={!!error}
						errorMessage={error?.message}
					/>
				)}
			/>
			<Controller
				name={`additionalLayeredFees.${index}.percentage`}
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						value={field.value?.toString()}
						onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
						type="number"
						label="Percentage"
						placeholder="Enter percentage"
						isRequired
						step="0.01"
						min="0"
						max="100"
						isInvalid={!!error}
						errorMessage={error?.message}
						endContent={
							<div className="flex space-x-2">
								<BsPercent className="mt-auto" />
								<Button
									isIconOnly
									aria-label="Delete fee"
									onClick={() => remove(index)}
									className="my-auto"
									variant="faded"
								>
									<FiMinus />
								</Button>
							</div>
						}
						classNames={{ input: "text-right" }}
					/>
				)}
			/>
		</div>
	);
};

export default AdditionalLayeredFeeItem;
