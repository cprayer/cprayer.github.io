import * as React from "react";
import { Link } from "gatsby";
import { get } from "lodash-es";
import { Header, Container, Segment, Label, Grid, Card, Image, Item, Comment } from "semantic-ui-react";
import { MarkdownRemark, ImageSharp, MarkdownRemarkConnection, Site } from "../graphql-types";
import {withLayout, LayoutProps} from "../components/Layout";
import { Comments } from "../components/Comments";
import { graphql } from "gatsby";

interface BlogPostProps extends LayoutProps {
  data: {
    post: MarkdownRemark;
    recents: MarkdownRemarkConnection;
    site: Site
  };
}

const BlogPostPage = (props: BlogPostProps) => {
  const { frontmatter, html, timeToRead } = props.data.post;
  const avatar = frontmatter.author.avatar.children[0] as ImageSharp;

  const tags = props.data.post.frontmatter.tags
    .map((tag) => <Label key={tag}><Link to={`/tags/${tag}/`}>{tag}</Link></Label>);

  const recents = props.data.recents.edges
    .map(({ node }) => {
      const recentCover = get(node, "frontmatter.image.children.0.fixed", {});
      const extra = (
        <Comment.Group>
          <Comment>
            <Comment.Content>
              <Comment.Metadata style={{ margin: 0 }}>
                {node.timeToRead} min read
              </Comment.Metadata>
            </Comment.Content>
          </Comment>
        </Comment.Group>
      );

      return (
        <div key={node.fields.slug} style={{ paddingBottom: "1em", wordBreak: "break-all" }}>
          <Card as={Link}
            to={node.fields.slug}
            image={recentCover}
            header={node.frontmatter.title}
            extra={extra}
          />
        </div>
      );
    });

  const cover = get(frontmatter, "image.children.0.fixed", {} );
  return (
    <Container>
      <Segment vertical style={{ border: "none" }}>
        <Item.Group>
          <Item>
            <Item.Image size="tiny"
              src={avatar.fixed.src}
              srcSet={avatar.fixed.srcSet}
              circular
            />
            <Item.Content>
              <Item.Description>{frontmatter.author.jsonId}</Item.Description>
              <Item.Meta>{frontmatter.author.bio}</Item.Meta>
              <Item.Extra>{frontmatter.updatedDate} - {timeToRead} min read</Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
        <Header as="h1">{frontmatter.title}</Header>
      </Segment>
      <Image
        {...cover}
        fluid
      />
      <Segment vertical
        style={{ border: "none" }}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
        size="large"
      />
      <Segment vertical>
        {tags}
      </Segment>
      <Comments/>
      <Segment vertical>
        <Grid padded centered>
          {recents}
        </Grid>
      </Segment>
    </Container>
  );
};

export default withLayout(BlogPostPage);

export const pageQuery = graphql`
  query TemplateBlogPost($slug: String!) {
  post: markdownRemark(fields: {slug: {eq: $slug}}) {
    html
    excerpt
    timeToRead
    fields {
      slug
    }
    frontmatter {
      tags
      author {
        jsonId
        bio
        twitter
        avatar {
          children {
            ... on ImageSharp {
              fixed(width: 80, height: 80, quality: 100) {
                src
                srcSet
              }
            }
          }
        }
      }
      title
      updatedDate(formatString: "MMM D, YYYY")
      image {
        children {
          ... on ImageSharp {
            fixed(width: 900, height: 300, quality: 100) {
              src
              srcSet
            }
          }
        }
      }
    }
  }
  recents: allMarkdownRemark(
    filter: {
      fields: {slug: {ne: $slug}}
      frontmatter: {draft: {ne: true}},
      fileAbsolutePath: {regex: "/posts/"},
    },
    sort: {order: DESC, fields: [frontmatter___updatedDate]},
    limit: 4
  ) {
    edges {
      node {
        fields {
          slug
        }
        timeToRead
        frontmatter {
          title
          image {
            children {
              ... on ImageSharp {
                fixed(width: 300, height: 100) {
                  src
                  srcSet
                }
              }
            }
          }
          author {
            jsonId
            avatar {
              children {
                ... on ImageSharp {
                  fixed(width: 36, height: 36) {
                    src
                    srcSet
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;
