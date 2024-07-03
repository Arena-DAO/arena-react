import { Button, Input, Progress } from "@nextui-org/react";
import { useMemo } from "react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import { BsPercent } from "react-icons/bs";
import { FiMinus, FiPlus } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";

const LeagueInformationForm = () => {
	const {
		control,
		formState: { isSubmitting },
	} = useFormContext<CreateCompetitionFormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "leagueInfo.distribution",
	});

	const distribution = useWatch({
		control,
		name: "leagueInfo.distribution",
	});

	const totalPercentage = useMemo(() => {
		return (
			distribution?.reduce(
				(sum, item) => sum + (Number(item.percent) || 0),
				0,
			) || 0
		);
	}, [distribution]);

	return (
		<div className="space-y-6">
			<h3 className="font-semibold text-lg">League Info</h3>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Controller
					name="leagueInfo.matchWinPoints"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Points for Win"
							isRequired
							placeholder="Enter points"
							isInvalid={!!error}
							errorMessage={error?.message}
							isDisabled={isSubmitting}
							value={field.value?.toString()}
							onChange={(e) => field.onChange(BigInt(e.target.value))}
							description="Number of points awarded for winning a match"
						/>
					)}
				/>
				<Controller
					name="leagueInfo.matchDrawPoints"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Points for Draw"
							isRequired
							placeholder="Enter points"
							isInvalid={!!error}
							errorMessage={error?.message}
							isDisabled={isSubmitting}
							value={field.value?.toString()}
							onChange={(e) => field.onChange(BigInt(e.target.value))}
							description="Number of points awarded for a draw match"
						/>
					)}
				/>
				<Controller
					name="leagueInfo.matchLosePoints"
					control={control}
					render={({ field, fieldState: { error } }) => (
						<Input
							{...field}
							type="number"
							label="Points for Loss"
							isRequired
							placeholder="Enter points"
							isInvalid={!!error}
							errorMessage={error?.message}
							isDisabled={isSubmitting}
							value={field.value?.toString()}
							onChange={(e) => field.onChange(BigInt(e.target.value))}
							description="Number of points awarded for losing a match"
						/>
					)}
				/>
			</div>
			<h4 className="mb-4 font-semibold text-lg">Distribution</h4>
			<div className="space-y-4">
				{fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`leagueInfo.distribution.${index}.percent`}
						control={control}
						render={({ field, fieldState: { error } }) => (
							<Input
								{...field}
								type="number"
								label={`Percentage for ${getNumberWithOrdinal(index + 1)} place`}
								isRequired
								placeholder="Enter percentage"
								isInvalid={!!error}
								errorMessage={error?.message}
								endContent={
									<div className="flex space-x-2">
										<BsPercent className="mt-auto" />
										<Button
											isIconOnly
											aria-label="Delete distribution"
											onClick={() => remove(index)}
											className="my-auto"
											variant="faded"
										>
											<FiMinus />
										</Button>
									</div>
								}
								classNames={{ input: "text-right" }}
								value={field.value?.toString()}
								onChange={(e) =>
									field.onChange(Number.parseFloat(e.target.value))
								}
								description={`Percentage of the prize pool for the ${getNumberWithOrdinal(index + 1)} place`}
							/>
						)}
					/>
				))}
				<Button
					onClick={() => append({ percent: 0 })}
					startContent={<FiPlus />}
				>
					Add Distribution
				</Button>
			</div>
			<div className="mt-6">
				<Progress
					color="primary"
					label="Total Distribution"
					value={totalPercentage}
					showValueLabel={true}
					maxValue={100}
				/>
				{totalPercentage > 100 && (
					<p className="mt-2 text-danger text-sm">
						Total distribution exceeds 100%. Please adjust the percentages.
					</p>
				)}
			</div>
		</div>
	);
};

export default LeagueInformationForm;
