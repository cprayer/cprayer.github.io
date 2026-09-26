import * as React from "react";
import { Link } from "gatsby";
import { graphql } from "gatsby";
import { Container } from "semantic-ui-react";
import { ImageSharp, ImageSharpFixed, MarkdownRemarkConnection } from "../graphql-types";
import BlogPagination from "../components/BlogPagination/BlogPagination";
import {withLayout, LayoutProps} from "../components/Layout";
import { MarkdownRemark } from "../graphql-types";
import { rankSearchResults } from "../search";

interface BlogProps extends LayoutProps {
  data: {
    tags: MarkdownRemarkConnection;
    posts: MarkdownRemarkConnection;
    searchPosts: MarkdownRemarkConnection;
  };
  pageContext: {
    tag?: string; // only set into `templates/tags-pages.tsx`
  };
}

const BlogPage = (props: BlogProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchToggleRef = React.useRef<HTMLButtonElement>(null);
  const tags = [...props.data.tags.group].sort((a, b) => b.totalCount - a.totalCount);
  const posts = props.data.posts.edges;
  const { pathname } = props.location;
  const pageCount = Math.ceil(props.data.posts.totalCount / 10);
  const isMainPage = pathname === "/" && !props.pageContext.tag;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const searchablePosts = props.pageContext.tag
    ? props.data.searchPosts.edges.filter(({ node }) =>
      (node.frontmatter.tags || []).includes(props.pageContext.tag))
    : props.data.searchPosts.edges;
  const searchResults = normalizedQuery
    ? rankSearchResults(searchablePosts, normalizedQuery, ({ node }) => ({
      body: node.rawMarkdownBody,
      excerpt: node.excerpt,
      tags: node.frontmatter.tags,
      title: node.frontmatter.title,
    }))
    : [];
  const featured = isMainPage ? posts[0] : null;
  const postList = normalizedQuery ? searchResults : featured ? posts.slice(1) : posts;
  const sectionTitle = normalizedQuery
    ? `“${searchQuery.trim()}” 검색 결과`
    : props.pageContext.tag ? `#${props.pageContext.tag}` : "모든 글";
  const postCount = normalizedQuery ? searchResults.length : props.data.posts.totalCount;
  const toggleSearch = () => {
    if (searchOpen) {
      setSearchQuery("");
    }

    setSearchOpen(!searchOpen);
  };

  const getCover = (post: MarkdownRemark, thumbnail = false) => {
    const image = post.frontmatter.image;
    if (!image || image.children.length === 0) {
      return null;
    }

    const sharp = image.children[0] as ImageSharp & { thumbnail?: ImageSharpFixed };
    return thumbnail ? sharp.thumbnail : sharp.fixed;
  };
  const featuredCover = featured ? getCover(featured.node) : null;

  const renderPost = ({ node }: {node: MarkdownRemark}) => {
    const { frontmatter, timeToRead, fields: { slug }, excerpt } = node;
    const cover = getCover(node, true);
    return (
      <article className="post-list-item" key={slug}>
        <Link className="post-list-link" to={slug} aria-label={`${frontmatter.title} 읽기`}>
          <span className="post-list-cover">
            <img src={cover ? cover.src : "/post-placeholder.svg"}
              srcSet={cover ? cover.srcSet : undefined} alt="" loading="lazy" />
          </span>
          <div className="post-list-content">
            <h3>{frontmatter.title}</h3>
            <p className="post-list-description">{excerpt}</p>
            <div className="post-list-meta">
              <time>{frontmatter.updatedDate}</time>
              <span>{timeToRead} min read</span>
            </div>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <Container className="home-page">
      {featured && (
        <section className="featured-post">
          <Link className="featured-post-link" to={featured.node.fields.slug}
            aria-label={`${featured.node.frontmatter.title} 읽기`}>
            <span className="featured-post-cover">
              <img src={featuredCover ? featuredCover.src : "/post-placeholder.svg"}
                srcSet={featuredCover ? featuredCover.srcSet : undefined} alt="" />
            </span>
            <div className="featured-post-body">
              <p className="section-eyebrow">LATEST</p>
              <h2>{featured.node.frontmatter.title}</h2>
              <p className="featured-post-description">{featured.node.excerpt}</p>
              <div className="featured-post-meta">
                <time>{featured.node.frontmatter.updatedDate}</time>
                <span>{featured.node.timeToRead} min read</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <div className="home-content">
        <main>
          <div className="section-heading">
            <h2>{sectionTitle}</h2>
            <div className="section-heading-controls">
              <button className="post-search-toggle" type="button" onClick={toggleSearch}
                ref={searchToggleRef}
                aria-label={searchOpen ? "검색 닫기" : "글 검색 및 주제 탐색"}
                aria-expanded={searchOpen}
                aria-controls={searchOpen ? "post-search-panel" : undefined}>
                {searchOpen ? <span aria-hidden="true">×</span> : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.5" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7"
                      strokeLinecap="round" />
                  </svg>
                )}
              </button>
              <span>{postCount} posts</span>
            </div>
          </div>
          {searchOpen && (
            <div className="post-search-panel" id="post-search-panel" role="search">
              <label htmlFor="post-search-input">글 검색</label>
              <input id="post-search-input" type="search" value={searchQuery} autoFocus
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    toggleSearch();
                    searchToggleRef.current?.focus();
                  }
                }}
                placeholder={props.pageContext.tag
                  ? `#${props.pageContext.tag} 안에서 검색`
                  : "제목, 내용, 태그로 검색"} />
              {!normalizedQuery && (
                <div className="post-search-topics">
                  <p>자주 다룬 주제</p>
                  <nav className="tag-chips" aria-label="자주 다룬 주제">
                    {tags.slice(0, 12).map((tag) => (
                      <Link className={tag.fieldValue === props.pageContext.tag ? "active" : ""}
                        key={tag.fieldValue} to={`/tags/${tag.fieldValue}/`}>
                        {tag.fieldValue}<span>{tag.totalCount}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          )}
          <div className="post-list">
            {postList.map(renderPost)}
          </div>
          {!normalizedQuery && pageCount > 1 && (
            <div className="home-pagination">
              <BlogPagination Link={Link} pathname={pathname} pageCount={pageCount} />
            </div>
          )}
        </main>
      </div>
    </Container>
  );
};

export default withLayout(BlogPage);

export const pageQuery = graphql`
query PageBlog {
  # Get tags
  tags: allMarkdownRemark(filter: {frontmatter: {draft: {ne: true}}}) {
    group(field: frontmatter___tags) {
      fieldValue
      totalCount
    }
  }

  # Get posts
  posts: allMarkdownRemark(
    sort: { order: DESC, fields: [frontmatter___updatedDate] },
    filter: {
      frontmatter: { draft: { ne: true } },
      fileAbsolutePath: { regex: "/posts/" }
    },
    limit: 10
  ) {
    totalCount
    edges {
      node {
        excerpt
        timeToRead
        fields {
          slug
        }
        frontmatter {
          title
          tags
          updatedDate(formatString: "DD MMMM, YYYY")
          image {
          	children {
              ... on ImageSharp {
                fixed(width: 700, height: 366) {
                  src
                  srcSet
                }
                thumbnail: fixed(width: 150, height: 79) {
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
                  fixed(width: 35, height: 35) {
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

  searchPosts: allMarkdownRemark(
    sort: { order: DESC, fields: [frontmatter___updatedDate] },
    filter: {
      frontmatter: { draft: { ne: true } },
      fileAbsolutePath: { regex: "/posts/" }
    }
  ) {
    edges {
      node {
        excerpt
        rawMarkdownBody
        timeToRead
        fields { slug }
        frontmatter {
          title
          tags
          updatedDate(formatString: "DD MMMM, YYYY")
          image {
            children {
              ... on ImageSharp {
                thumbnail: fixed(width: 150, height: 79) {
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
`;
