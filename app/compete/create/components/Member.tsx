import Profile from "@/components/Profile";
import { Button, Input } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateCompetitionFormValues } from "~/config/schemas/CreateCompetitionSchema";

interface MemberProps {
	memberIndex: number;
	onRemove: () => void;
}

const Member: React.FC<MemberProps> = ({ memberIndex, onRemove }) => {
	const { control } = useFormContext<CreateCompetitionFormValues>();
	const address = useWatch({
		control,
		name: `directParticipation.members.${memberIndex}.address`,
	});

	return (
		<div className="mb-4 flex items-center space-x-2">
			<Profile address={address} justAvatar />
			<Controller
				name={`directParticipation.members.${memberIndex}.address`}
				control={control}
				render={({ field, fieldState: { error } }) => (
					<Input
						{...field}
						label={`Member ${memberIndex + 1}`}
						placeholder="Enter member address"
						isInvalid={!!error}
						errorMessage={error?.message}
						isRequired
						endContent={
							<Button
								variant="faded"
								isIconOnly
								aria-label="Remove member"
								className="my-auto"
								onPress={onRemove}
							>
								<Trash2 />
							</Button>
						}
					/>
				)}
			/>
		</div>
	);
};

export default Member;
