import {
	Button,
	Input,
	Progress,
	Radio,
	RadioGroup,
	Switch,
} from "@heroui/react";
import { Minus, Percent, Plus } from "lucide-react";
import { useMemo } from "react";
import {
	Controller,
	useFieldArray,
	useFormContext,
	useWatch,
} from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";

const TournamentInformationForm = () => {
	const {
		control,
		formState: { isSubmitting, defaultValues },
	} = useFormContext<CreateCompetitionFormValues>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "tournamentInfo.distribution",
	});

	const eliminationType = useWatch({
		control,
		name: "tournamentInfo.eliminationType",
	});

	const distribution = useWatch({
		control,
		name: "tournamentInfo.distribution",
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
			<div className="space-y-4">
				<Controller
					name="tournamentInfo.eliminationType"
					control={control}
					defaultValue={defaultValues?.tournamentInfo?.eliminationType}
					render={({ field }) => (
						<RadioGroup
							label="Elimination Type"
							orientation="horizontal"
							value={field.value}
							onValueChange={field.onChange}
							isDisabled={isSubmitting}
						>
							<Radio value="single">Single Elimination</Radio>
							<Radio value="double">Double Elimination</Radio>
						</RadioGroup>
					)}
				/>
				{eliminationType === "single" && (
					<Controller
						name="tournamentInfo.playThirdPlace"
						control={control}
						render={({ field }) => (
							<Switch
								{...field}
								value={field.value?.toString()}
								isSelected={field.value}
								onChange={field.onChange}
								isDisabled={isSubmitting}
							>
								Play Third Place Match
							</Switch>
						)}
					/>
				)}
			</div>
			<h4 className="mb-4 font-semibold text-lg">Distribution</h4>
			<div className="space-y-4">
				{fields.map((field, index) => (
					<Controller
						key={field.id}
						name={`tournamentInfo.distribution.${index}.percent`}
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
										<Percent className="mt-auto" />
										<Button
											isIconOnly
											aria-label="Delete distribution"
											onPress={() => remove(index)}
											className="my-auto"
											variant="faded"
										>
											<Minus />
										</Button>
									</div>
								}
								classNames={{ input: "text-right" }}
								isDisabled={isSubmitting}
							/>
						)}
					/>
				))}
				<Button
					onPress={() => append({ percent: "0" })}
					startContent={<Plus />}
					isDisabled={isSubmitting}
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

export default TournamentInformationForm;
