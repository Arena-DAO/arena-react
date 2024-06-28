// components/NFTInfo.tsx
import { Card, CardBody, Image } from "@nextui-org/react";

interface NFTInfoProps {
	address: string;
	tokenIds: string[];
}

const NFTInfo = ({ address, tokenIds }: NFTInfoProps) => {
	return (
		<Card>
			<CardBody>
				<p>NFT Contract: {address}</p>
				<p>Token IDs:</p>
				<div className="flex flex-wrap gap-2">
					{tokenIds.map((tokenId) => (
						<Card key={tokenId} className="h-20 w-20">
							<CardBody className="p-1">
								<Image
									src={`https://placeholder.com/100x100?text=${tokenId}`}
									alt={`NFT ${tokenId}`}
									className="h-full w-full object-cover"
								/>
							</CardBody>
						</Card>
					))}
				</div>
			</CardBody>
		</Card>
	);
};

export default NFTInfo;
