"use client";

import { useChain } from "@cosmos-kit/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAddressSchema } from "~/hooks/schemas/useAddressSchema";
import { useEnv } from "~/hooks/useEnv";

export default function Faucet() {
	const { data: env } = useEnv();
	const { address } = useChain(env.CHAIN);
	const addressSchema = useAddressSchema();
	const FormSchema = z.object({
		address: addressSchema,
	});
	type FormValues = z.infer<typeof FormSchema>;
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
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
			<h1 className="text-5xl">Juno Testnet Faucet</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<Input
					{...register("address")}
					label="Address"
					isDisabled={isSubmitting}
					isInvalid={!!errors.address}
					errorMessage={errors.address?.message}
					color={errors.address ? "danger" : "default"}
				/>
				<Button type="submit" isLoading={isSubmitting} className="ml-auto">
					Submit
				</Button>
			</form>
		</div>
	);
}
