import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { toggleSidebar } from "../../store";
import { Container, Menu, Icon } from "semantic-ui-react";
import { MenuProps } from "../Menu";
import { applyTheme, getStoredTheme, getTheme, Theme, THEME_STORAGE_KEY } from "../../theme";

interface HeaderMenuProps extends MenuProps {
  dispatch?: Dispatch<any>;
  inverted?: boolean;
}

export const HeaderMenu = ({ items, pathname, Link, inverted, dispatch }: HeaderMenuProps) => {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    setTheme(getTheme());
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      if (!getStoredTheme()) {
        const nextTheme = preference.matches ? "dark" : "light";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }
    };
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        const nextTheme = getStoredTheme() || (preference.matches ? "dark" : "light");
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }
    };

    preference.addEventListener("change", syncSystemTheme);
    window.addEventListener("storage", syncStoredTheme);
    return () => {
      preference.removeEventListener("change", syncSystemTheme);
      window.removeEventListener("storage", syncStoredTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = getTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    setTheme(nextTheme);
  };

  return <Container className="site-header">
    <Menu size="large" secondary inverted={inverted} className="site-navigation">
      <Menu.Item as={Link} to="/" header className="site-wordmark">
        <span>cprayer</span>
      </Menu.Item>
      <Menu.Menu position="right" className="mobile hidden">
        {items.map((item) => {
          const active = (item.exact) ? pathname === item.path : pathname.startsWith(item.path);
          return <Menu.Item
            as={Link}
            name={item.name}
            to={item.path}
            key={item.path}
            active={active}
          />;
        })}
      </Menu.Menu>
      <Menu.Item as="button" className="mobile only" icon="sidebar"
        aria-label="메뉴 열기" onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          if (dispatch) {
            dispatch(toggleSidebar());
          }
        }} />
      <Menu.Item as="button" className="theme-toggle" onClick={toggleTheme}
        aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        aria-pressed={theme === "dark"}>
        <Icon name={theme === "dark" ? "sun outline" : "moon outline"} />
      </Menu.Item>
    </Menu>
  </Container>;
};

export default connect()(HeaderMenu);
