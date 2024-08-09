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
} from "@nextui-org/react";
import React from "react";
import { toast } from "react-toastify";
import { CwAbcClient, CwAbcQueryClient } from "~/codegen/CwAbc.client";
import {
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
	actionType: "buy" | "sell" | null;
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
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);
	const { getSigningCosmWasmClient, address } = useChain(env.CHAIN);

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
			enabled: isOpen && actionType === "buy" && !!reserveToken,
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
			enabled: isOpen && actionType === "sell" && !!supplyToken,
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
			if (actionType === "buy") {
				await buyMutation.mutateAsync({
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
				});
			} else if (actionType === "sell") {
				await sellMutation.mutateAsync({
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
				});
			}
			onClose();
		} catch (e) {
			console.error(e);
			toast.error((e as Error).toString());
		}
	};

	const renderError = () => {
		if (actionType === "buy" && (buyQuoteError || buyMutation.error)) {
			return (
				<div className="mb-4 text-red-500">
					{buyQuoteError?.message || buyMutation.error?.message}
				</div>
			);
		}
		if (actionType === "sell" && (sellQuoteError || sellMutation.error)) {
			return (
				<div className="mb-4 text-red-500">
					{sellQuoteError?.message || sellMutation.error?.message}
				</div>
			);
		}
		return null;
	};

	const isLoading =
		(isBuyQuoteLoading && actionType === "buy") ||
		(isSellQuoteLoading && actionType === "sell");

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Confirm Action
				</ModalHeader>
				<ModalBody>
					{renderError()}
					<p>Are you sure you want to {actionType} tokens?</p>
					<p>
						Amount: {amount}{" "}
						{actionType === "buy" ? reserveToken?.symbol : supplyToken?.symbol}
					</p>
					{actionType === "buy" && buyQuote && (
						<p>
							You will receive:{" "}
							<TokenInfo
								denomOrAddress={supplyToken.base}
								isNative
								amount={BigInt(buyQuote.amount)}
							/>
						</p>
					)}
					{actionType === "sell" && sellQuote && (
						<p>
							You will receive:{" "}
							<TokenInfo
								denomOrAddress={reserveToken.base}
								isNative
								amount={BigInt(sellQuote.amount)}
							/>
						</p>
					)}
					{isLoading && <p>Loading...</p>}
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={onClose}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={handleConfirm}
						disabled={isBuyQuoteLoading || isSellQuoteLoading}
					>
						Confirm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default TokenActionModal;
