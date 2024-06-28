import { Card, CardBody, Select, SelectItem, Switch } from "@nextui-org/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const TournamentInformationForm = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

	const eliminationType = useWatch({
		control,
		name: "tournamentInfo.eliminationType",
	});

	return (
		<Card>
			<CardBody className="space-y-4">
				<Controller
					name="tournamentInfo.eliminationType"
					control={control}
					render={({ field }) => (
						<Select
							label="Elimination Type"
							selectedKeys={[field.value]}
							onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
						>
							<SelectItem key="single">Single Elimination</SelectItem>
							<SelectItem key="double">Double Elimination</SelectItem>
						</Select>
					)}
				/>
				{eliminationType === "single" && (
					<Controller
						name="tournamentInfo.playThirdPlace"
						control={control}
						render={({ field }) => (
							<Switch isSelected={field.value} onValueChange={field.onChange}>
								Play Third Place Match
							</Switch>
						)}
					/>
				)}
				{/* Tournament distribution fields */}
				{/* You can implement a custom component for distribution here */}
			</CardBody>
		</Card>
	);
};

export default TournamentInformationForm;
