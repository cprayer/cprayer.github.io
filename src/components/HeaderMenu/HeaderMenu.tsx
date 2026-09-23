import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { toggleSidebar } from "../../store";
import { Container, Menu, Icon } from "semantic-ui-react";
import { MenuProps } from "../Menu";

interface HeaderMenuProps extends MenuProps {
  dispatch?: Dispatch<any>;
  inverted?: boolean;
}

export const HeaderMenu = ({ items, pathname, Link, inverted, dispatch }: HeaderMenuProps) =>
  <Container className="site-header">
    <Menu size="large" secondary inverted={inverted} className="site-navigation">
      <Menu.Item as={Link} to="/" header className="site-wordmark">
        <span>잡동사니 개발 블로그</span>
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
        aria-label="메뉴 열기" onClick={() => dispatch && dispatch(toggleSidebar())} />
    </Menu>
  </Container>;

export default connect()(HeaderMenu);
