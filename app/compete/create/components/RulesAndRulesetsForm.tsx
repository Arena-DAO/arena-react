import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import type React from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { FiPlus, FiTrash } from "react-icons/fi";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

const RulesAndRulesetsForm: React.FC = () => {
	const { control } = useFormContext<CreateCompetitionFormValues>();

	const {
		fields: ruleFields,
		append: appendRule,
		remove: removeRule,
	} = useFieldArray({
		control,
		name: "rules",
	});

	const {
		fields: rulesetFields,
		append: appendRuleset,
		remove: removeRuleset,
	} = useFieldArray({
		control,
		name: "rulesets",
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<h3 className="font-semibold text-lg">Rules</h3>
				</CardHeader>
				<CardBody>
					{ruleFields.map((field, index) => (
						<div key={field.id} className="mb-2 flex items-center space-x-2">
							<Controller
								name={`rules.${index}.rule`}
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										label={`Rule ${index + 1}`}
										placeholder="Enter a rule"
										className="flex-grow"
									/>
								)}
							/>
							<Button
								isIconOnly
								color="danger"
								aria-label="Delete rule"
								onClick={() => removeRule(index)}
							>
								<FiTrash />
							</Button>
						</div>
					))}
					<Button
						color="primary"
						startContent={<FiPlus />}
						onClick={() => appendRule({ rule: "" })}
					>
						Add Rule
					</Button>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h3 className="font-semibold text-lg">Rulesets</h3>
				</CardHeader>
				<CardBody>
					{rulesetFields.map((field, index) => (
						<div key={field.id} className="mb-2 flex items-center space-x-2">
							<Controller
								name={`rulesets.${index}.ruleset_id`}
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										type="number"
										value={field.value.toString()}
										label={`Ruleset ${index + 1}`}
										placeholder="Enter ruleset ID"
										className="flex-grow"
									/>
								)}
							/>
							<Button
								isIconOnly
								color="danger"
								aria-label="Delete ruleset"
								onClick={() => removeRuleset(index)}
							>
								<FiTrash />
							</Button>
						</div>
					))}
					<Button
						color="primary"
						startContent={<FiPlus />}
						onClick={() => appendRuleset({ ruleset_id: BigInt(0) })}
					>
						Add Ruleset
					</Button>
				</CardBody>
			</Card>
		</div>
	);
};

export default RulesAndRulesetsForm;
