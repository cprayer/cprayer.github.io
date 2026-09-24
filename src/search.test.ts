import { rankSearchResults, SearchDocument } from "./search";

describe("post search ranking", () => {
  it("puts title matches ahead of tags, excerpts, and body matches", () => {
    const posts: SearchDocument[] = [
      { title: "new post", body: "nf_conntrack is mentioned" },
      { title: "tagged post", tags: ["nf"] },
      { title: "notes on nf_conntrack" },
      { title: "nf_conntrack_max 값" },
      { title: "summary post", excerpt: "nf_conntrack summary" },
    ];

    expect(rankSearchResults(posts, "NF", (post) => post).map(({ title }) => title)).toEqual([
      "nf_conntrack_max 값",
      "notes on nf_conntrack",
      "tagged post",
      "summary post",
      "new post",
    ]);
  });

  it("preserves the existing date order within the same match level", () => {
    const posts = [{ title: "recent nf post" }, { title: "older nf post" }];
    expect(rankSearchResults(posts, "nf", (post) => post)).toEqual(posts);
  });

  it("returns no results for an empty query", () => {
    expect(rankSearchResults([{ title: "nf_conntrack" }], "  ", (post) => post)).toEqual([]);
  });
});
