import { CheckIcon, CopyIcon } from "@chakra-ui/icons";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";

interface CopyAddressButtonProps extends IconButtonProps {
  addr: string;
}

export function CopyAddressButton({ addr, ...props }: CopyAddressButtonProps) {
  const { onCopy, hasCopied } = useClipboard(addr);

  return (
    <Tooltip label={hasCopied ? "Address Copied!" : "Copy Address"}>
      <IconButton
        icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
        onClick={onCopy}
        variant="ghost"
        {...props}
      />
    </Tooltip>
  );
}
