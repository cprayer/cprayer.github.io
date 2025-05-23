import { render, configure } from "enzyme";
import "jest";
import * as React from "react";
import BlogPagination from "./BlogPagination";
import Adapter from "@cfaester/enzyme-adapter-react-18";

// Configure enzyme with react 16 adapter
configure({ adapter: new Adapter() });

const LinkStub = ((props: any) => <div {...props} />) as any;

describe("BlogPagination component", () => {
  it("should render nothing if only 1 page", () => {
    const pathname: string = "/page/1/";
    const pageCount: number = 1;

    const wrapper = render(<BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 5 pages", () => {
    const pathname: string = "/page/2/";
    const pageCount: number = 5;

    const wrapper = render(<BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 10 pages", () => {
    const pathname: string = "/page/5/";
    const pageCount: number = 10;

    const wrapper = render(<BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should render correctly 20 pages", () => {
    const pathname: string = "/page/5/";
    const pageCount: number = 20;

    const wrapper = render(<BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("should have first link active if no match", () => {
    const pathname: string = "/plop";
    const pageCount: number = 10;

    const wrapper = render(<BlogPagination pathname={pathname} Link={LinkStub} pageCount={pageCount} />);
    expect(wrapper).toMatchSnapshot();
  });
});
