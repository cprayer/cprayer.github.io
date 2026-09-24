/* tslint:disable no-var-requires */
/* tslint:disable no-console */

import * as React from "react";
import config from "../gatsby-config.js";
import { THEME_STORAGE_KEY } from "./theme";

interface HtmlProps {
  body: any;
  postBodyComponents: any;
  headComponents: any;
}

export default (props: HtmlProps) => {
  const headComponents = React.Children.toArray(props.headComponents);
  const isTitle = (component: React.ReactNode) =>
    React.isValidElement(component) && component.type === "title";
  const pageTitle = headComponents.filter(isTitle).pop();
  const otherHeadComponents = headComponents.filter((component) => !isTitle(component));
  const fontStylesheet = [
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9",
    "dist/web/variable/pretendardvariable-dynamic-subset.min.css",
  ].join("/");
  const themeScript = `try {
    var savedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    document.documentElement.dataset.theme = savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (error) {
    document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  var themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = document.documentElement.dataset.theme === "dark"
      ? "#111820" : "#f7f7f7";
  }`;

  const verification = config.siteMetadata && config.siteMetadata.googleVerification ? <meta
    name="google-site-verification"
    content={config.siteMetadata.googleVerification} /> : null;

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        {pageTitle || <title>{config.siteMetadata.title}</title>}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontStylesheet} />
        {otherHeadComponents}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        {verification}
      </head>
      <body>
        <div
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  );
};
