import { Asset } from "@chain-registry/types";
import { Card, CardBody, CardProps } from "@chakra-ui/card";
import { DeleteIcon } from "@chakra-ui/icons";
import { Avatar, Tooltip, IconButton, Text } from "@chakra-ui/react";

interface AssetCardProps extends CardProps {
  asset: Asset;
  amount: String;
  deleteFn?: (index: number) => void;
  index?: number;
}

export function AssetCard({
  asset,
  amount,
  deleteFn,
  index,
  ...cardProps
}: AssetCardProps) {
  return (
    <Card
      direction="row"
      px="4"
      overflow="hidden"
      alignItems="center"
      {...cardProps}
    >
      {asset?.logo_URIs && (
        <Avatar
          src={
            asset.logo_URIs.svg ?? asset.logo_URIs.png ?? asset.logo_URIs.jpeg
          }
          mr="3"
          name={asset.name}
          size="md"
        />
      )}
      <CardBody overflowX={"auto"} whiteSpace={"nowrap"}>
        <Text>
          {amount.toLocaleString()} {asset.display}
        </Text>
      </CardBody>
      {deleteFn && index !== undefined && (
        <Tooltip label="Delete Amount">
          <IconButton
            variant="ghost"
            aria-label="Delete"
            onClick={() => deleteFn(index)}
            icon={<DeleteIcon />}
          />
        </Tooltip>
      )}
    </Card>
  );
}
