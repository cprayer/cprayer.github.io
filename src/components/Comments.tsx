import React, { createRef, useLayoutEffect } from "react";

export const Comments: React.FC<{}> = React.memo(() => {
  const divRef = createRef<HTMLDivElement>();

  useLayoutEffect(() => {
    const script = document.createElement("script");

    const attributes = {
      "async": "true",
      "crossOrigin": "anonymous",
      "issue-term": "pathname",
      "label": "comment",
      "repo": "cprayer/cprayer.github.io",
      "src": "https://utteranc.es/client.js",
      "theme": "github-light",
    };

    for (const [key, value] of Object.entries(attributes)) {
      script.setAttribute(key, value);
    }

    divRef.current.appendChild(script);
  });

  return <div ref={divRef} />;
});
