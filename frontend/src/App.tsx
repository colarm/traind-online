import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import routes from "./routes";

const App = () => (
  <Router>
    <AppLayout>
      <Routes>{routes}</Routes>
    </AppLayout>
  </Router>
);

export default App;
