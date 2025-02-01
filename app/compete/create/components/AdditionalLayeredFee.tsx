import Profile from "@/components/Profile"; // Adjust the import path as needed
import { Button, Input } from "@heroui/react";
import { Minus, Percent } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
			<Profile address={addr} justAvatar />
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
								<Percent className="mt-auto" />
								<Button
									isIconOnly
									aria-label="Delete fee"
									onPress={() => remove(index)}
									className="my-auto"
									variant="faded"
								>
									<Minus />
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
