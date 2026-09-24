const fs = require("fs");
const path = require("path");

const root = __dirname;
const asset = (name) => fs.readFileSync(path.join(root, "gcj-assets", name));
const replaceOnce = (text, before, after) => {
  if (!text.includes(before)) {
    throw new Error(`Expected source markup not found: ${before}`);
  }
  return text.replace(before, () => after);
};

let css = asset("style.css").toString("utf8");
css = replaceOnce(
  css,
  "url('Roboto-Regular.woff2') format('woff2')",
  `url(data:font/ttf;base64,${asset("Roboto-Regular.ttf").toString("base64")}) format('truetype')`,
);
css = replaceOnce(
  css,
  "url('Roboto-Bold.woff2') format('woff2')",
  `url(data:font/woff2;base64,${asset("Roboto-Bold.woff2").toString("base64")}) format('woff2')`,
);

let html = fs.readFileSync(path.join(root, "gcj-cprayer.html"), "utf8");
html = replaceOnce(html, "<head>", '<head>\n<base href="https://zibada.guru/gcj/profile/cprayer">');
for (const [name, content] of [
  ["style.css", css],
  ["highlight.css", asset("highlight.css").toString("utf8")],
]) {
  html = replaceOnce(
    html,
    `<link rel="stylesheet" type="text/css" href="../static/${name}">`,
    `<style>\n${content.replace(/<\/style/gi, "<\\/style")}\n</style>`,
  );
}
for (const name of ["script.js", "highlight.js"]) {
  html = replaceOnce(
    html,
    `<script src="../static/${name}"${name === "highlight.js" ? " async" : ""}></script>`,
    `<script${name === "highlight.js" ? " defer" : ""}>\n${asset(name).toString("utf8").replace(/<\/script/gi, "<\\/script")}\n</script>`,
  );
}

fs.writeFileSync(path.join(root, "gcj-cprayer-complete.html"), html);
