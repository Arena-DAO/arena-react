import { BsPeopleFill } from "react-icons/bs";
import { FiHome } from "react-icons/fi";
import { NavGroup, NavItem, SidebarSection } from "@saas-ui/sidebar";

export default function NavMenu() {
  return (
    <SidebarSection aria-label="Main">
      <NavItem icon={<FiHome />} href="/">
        Home
      </NavItem>
      <NavGroup icon={<BsPeopleFill />} title="DAO's" isCollapsible>
        <NavItem href="/daos/featured">Featured</NavItem>
        <NavItem href="/daos/enable">Enable Agon</NavItem>
      </NavGroup>
    </SidebarSection>
  );
}
