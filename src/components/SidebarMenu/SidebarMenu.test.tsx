import { render, configure } from "enzyme";
import "jest";
import * as React from "react";
import { SidebarMenu } from "./SidebarMenu";
import Adapter from "@cfaester/enzyme-adapter-react-18";

// Configure enzyme with react 16 adapter
configure({ adapter: new Adapter() });

const items = [
  { name: "Main", path: "/", exact: true },
  { name: "About", path: "/about/", exact: true },
];

const LinkStub: any = (props: any) => <div {...props} />;

describe("SidebarMenu component", () => {
  it("should render correctly", () => {

    const wrapper = render(<SidebarMenu Link={LinkStub} pathname="/" items={items} visible />);
    expect(wrapper).toMatchSnapshot();
  });
});
