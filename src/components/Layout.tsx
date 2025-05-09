import { Link } from "gatsby";
import * as React from "react";
import HeaderMenu from "./HeaderMenu/HeaderMenu";
import SidebarMenu from "./SidebarMenu/SidebarMenu";
import { Segment, Icon, Container, Sidebar } from "semantic-ui-react";
import "../css/responsive.css";
import "../css/semantic.min.css";
import "prismjs/themes/prism-coy.css";
import "../css/styles.css";
import { MenuItem } from "./Menu";
import { Provider } from "react-redux";
import { store } from "../store";

export const menuItems: MenuItem[] = [
  { name: "Main", path: "/", exact: true, icon: "archive"},
  { name: "About", path: "/about/", exact: true, icon: "address card"},
];

export interface LayoutProps {
  location: {
    pathname: string;
  };
  children: any;
}

const Layout = (props: LayoutProps) => {
  const { pathname } = props.location;
  const isMain = pathname === "/";

  return (
    <Provider store={store}>
      <Sidebar.Pushable as={Segment}>

        <SidebarMenu Link={Link} pathname={pathname} items={menuItems} visible={false} />

        <Sidebar.Pusher style={{ minHeight: "100vh" }}>
          {/* Header */}
          <HeaderMenu
            Link={Link}
            pathname={pathname}
            items={menuItems}
          />

          {/* Render children pages */}
          <div style={{ paddingBottom: 60 }}>
            {props.children}
          </div>

          {/* Footer */}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Provider>
  );
};

export default Layout;

export const withLayout = <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  class WithLayout extends React.Component<P & LayoutProps> {
    render() {
      return (
        <Layout location={this.props.location}>
          <WrappedComponent {...this.props} />
        </Layout>
      );
    }
  };
