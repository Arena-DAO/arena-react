import { As, Flex, Icon, VStack, Link } from "@chakra-ui/react";
import { BsPeopleFill } from "react-icons/bs";
import { FiHome } from "react-icons/fi";
import { PropsWithChildren } from "react";
import NextLink from "next/link";

interface NavItemProps extends PropsWithChildren {
  icon: As<any>;
  href: string;
}
const NavItem = ({ icon, href, children }: NavItemProps) => {
  return (
    <Link className="text-decoration-none" as={NextLink} href={href} w="full">
      <Flex
        align="center"
        px="4"
        pl="4"
        py="3"
        cursor="pointer"
        _hover={{
          bg: "gray.100",
          _dark: {
            bg: "gray.900",
          },
        }}
        role="group"
        fontWeight="bold"
        transition=".15s ease"
        w="full"
      >
        {icon && <Icon mx="2" boxSize="4" as={icon} />}
        {children}
      </Flex>
    </Link>
  );
};

export default function NavMenu() {
  return (
    <VStack w="full">
      <NavItem icon={FiHome} href="/">
        Home
      </NavItem>
      <NavItem icon={BsPeopleFill} href="/daos">
        DAO&apos;s
      </NavItem>
    </VStack>
  );
}
