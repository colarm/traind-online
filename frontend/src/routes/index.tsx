import React from "react";
import { Route } from "react-router-dom";

import WelcomePage from "../pages/WelcomePage";
import TrainingPage from "../pages/TrainingPage";
import TraindsPage from "../pages/TraindsPage";
import NotFound from "../pages/NotFoundPage";

const routes = [
  <Route path="/" element={<WelcomePage />} key="welcome" />,
  <Route path="/training" element={<TrainingPage />} key="training" />,
  <Route path="/trainds" element={<TraindsPage />} key="trainds" />,
  <Route path="*" element={<NotFound />} key="notfound" />,
];

export default routes;
