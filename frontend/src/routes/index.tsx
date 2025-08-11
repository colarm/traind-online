import { Route } from "react-router-dom";

import WelcomePage from "../pages/WelcomePage";
import TrainingPage from "../pages/TrainingPage";
import MyTraindsPage from "../pages/MyTraindsPage";
import NotFound from "../pages/NotFoundPage";

const routes = [
  <Route path="/" element={<WelcomePage />} key="welcome" />,
  <Route path="/training" element={<TrainingPage />} key="training" />,
  <Route path="/my-trainds" element={<MyTraindsPage />} key="my-trainds" />,
  <Route path="/trainds" element={<MyTraindsPage />} key="trainds-redirect" />, // Redirect old route
  <Route path="*" element={<NotFound />} key="notfound" />,
];

export default routes;
