import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Link, VStack } from "@chakra-ui/layout";
import {
  useDisclosure,
  Button,
  Icon,
  Collapse,
  Text,
  ButtonProps,
} from "@chakra-ui/react";
import env from "@config/env";
import { LinkItem } from "@config/links";
import NextLink from "next/link";
import { PropsWithChildren, ReactNode } from "react";

type DefaultLinkItemType = {
  text: string;
  disabled?: boolean;
};

const MENU_BUTTON_STYLE: ButtonProps = {
  variant: "ghost",
  justifyContent: "start",
  alignItems: "center",
  fontSize: "lg",
  fontWeight: "medium",
  textAlign: "start",
  colorScheme: "primary",
  px: 2,
  mb: 0,
  w: "full",
  minH: 10,
  whiteSpace: "break-spaces",
};

const MenuButton = ({ text }: DefaultLinkItemType) => {
  return (
    <Button title={text} display="flex" {...MENU_BUTTON_STYLE}>
      <Text>{text}</Text>
    </Button>
  );
};

interface CollapsibleLinkItemProps extends PropsWithChildren {
  label: string;
  isDefaultOpen: boolean;
}

const CollapsibleLinkItem = ({
  label,
  children,
  isDefaultOpen,
}: CollapsibleLinkItemProps) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isDefaultOpen });
  const iconStyles = {
    transition: "transform 0.2s ease-in-out",
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
  };

  return (
    <VStack align="start" w="full" spacing={0}>
      <Button
        onClick={onToggle}
        justifyContent="space-between"
        mb="2"
        {...MENU_BUTTON_STYLE}
        rightIcon={
          <Icon
            as={isOpen ? ChevronDownIcon : ChevronRightIcon}
            sx={iconStyles}
          />
        }
      >
        {label}
      </Button>
      <Collapse in={isOpen} animateOpacity className="w-100">
        <VStack align="start" pl={8} w="full" mt="2">
          {children}
        </VStack>
      </Collapse>
    </VStack>
  );
};

export function renderLinkItems(linkItems: LinkItem[]): ReactNode {
  return (
    <>
      {linkItems
        ?.filter(({ env: e }) => !e || e === env.ENV)
        .map(({ label, href, target, children, isDefaultOpen }, i) => {
          if (children) {
            return (
              <CollapsibleLinkItem
                key={i}
                label={label}
                isDefaultOpen={isDefaultOpen ?? false}
              >
                {renderLinkItems(children)}
              </CollapsibleLinkItem>
            );
          } else {
            return (
              <Link
                key={i}
                as={NextLink}
                href={href}
                _hover={{ textDecoration: "none" }}
                _focus={{ outline: "none" }}
                target={target}
                className="w-100"
              >
                <MenuButton text={label} />
              </Link>
            );
          }
        })}
    </>
  );
}
