import * as React from "react";
import { Header, Segment } from "semantic-ui-react";

export default () => {
  return (
    <Segment vertical>
      <Header as="h2">
        <Header.Content>Posts</Header.Content>
      </Header>
    </Segment>
  );
};
