import {
  As,
  Flex,
  Icon,
  VStack,
  Link,
  useDisclosure,
  FlexProps,
  Collapse,
} from "@chakra-ui/react";
import {
  BsArrowRight,
  BsFillCaretRightFill,
  BsPeopleFill,
} from "react-icons/bs";
import { FiArrowRight, FiHome } from "react-icons/fi";
import NextLink from "next/link";

interface NavItemProps extends FlexProps {
  icon?: As<any> | undefined;
  href?: string | undefined;
}
const NavItem = ({ icon, href, children, ...props }: NavItemProps) => {
  const navItem = (
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
      {...props}
    >
      {icon && <Icon mx="2" boxSize="4" as={icon} />}
      {children}
    </Flex>
  );

  if (href)
    return (
      <Link className="text-decoration-none" as={NextLink} href={href} w="full">
        {navItem}
      </Link>
    );
  else return navItem;
};

export default function NavMenu() {
  const daos = useDisclosure();

  return (
    <Flex direction="column" as="nav" aria-label="Main Navigation">
      <NavItem icon={FiHome} href="/">
        Home
      </NavItem>
      <NavItem icon={BsPeopleFill} onClick={daos.onToggle}>
        DAO&apos;s
        <Icon
          as={BsFillCaretRightFill}
          ml="auto"
          transform={daos.isOpen ? "rotate(90deg)" : ""}
        />
      </NavItem>
      <Collapse in={daos.isOpen}>
        <NavItem pl="12" py="2" href="/daos/featured">
          Featured
        </NavItem>
        <NavItem pl="12" py="2" href="/daos/create">
          Create
        </NavItem>
      </Collapse>
    </Flex>
  );
}
