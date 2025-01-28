import {AppShell, Tooltip, NavLink} from "@mantine/core";
import {useLocation, useNavigate} from "react-router-dom";
import styles from "@/components/side-navigation/SideNavigation.module.css";
import {CubeIcon, CubePlusIcon} from "@/assets/icons/index.jsx";

const NAV_LINKS = [
  {path: "/new", icon: <CubePlusIcon />, title: "Create"},
  {path: "/content", icon: <CubeIcon />, title: "Content"},
];

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="24 14">
      {
        NAV_LINKS.map(({path, icon, title}) => (
          <Tooltip
            key={`navigation-link-${path}`}
            label={title}
            position="right"
            withArrow
          >
            <NavLink
              key={`navigation-link-${path}`}
              classNames={{section: styles.section}}
              href="#"
              onClick={() => navigate(path)}
              active={path === location.pathname}
              leftSection={icon}
              title={title}
            />
          </Tooltip>
        ))
      }
    </AppShell.Navbar>
  );
};

export default SideNavigation;
