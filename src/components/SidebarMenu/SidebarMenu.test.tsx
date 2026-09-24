import { render, shallow, configure } from "enzyme";
import "jest";
import * as React from "react";
import { SidebarMenu } from "./SidebarMenu";
import Adapter from "@cfaester/enzyme-adapter-react-18";
import { closeSidebar } from "../../store";

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

  it("closes when the close button or a link is clicked", () => {
    const dispatch = jest.fn();
    const wrapper = shallow(<SidebarMenu Link={LinkStub} pathname="/" items={items} visible dispatch={dispatch} />);
    wrapper.find({ "aria-label": "메뉴 닫기" }).simulate("click");
    wrapper.find({ to: "/about/" }).simulate("click");
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(1, closeSidebar());
    expect(dispatch).toHaveBeenNthCalledWith(2, closeSidebar());
  });
});
