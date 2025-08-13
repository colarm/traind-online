import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import routes from "./routes";

const App = () => (
  <Router>
    <AuthProvider>
      <AppLayout>
        <Routes>{routes}</Routes>
      </AppLayout>
    </AuthProvider>
  </Router>
);

export default App;
