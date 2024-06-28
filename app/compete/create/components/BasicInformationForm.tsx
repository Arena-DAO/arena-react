import { Card, CardBody, Input, Textarea } from "@nextui-org/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const BasicInformationForm = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

	const useCrowdfunding = useWatch({ control, name: "useCrowdfunding" });

	return (
		<Card>
			<CardBody className="space-y-4">
				{!useCrowdfunding && (
					<Controller
						name="host"
						control={control}
						render={({ field }) => <Input label="Host" {...field} />}
					/>
				)}
				<Controller
					name="name"
					control={control}
					render={({ field }) => <Input label="Competition Name" {...field} />}
				/>
				<Controller
					name="description"
					control={control}
					render={({ field }) => <Textarea label="Description" {...field} />}
				/>
				<Controller
					name="expiration.at_time"
					control={control}
					render={({ field }) => (
						<Input
							type="datetime-local"
							label="Expiration"
							{...field}
							value={field.value.slice(0, 16)} // Format for datetime-local input
							onChange={(e) =>
								field.onChange(new Date(e.target.value).toISOString())
							}
						/>
					)}
				/>
			</CardBody>
		</Card>
	);
};

export default BasicInformationForm;
