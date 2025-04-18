import { shallow, configure } from "enzyme";
import "jest";
import * as React from "react";
import { HeaderMenu } from "./HeaderMenu";
import Adapter from "@cfaester/enzyme-adapter-react-18";

// Configure enzyme with react 16 adapter
configure({ adapter: new Adapter() });

const items = [
  { name: "Main", path: "/", exact: true },
  { name: "About", path: "/about/", exact: true },
];

const LinkStub = (props: any) => <div {...props} />;
const dispatchStub = (a: any) => a;

describe("HeaderMenu component", () => {
  it("should nothing active", () => {
    const wrapper = shallow(
      <HeaderMenu
        Link={LinkStub}
        items={items}
        pathname="/plop"
        dispatch={dispatchStub}
      />,
    );
    expect(wrapper.find({ active: true }).length).toBe(0);
  });

  it("should have about as active (match exact)", () => {
    const wrapper = shallow(
      <HeaderMenu
        Link={LinkStub}
        items={items}
        pathname="/about/"
        dispatch={dispatchStub} />,
    );
    expect(wrapper.find({ name: "About" }).prop("active")).toBeTruthy();
  });

  it("should have inverted style", () => {
    const wrapper = shallow(
      <HeaderMenu
        Link={LinkStub}
        items={items}
        pathname="/posts/toto"
        dispatch={dispatchStub}
        inverted
      />,
    );
    expect(wrapper.find({ inverted: true }).length).toBe(1);
  });

  it("should dispatch the correct message on burger click", () => {
    const dispatchMock: any = jest.fn();
    const wrapper = shallow(
      <HeaderMenu
        Link={LinkStub}
        items={items}
        pathname=""
        dispatch={dispatchMock} />,
    );
    wrapper.find(".mobile.only").simulate("click");
    expect(dispatchMock.mock.calls.length).toBe(1);
  });

});
