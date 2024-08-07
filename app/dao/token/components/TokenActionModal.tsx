import React from "react";
import {
	useCwAbcBuyQuoteQuery,
	useCwAbcSellQuoteQuery,
} from "~/codegen/CwAbc.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { CwAbcQueryClient } from "~/codegen/CwAbc.client";
import {
	Modal,
	Button,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "@nextui-org/react";
import type { Asset } from "@chain-registry/types";
import TokenInfo from "@/components/TokenInfo";
import { getBaseToken } from "~/helpers/TokenHelpers";

interface TokenActionModalProps {
	isOpen: boolean;
	onClose: () => void;
	actionType: "buy" | "sell" | null;
	amount: string;
	supplyToken: Asset;
	reserveToken: Asset;
	onConfirm: () => void;
	error: string | null;
}

const TokenActionModal = ({
	isOpen,
	onClose,
	actionType,
	amount,
	supplyToken,
	reserveToken,
	onConfirm,
	error,
}: TokenActionModalProps) => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient(env.CHAIN);

	const client = React.useMemo(
		() =>
			cosmWasmClient
				? new CwAbcQueryClient(cosmWasmClient, env.ARENA_ABC_ADDRESS)
				: undefined,
		[cosmWasmClient, env.ARENA_ABC_ADDRESS],
	);

	const { data: buyQuote, isLoading: isBuyQuoteLoading } =
		useCwAbcBuyQuoteQuery({
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

	const { data: sellQuote, isLoading: isSellQuoteLoading } =
		useCwAbcSellQuoteQuery({
			client,
			args: {
				payment: getBaseToken(
					{ amount, denom: supplyToken.display },
					supplyToken,
				).amount,
			},
			options: {
				enabled: isOpen && actionType === "sell" && !!supplyToken,
			},
		});

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Confirm Action
				</ModalHeader>
				<ModalBody>
					{error && <div className="mb-4 text-red-500">{error}</div>}
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
					{(actionType === "buy" && isBuyQuoteLoading) ||
					(actionType === "sell" && isSellQuoteLoading) ? (
						<p>Loading quote...</p>
					) : null}
				</ModalBody>
				<ModalFooter>
					<Button color="danger" variant="light" onPress={onClose}>
						Cancel
					</Button>
					<Button color="primary" onPress={onConfirm}>
						Confirm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default TokenActionModal;
