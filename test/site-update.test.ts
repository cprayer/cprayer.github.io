import { getUpdatedUrl } from "../src/site-update";

describe("site update URL", () => {
  it("preserves the current route, query, and fragment", () => {
    const url = getUpdatedUrl("https://cprayer.github.io/posts/example/?q=redis#section", "new-build", 100000);

    expect(url).toBe("https://cprayer.github.io/posts/example/?q=redis&site-version=new-build&site-checked-at=100000#section");
  });

  it("waits before retrying when an edge still serves the old page", () => {
    const href = "https://cprayer.github.io/?site-version=new-build&site-checked-at=100000";

    expect(getUpdatedUrl(href, "new-build", 150000)).toBeNull();
    expect(getUpdatedUrl(href, "new-build", 160000)).toContain("site-checked-at=160000");
  });
});
