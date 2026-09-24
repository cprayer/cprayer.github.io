import { graphql, Link, useStaticQuery } from "gatsby";
import * as React from "react";
import Helmet from "react-helmet";
import HeaderMenu from "./HeaderMenu/HeaderMenu";
import SidebarMenu from "./SidebarMenu/SidebarMenu";
import { Segment, Icon, Container, Sidebar } from "semantic-ui-react";
import "../css/responsive.css";
import "../css/semantic.min.css";
import "prismjs/themes/prism-coy.css";
import "../css/styles.css";
import { MenuItem } from "./Menu";
import { Provider, useDispatch, useSelector } from "react-redux";
import { closeSidebar, store, StoreState } from "../store";

export const menuItems: MenuItem[] = [
  { name: "Main", path: "/", exact: true, icon: "archive"},
  { name: "About", path: "/about/", exact: true, icon: "address card"},
];

export interface LayoutProps {
  location: {
    pathname: string;
  };
  children: any;
  pageTitle?: string;
}

const NavigationPusher = ({ children }: { children: React.ReactNode }) => {
  const isSidebarVisible = useSelector((state: StoreState) => state.isSidebarVisible);
  const dispatch = useDispatch();

  return <Sidebar.Pusher dimmed={isSidebarVisible} style={{ minHeight: "100vh" }} onClick={() => {
    if (isSidebarVisible) {
      dispatch(closeSidebar());
    }
  }}>
    {children}
  </Sidebar.Pusher>;
};

const Layout = (props: LayoutProps) => {
  const {site} = useStaticQuery<{site: {siteMetadata: {title: string}}}>(graphql`
    query LayoutSiteTitle {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const title = props.pageTitle
    ? `${props.pageTitle} | ${site.siteMetadata.title}`
    : site.siteMetadata.title;
  const { pathname } = props.location;

  return (
    <Provider store={store}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Sidebar.Pushable as={Segment}>

        <SidebarMenu Link={Link} pathname={pathname} items={menuItems} visible={false} />

        <NavigationPusher>
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
        </NavigationPusher>
      </Sidebar.Pushable>
    </Provider>
  );
};

export default Layout;

export const withLayout = <P extends object>(WrappedComponent: React.ComponentType<P>, pageTitle?: string) =>
  class WithLayout extends React.Component<P & LayoutProps> {
    render() {
      return (
        <Layout location={this.props.location} pageTitle={pageTitle}>
          <WrappedComponent {...this.props} />
        </Layout>
      );
    }
  };
