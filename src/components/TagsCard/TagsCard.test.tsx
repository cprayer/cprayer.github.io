import { shallow, configure } from "enzyme";
import "jest";
import * as React from "react";
import TagsCard from "./TagsCard";
import Adapter from "@cfaester/enzyme-adapter-react-18";

import { Card, List } from "semantic-ui-react";
import { MarkdownRemarkGroupConnection } from "../../graphql-types";

// Configure enzyme with react 16 adapter
configure({ adapter: new Adapter() });

describe("TagsCard component", () => {
  let LinkStub: any;

  beforeEach(() => {
    LinkStub = (props: any) =>
      <div>{props.children}</div>;
  });

  it("should list all the tags", () => {
    const tags = [
      { fieldValue: "tag01", totalCount: 2 },
      { fieldValue: "tag02", totalCount: 4 },
      { fieldValue: "tag03", totalCount: 6 },
    ] as MarkdownRemarkGroupConnection[];

    const wrapper = shallow(<TagsCard tags={tags} Link={LinkStub} />);

    expect(wrapper.find(List.Item)).toHaveLength(3);
  });

  it("should have on tag active", () => {
    const tags = [
      { fieldValue: "tag01", totalCount: 2 },
      { fieldValue: "tag02", totalCount: 4 },
      { fieldValue: "tag03", totalCount: 6 },
    ] as MarkdownRemarkGroupConnection[];

    const wrapper = shallow(<TagsCard tags={tags} Link={LinkStub} tag="tag01"/>);

    expect(wrapper).toMatchSnapshot();
  });
});
