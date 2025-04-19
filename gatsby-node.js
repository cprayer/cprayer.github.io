import path from 'path';
import slash from 'slash';
import {
  kebabCase, uniq, get, compact, times,
} from 'lodash-es';

// Don't forget to update hard code values into:
// - `templates-page.tsx:23`
// - `pages/blog.tsx:26`
// - `pages/blog.tsx:121`
const POSTS_PER_PAGE = 10;
const cleanArray = array => compact(uniq(array));

// Create slugs for files.
// Slug will used for blog page path.
export const onCreateNode = ({node, actions, getNode}) => {
  const {createNodeField} = actions;
  let slug;
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent);
    const [basePath, name] = fileNode.relativePath.split('/');
    slug = `/${basePath}/${name}/`;
  }

  if (slug) {
    // eslint-disable-next-line quotes
    createNodeField({node, name: `slug`, value: slug});
  }
};

// Implement the Gatsby API `createPages`.
// This is called after the Gatsby bootstrap is finished
// so you have access to any information necessary to
// programmatically create pages.
export const createPages = ({graphql, actions}) => {
  const {createPage} = actions;

  return new Promise((resolve, reject) => {
    const templates = {
      blogPost: path.resolve(`src/templates/${kebabCase('blogPost')}.tsx`),
      tagsPage: path.resolve(`src/templates/${kebabCase('tagsPage')}.tsx`),
      blogPage: path.resolve(`src/templates/${kebabCase('blogPage')}.tsx`),
    };

    graphql(
      `
      {
        posts: allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                tags
              }
            }
          }
        }
      }
    `,
    ).then(result => {
      if (result.errors) {
        return reject(result.errors);
      }

      const posts = result.data.posts.edges.map(p => p.node);

      // Create blog pages
      for (const post of posts
        .filter(post => post.fields.slug.startsWith('/posts/'))) {
        createPage({
          path: post.fields.slug,
          component: slash(templates.blogPost),
          context: {
            slug: post.fields.slug,
          },
        });
      }

      // Create tags pages
      const allTags = cleanArray(posts.flatMap(post => get(post, 'frontmatter.tags') || []));
      for (const tag of allTags) {
        createPage({
          path: `/tags/${tag}/`,
          component: slash(templates.tagsPage),
          context: {
            tag,
          },
        });
      }

      // Create blog pagination
      const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
      times(pageCount, index => {
        createPage({
          path: `/page/${index + 1}/`,
          component: slash(templates.blogPage),
          context: {
            skip: index * POSTS_PER_PAGE,
          },
        });
      });

      resolve();
    });
  });
};
