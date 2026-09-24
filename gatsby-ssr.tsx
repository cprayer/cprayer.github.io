import * as React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import Helmet from "react-helmet";

import { store } from "./src/store";

export const replaceRenderer = ({ bodyComponent, replaceBodyHTMLString, setHeadComponents }) => {
  const ConnectedBody = () => (
    <Provider store={store}>
      {bodyComponent}
    </Provider>
  );
  replaceBodyHTMLString(renderToString(<ConnectedBody />));
  const head = Helmet.rewind();
  setHeadComponents([
    ...head.title.toComponent(),
    ...head.meta.toComponent(),
    ...head.link.toComponent(),
  ]);
};
