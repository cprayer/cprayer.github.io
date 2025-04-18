/* eslint-disable no-undef, max-nested-callbacks */
import {createPages, onCreateNode} from '../gatsby-node.js';

jest.mock('path');

describe('gatsby-node', () => {
  const actions = {};

  describe('createPages', () => {
    let graphql;

    beforeEach(() => {
      actions.createPage = jest.fn();
      graphql = jest.fn();
    });

    it('should create blog posts', () => {
      graphql.mockReturnValueOnce(
        Promise.resolve(
          {
            data: {
              posts: {
                edges: [
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-04-18--welcoming/',
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-05-02--article-2/',
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-05-02--article-1/',
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/docs/dont-take-me/',
                      },
                    },
                  },
                ],
              },
            },
          },
        ),
      );

      return createPages({graphql, actions})
        .then(() => {
          expect(actions.createPage.mock.calls).toMatchSnapshot();
        });
    });

    test('should throw an error on graphql error', async () => {
      expect.assertions(1);
      graphql.mockReturnValueOnce(
        Promise.resolve({errors: 'something wrong!'}),
      );
      try {
        await createPages({graphql, actions});
      } catch (error) {
        expect(error).toMatch('something wrong!');
      }
    });

    it('should create tags pages', () => {
      graphql.mockReturnValueOnce(
        Promise.resolve(
          {
            data: {
              posts: {
                edges: [
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-04-18--welcoming/',
                      },
                      frontmatter: {
                        tags: [
                          'starter',
                          'gatsby',
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-05-02--article-2/',
                      },
                      frontmatter: {
                        tags: [
                          'test',
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-05-02--article-1/',
                      },
                      frontmatter: {
                        tags: [
                          'test',
                        ],
                      },
                    },
                  },
                  {
                    node: {
                      fields: {
                        slug: '/posts/2017-05-02--article-0/',
                      },
                      frontmatter: {
                        tags: null,
                      },
                    },
                  },
                ],
              },
            },
          },
        ),
      );

      return createPages({graphql, actions})
        .then(() => {
          expect(actions.createPage.mock.calls).toMatchSnapshot();
        });
    });

    describe('pagination', () => {
      const generateData = n => {
        const edges = Array.from({length: n}).map((_, i) => ({
          node: {
            fields: {
              slug: `/posts/2017-04-18--article-${i + 1}/`,
            },
          },
        }));
        return {data: {posts: {edges}}};
      };

      it('should create 1 page with 5 posts', () => {
        graphql.mockReturnValueOnce(Promise.resolve(generateData(5)));
        return createPages({graphql, actions})
          .then(() => {
            const pages = actions.createPage.mock.calls
              .filter(d => d[0].path && d[0].path.startsWith('/page/'));
            expect(pages).toMatchSnapshot();
          });
      });

      it('should create 2 pages with 15 posts', () => {
        graphql.mockReturnValueOnce(Promise.resolve(generateData(15)));
        return createPages({graphql, actions})
          .then(() => {
            const pages = actions.createPage.mock.calls
              .filter(d => d[0].path && d[0].path.startsWith('/page/'));
            expect(pages).toMatchSnapshot();
          });
      });

      it('should create 3 pages with 30 posts', () => {
        graphql.mockReturnValueOnce(Promise.resolve(generateData(30)));
        return createPages({graphql, actions})
          .then(() => {
            const pages = actions.createPage.mock.calls
              .filter(d => d[0].path && d[0].path.startsWith('/page/'));
            expect(pages).toMatchSnapshot();
          });
      });
    });
  });

  describe('onCreateNode', () => {
    let getNode;

    beforeEach(() => {
      actions.createNodeField = jest.fn();
      getNode = jest.fn();
    });

    it('should create slugs for MarkdownRemark file', () => {
      getNode.mockReturnValue(
        {
          relativePath: 'posts/2017-04-18--welcoming/index.md',
        },
      );
      const node = {
        internal: {
          type: 'MarkdownRemark',
        },
        parent: 'parent',
      };
      onCreateNode({node, actions, getNode});

      expect(actions.createNodeField.mock.calls).toMatchSnapshot();
    });

    it('should do nothing on unknown type', () => {
      getNode.mockReturnValue(
        {
          relativePath: 'posts/2017-04-18--welcoming/index.md',
        },
      );
      const node = {
        internal: {
          type: 'unknown',
        },
        parent: 'parent',
      };
      onCreateNode({node, actions, getNode});

      expect(actions.createNodeField.mock.calls.length).toBe(0);
    });
  });
});
