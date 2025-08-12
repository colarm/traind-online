import { Route } from "react-router-dom";

import WelcomePage from "../pages/WelcomePage";
import TrainingPage from "../pages/TrainingPage";
import MyTraindsPage from "../pages/MyTraindsPage";
import MePage from "../pages/MePage";
import NotFound from "../pages/NotFoundPage";
import TraindDetailPage from "../pages/TraindDetailPage";

const routes = [
  <Route path="/" element={<WelcomePage />} key="welcome" />,
  <Route path="/training" element={<TrainingPage />} key="training" />,
  <Route path="/my-trainds" element={<MyTraindsPage />} key="my-trainds" />,
  <Route
    path="/traind/:id"
    element={<TraindDetailPage />}
    key="traind-detail"
  />,
  <Route path="/me" element={<MePage />} key="me" />,
  <Route path="*" element={<NotFound />} key="notfound" />,
];

export default routes;
