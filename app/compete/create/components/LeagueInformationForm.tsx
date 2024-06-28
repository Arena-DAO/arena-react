import { Card, CardBody, Input } from "@nextui-org/react";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const LeagueInformationForm = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

	return (
		<Card>
			<CardBody className="space-y-4">
				<Controller
					name="leagueInfo.matchWinPoints"
					control={control}
					render={({ field }) => (
						<Input
							type="number"
							label="Points for Win"
							{...field}
							value={field.value.toString()}
							onChange={(e) =>
								field.onChange(Number.parseInt(e.target.value, 10))
							}
						/>
					)}
				/>
				<Controller
					name="leagueInfo.matchDrawPoints"
					control={control}
					render={({ field }) => (
						<Input
							type="number"
							label="Points for Draw"
							{...field}
							value={field.value.toString()}
							onChange={(e) =>
								field.onChange(Number.parseInt(e.target.value, 10))
							}
						/>
					)}
				/>
				<Controller
					name="leagueInfo.matchLosePoints"
					control={control}
					render={({ field }) => (
						<Input
							type="number"
							label="Points for Loss"
							{...field}
							value={field.value.toString()}
							onChange={(e) =>
								field.onChange(Number.parseInt(e.target.value, 10))
							}
						/>
					)}
				/>
				{/* League distribution fields */}
				{/* You can implement a custom component for distribution here */}
			</CardBody>
		</Card>
	);
};

export default LeagueInformationForm;
