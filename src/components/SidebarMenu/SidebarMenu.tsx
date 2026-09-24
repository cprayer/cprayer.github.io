import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GatsbyLinkProps } from "gatsby-link";
import { closeSidebar, StoreState } from "../../store";
import { MenuProps, MenuItem } from "../Menu";
import { Menu, Icon, Sidebar } from "semantic-ui-react";
import { SemanticICONS } from "semantic-ui-react";

interface SidebarMenuProps extends MenuProps {
  visible?: boolean;
  dispatch?: Dispatch<any>;
  Link: React.ComponentClass<GatsbyLinkProps<any>>;
}

export const SidebarMenu = ({ items, pathname, Link, visible, dispatch }: SidebarMenuProps) => {
  const isActive = (item: MenuItem) => (item.exact) ? pathname === item.path : pathname.startsWith(item.path);
  const close = () => dispatch && dispatch(closeSidebar());
  return (
    <Sidebar as={Menu} animation="slide along" width="thin"
      visible={visible} icon="labeled" vertical inverted>
      <Menu.Item as="button" type="button" aria-label="메뉴 닫기" onClick={close}>
        <Icon name="close" />
        메뉴 닫기
      </Menu.Item>
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Menu.Item as={Link} to={item.path} active={active} key={item.path} onClick={close}>
            <Icon name={item.icon as SemanticICONS} />
            {item.name}
          </Menu.Item>
        );
      })}
    </Sidebar>
  );
};

const mapStateToProps = (state: StoreState) => ({
  visible: state.isSidebarVisible,
});

export default connect<any, void, SidebarMenuProps>(mapStateToProps)(SidebarMenu);
