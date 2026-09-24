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

interface CompetitionEntry {
  date: string;
  detail?: string;
  result: string;
  source?: {
    label: string;
    url: string;
  };
  title: string;
}

const awards: CompetitionEntry[] = [
  {
    date: "2018-11",
    detail: "한국항공대학교 · choolbal_dream",
    result: "21위",
    source: { label: "ICPC ID", url: "https://icpc.global/ICPCID/LAH7ZPTJ4BVT" },
    title: "ACM-ICPC Seoul Regional",
  },
  {
    date: "2017-12",
    detail: "한국항공대학교 · ACM-ICPC 지역대회 예선 겸 교내 대회 (1위)",
    result: "최우수상",
    source: { label: "ICPC ID", url: "https://icpc.global/ICPCID/LAH7ZPTJ4BVT" },
    title: "교내 프로그래밍 경진대회",
  },
  {
    date: "2017-11",
    detail: "발행: 한국정보화진흥원",
    result: "장려상",
    source: { label: "ICPC ID", url: "https://icpc.global/ICPCID/LAH7ZPTJ4BVT" },
    title: "한국대학생프로그래밍경시대회",
  },
  {
    date: "2017-11",
    detail: "한국항공대학교 · yohohohohohohohohohohohoyo",
    result: "17위",
    source: { label: "ICPC ID", url: "https://icpc.global/ICPCID/LAH7ZPTJ4BVT" },
    title: "ACM-ICPC Daejeon Regional",
  },
  {
    date: "2017-07",
    detail: "발행: 아주대학교 LINC+",
    result: "장려상",
    source: { label: "2017년 결과", url: "https://shake.codes/results/2017" },
    title: "경인지역 6개 대학 연합 프로그래밍 경시대회(Shake)",
  },
];

const contestResults: CompetitionEntry[] = [
  {
    date: "2021-05",
    result: "3558위",
    source: { label: "참가자 기록", url: "https://zibada.guru/gcj/profile/cprayer" },
    title: "Google Code Jam 2021 Round 2",
  },
  {
    date: "2020-05",
    result: "2412위",
    source: { label: "참가자 기록", url: "https://zibada.guru/gcj/profile/cprayer" },
    title: "Google Code Jam 2020 Round 2",
  },
  {
    date: "2018-08",
    result: "39위",
    source: { label: "결과표", url: "https://t1.kakaocdn.net/codefestival/2018-round-2-scoreboard/index.html" },
    title: "카카오 코드 페스티벌 2018 본선",
  },
  { date: "2018-07", result: "307점", title: "SCPC 2018 본선" },
  { date: "2018-03", result: "B형 취득", title: "삼성전자 S/W 상시 역량테스트" },
  {
    date: "2017-09",
    result: "53위",
    source: { label: "결과표", url: "https://t1.kakaocdn.net/codefestival/round-2-scoreboard/index.html" },
    title: "카카오 코드 페스티벌 2017 본선",
  },
];

const CompetitionList = ({ items }: { items: CompetitionEntry[] }) => (
  <ol className="competition-list">
    {items.map(({ date, detail, result, source, title }) => (
      <li key={`${date}-${title}`}>
        <div className="competition-heading">
          <h3>{title}</h3>
          <span className="competition-result">{result}</span>
        </div>
        <div className="competition-meta">
          <time dateTime={date}>{`${date.replace("-", "년 ")}월`}</time>
          {detail && <span>{detail}</span>}
          {source && <a href={source.url} target="_blank" rel="noreferrer">
            {source.label} <span aria-hidden="true">↗</span>
          </a>}
        </div>
      </li>
    ))}
  </ol>
);

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
            <a className="profile-solved-ac" href="https://solved.ac/profile/cprayer"
              target="_blank" rel="noreferrer">
              <Icon name="trophy" /><span>solved.ac</span>
              <img className="profile-solved-badge"
                src="https://mazassumnida.wtf/api/mini/generate_badge?boj=cprayer"
                alt="cprayer solved.ac 티어 배지" width={110} height={20} loading="lazy" />
            </a>
            <a href="https://leetcode.com/u/cprayer" target="_blank" rel="noreferrer">
              <Icon name="terminal" /><span>LeetCode</span><Icon name="arrow right" />
            </a>
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

        <section className="about-competitions">
          <p className="section-eyebrow">COMPETITIONS &amp; AWARDS</p>
          <div className="competition-group">
            <h2>수상 경력</h2>
            <CompetitionList items={awards} />
          </div>
          <div className="competition-group">
            <h2>참가 내역</h2>
            <CompetitionList items={contestResults} />
          </div>
        </section>
      </div>
    </Container>
  );
};

export default withLayout(AboutPage, "About");

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
