import { addDecorator, configure } from "@storybook/react";
import { setOptions } from "@storybook/addon-options";
import { addReadme } from 'storybook-readme';

setOptions({
  name: '잡동사니 개발블로그',
  downPanelInRight: true
});

addDecorator(addReadme);

// Stories loader
const req = require.context("../src", true, /.stories.[jt]sx?$/);
function loadStories() {
  req.keys().forEach(req);
}

// Initialize react-storybook
configure(loadStories, module);
