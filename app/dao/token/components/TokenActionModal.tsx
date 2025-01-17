import TokenInfo from "@/components/TokenInfo";
import type { Asset } from "@chain-registry/types";
import { useChain } from "@cosmos-kit/react";
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { CwAbcClient, CwAbcQueryClient } from "~/codegen/CwAbc.client";
import {
	cwAbcQueryKeys,
	useCwAbcBuyMutation,
	useCwAbcBuyQuoteQuery,
	useCwAbcSellMutation,
	useCwAbcSellQuoteQuery,
} from "~/codegen/CwAbc.react-query";
import { getBaseToken } from "~/helpers/TokenHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

interface TokenActionModalProps {
	isOpen: boolean;
	onClose: () => void;
	actionType: "mint" | "burn" | null;
	amount: string;
	supplyToken: Asset;
	reserveToken: Asset;
}

const TokenActionModal: React.FC<TokenActionModalProps> = ({
	isOpen,
	onClose,
	actionType,
	amount,
	supplyToken,
	reserveToken,
}) => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);
	const queryClient = useQueryClient();

	const client = React.useMemo(
		() =>
			cosmWasmClient
				? new CwAbcQueryClient(cosmWasmClient, env.ARENA_ABC_ADDRESS)
				: undefined,
		[cosmWasmClient, env.ARENA_ABC_ADDRESS],
	);

	const {
		data: buyQuote,
		isLoading: isBuyQuoteLoading,
		error: buyQuoteError,
	} = useCwAbcBuyQuoteQuery({
		client,
		args: {
			payment: getBaseToken(
				{ amount, denom: reserveToken.display },
				reserveToken,
			).amount,
		},
		options: {
			enabled: isOpen && actionType === "mint" && !!reserveToken,
		},
	});

	const {
		data: sellQuote,
		isLoading: isSellQuoteLoading,
		error: sellQuoteError,
	} = useCwAbcSellQuoteQuery({
		client,
		args: {
			payment: getBaseToken({ amount, denom: supplyToken.display }, supplyToken)
				.amount,
		},
		options: {
			enabled: isOpen && actionType === "burn" && !!supplyToken,
		},
	});

	const buyMutation = useCwAbcBuyMutation();
	const sellMutation = useCwAbcSellMutation();

	const handleConfirm = async () => {
		try {
			if (!address) throw new Error("Wallet is not connected");
			const client = new CwAbcClient(
				await getSigningCosmWasmClient(),
				address,
				env.ARENA_ABC_ADDRESS,
			);
			if (actionType === "mint") {
				await buyMutation.mutateAsync(
					{
						client,
						args: {
							funds: [
								{
									amount: getBaseToken(
										{ amount, denom: reserveToken.display },
										reserveToken,
									).amount,
									denom: reserveToken.base,
								},
							],
						},
					},
					{
						onSuccess: () => {
							queryClient.invalidateQueries(
								cwAbcQueryKeys.dumpState(env.ARENA_ABC_ADDRESS),
							);
						},
					},
				);
			} else if (actionType === "burn") {
				await sellMutation.mutateAsync(
					{
						client,
						args: {
							funds: [
								{
									amount: getBaseToken(
										{ amount, denom: supplyToken.display },
										supplyToken,
									).amount,
									denom: supplyToken.base,
								},
							],
						},
					},
					{
						onSuccess: () => {
							queryClient.invalidateQueries(
								cwAbcQueryKeys.dumpState(env.ARENA_ABC_ADDRESS),
							);
						},
					},
				);
			}
			onClose();
			toast.success("Transaction was successful");
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const renderError = () => {
		if (actionType === "mint" && (buyQuoteError || buyMutation.error)) {
			return (
				<div className="mb-4 text-red-500">
					{buyQuoteError?.message || buyMutation.error?.message}
				</div>
			);
		}
		if (actionType === "burn" && (sellQuoteError || sellMutation.error)) {
			return (
				<div className="mb-4 text-red-500">
					{sellQuoteError?.message || sellMutation.error?.message}
				</div>
			);
		}
		return null;
	};

	const isLoading =
		(isBuyQuoteLoading && actionType === "mint") ||
		(isSellQuoteLoading && actionType === "burn");

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Confirm Action
				</ModalHeader>
				<ModalBody className="gap-4">
					{renderError()}
					<div>Are you sure you want to {actionType} tokens?</div>
					<div>
						Amount:
						<TokenInfo
							denomOrAddress={
								actionType === "mint"
									? reserveToken.display
									: supplyToken.display
							}
							isNative
							amount={amount}
						/>
					</div>
					{actionType === "mint" && buyQuote && (
						<div>
							You will receive about:{" "}
							<TokenInfo
								denomOrAddress={supplyToken.base}
								isNative
								amount={BigInt(buyQuote.amount)}
							/>
						</div>
					)}
					{actionType === "burn" && sellQuote && (
						<div>
							You will receive about:{" "}
							<TokenInfo
								denomOrAddress={reserveToken.base}
								isNative
								amount={BigInt(sellQuote.amount)}
							/>
						</div>
					)}
					{isLoading && <div className="gap-4">Loading...</div>}
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={handleConfirm}
						disabled={isBuyQuoteLoading || isSellQuoteLoading}
						isLoading={buyMutation.isLoading || sellMutation.isLoading}
					>
						Confirm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default TokenActionModal;
