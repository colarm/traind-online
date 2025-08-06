import React from "react";
import { Route } from "react-router-dom";

import WelcomePage from "../pages/WelcomePage";
import NotFound from "../pages/NotFoundPage";

const routes = [
  <Route path="/" element={<WelcomePage />} key="welcome" />,
  <Route path="*" element={<NotFound />} key="notfound" />,
];

export default routes;
