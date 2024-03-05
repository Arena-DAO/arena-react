"use client";

import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AddressSchema } from "~/config/schemas";
import { useEnv } from "~/hooks/useEnv";

const FormSchema = z.object({
	address: AddressSchema,
});
type FormValues = z.infer<typeof FormSchema>;

export default function Faucet() {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, defaultValues },
	} = useForm<FormValues>({
		defaultValues: {
			address,
		},
		resolver: zodResolver(FormSchema),
	});

	const onSubmit = async (values: FormValues) => {
		const response = await fetch(env.FAUCET_URL + values.address);
		if (!response.ok) {
			throw new Error("Could not request funds from the faucet");
		}
	};

	if (!env.FAUCET_URL) return <h1>Faucet is not defined...</h1>;
	return (
		<div className="space-y-4">
			<h1 className="text-5xl text-center">Juno Testnet Faucet</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<Input
					{...register("address")}
					label="Address"
					isDisabled={isSubmitting}
					value={defaultValues?.address}
					isInvalid={!!errors.address}
					errorMessage={errors.address?.message}
				/>
				<Button type="submit" isLoading={isSubmitting} className="ml-auto">
					Submit
				</Button>
			</form>
		</div>
	);
}
