import * as React from "react";
import { Header, Container, Segment, Icon } from "semantic-ui-react";
import { withLayout } from "../components/Layout";

const AboutPage = () => {
  return (
    <Container>
      <Segment vertical>
        <Header as="h2">
          <Header.Content>About Me</Header.Content>
        </Header>
      </Segment>
      <Segment vertical>
        <a href="https://github.com/cprayer">https://github.com/cprayer</a>
        <br />
        <a href="https://codeforces.com/profile/cprayer">
          https://codeforces.com/profile/cprayer
        </a>
        <br />
        <a href="https://linkedin.com/in/taemin-shin">
          https://linkedin.com/in/taemin-shin
        </a>
        <br />
      </Segment>
    </Container>
  );
};

export default withLayout(AboutPage);
