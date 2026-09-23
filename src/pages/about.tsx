import * as React from "react";
import { graphql } from "gatsby";
import { Container, Image, Icon } from "semantic-ui-react";
import { AuthorJson, ImageSharp } from "../graphql-types";
import { withLayout } from "../components/Layout";

interface AboutPageProps {
  data: {
    author: AuthorJson;
  };
}

const contributions = [
  {
    items: [
      { title: "Fix Avro union evolution for specific reader", type: "PR · 공동 기여",
        url: "https://github.com/confluentinc/schema-registry/pull/4084" },
    ],
    project: "schema-registry",
  },
  {
    items: [
      { title: "Add \"No resources found\" message to kubectl logs", type: "PR",
        url: "https://github.com/kubernetes/kubernetes/pull/89688" },
    ],
    project: "kubernetes (kubectl)",
  },
  {
    items: [
      { title: "Fix TypeScript strict mode error in validateStatus typing", type: "PR",
        url: "https://github.com/axios/axios/pull/3200" },
    ],
    project: "axios",
  },
  {
    items: [
      { title: "Refresh Sentinel topology after full connectivity outage", type: "Issue",
        url: "https://github.com/redis/lettuce/issues/2007" },
    ],
    project: "lettuce",
  },
  {
    items: [
      { title: "MessageMeEvent missing user property", type: "Issue",
        url: "https://github.com/slackapi/java-slack-sdk/issues/1128" },
    ],
    project: "java-slack-sdk",
  },
  {
    items: [
      { title: "Rename Bootstrapper intitialize method to initialize", type: "PR",
        url: "https://github.com/spring-projects/spring-boot/pull/25400" },
    ],
    project: "spring-boot",
  },
  {
    items: [
      { title: "Add RouterFunctionMapping to Javadoc for WebMvcConfigurationSupport",
        type: "Documentation", url: "https://github.com/spring-projects/spring-framework/pull/26635" },
      { title: "Fix build output directory for reference docs in CONTRIBUTING.md",
        type: "Documentation", url: "https://github.com/spring-projects/spring-framework/pull/26556" },
      { title: "Fix typo in @Configurable example in reference manual",
        type: "Documentation", url: "https://github.com/spring-projects/spring-framework/pull/26551" },
    ],
    project: "spring-framework",
  },
];

const AboutPage = ({ data }: AboutPageProps) => {
  const avatar = data.author.avatar.children[0] as ImageSharp;
  return (
    <Container className="about-page">
      <header className="about-intro">
        <Image src={avatar.fixed.src} srcSet={avatar.fixed.srcSet}
          circular className="about-avatar" alt="cprayer" />
      </header>

      <div className="about-details">
        <section>
          <p className="section-eyebrow">LINKS</p>
          <div className="profile-links">
            <a href="https://github.com/cprayer" target="_blank" rel="noreferrer">
              <Icon name="github" /><span>GitHub</span><Icon name="arrow right" />
            </a>
            <a href="https://linkedin.com/in/taemin-shin" target="_blank" rel="noreferrer">
              <Icon name="linkedin" /><span>LinkedIn</span><Icon name="arrow right" />
            </a>
            <div className="profile-codeforces">
              <Icon name="code" /><span>Codeforces</span>
              <div className="codeforces-badges">
                <a className="codeforces-rating purple" href="https://codeforces.com/profile/B-E"
                  target="_blank" rel="noreferrer" aria-label="Codeforces B-E 최고 레이팅 1940">
                  <span>B-E</span><strong>1940</strong>
                </a>
                <a className="codeforces-rating blue" href="https://codeforces.com/profile/cprayer"
                  target="_blank" rel="noreferrer" aria-label="Codeforces cprayer 최고 레이팅 1852">
                  <span>cprayer</span><strong>1852</strong>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="about-contributions">
          <p className="section-eyebrow">OPEN SOURCE CONTRIBUTIONS</p>
          <div className="contribution-list">
            {contributions.map(({ project, items }) => (
              <div className="contribution-group" key={project}>
                <h3>{project}</h3>
                <ul>
                  {items.map(({ title, type, url }) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer" title={title}>{title}</a>
                      <small>{type}</small>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
};

export default withLayout(AboutPage);

export const pageQuery = graphql`
  query AboutPage {
    author: authorJson(jsonId: {eq: "cprayer"}) {
      avatar {
        children {
          ... on ImageSharp {
            fixed(width: 180, height: 180, quality: 100) {
              src
              srcSet
            }
          }
        }
      }
    }
  }
`;
