import React, { useEffect, useRef } from "react";
import { getTheme, THEME_CHANGE_EVENT } from "../theme";

export const Comments: React.FC<{}> = React.memo(() => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = divRef.current;
    if (!container) {
      return;
    }

    const script = document.createElement("script");

    const attributes = {
      "async": "true",
      "crossOrigin": "anonymous",
      "issue-term": "pathname",
      "label": "comment",
      "repo": "cprayer/cprayer.github.io",
      "src": "https://utteranc.es/client.js",
      "theme": getTheme() === "dark" ? "github-dark" : "github-light",
    };

    for (const [key, value] of Object.entries(attributes)) {
      script.setAttribute(key, value);
    }

    container.appendChild(script);

    const syncTheme = () => {
      const nextTheme = getTheme() === "dark" ? "github-dark" : "github-light";
      script.setAttribute("theme", nextTheme);
      const frame = container.querySelector<HTMLIFrameElement>("iframe.utterances-frame");
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({
          theme: nextTheme,
          type: "set-theme",
        }, "https://utteranc.es");
      }
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(container, { childList: true });
    container.addEventListener("load", syncTheme, true);
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    return () => {
      observer.disconnect();
      container.removeEventListener("load", syncTheme, true);
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
      if (script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  return <div ref={divRef} />;
});
