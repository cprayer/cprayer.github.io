import * as React from "react";
import { Provider } from "react-redux";

import { store } from "./src/store";
import { startSiteUpdateCheck } from "./src/site-update";

export const onClientEntry = () => {
  if (process.env.NODE_ENV === "production" && process.env.GATSBY_BUILD_ID) {
    startSiteUpdateCheck(process.env.GATSBY_BUILD_ID);
  }
};

export const wrapRootElement = ({ element }) =>
    <Provider store={store} >
      {element}
    </Provider>;
