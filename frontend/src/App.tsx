/**
 * Main App component
 * Sets up routing, authentication context, and global layout
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import Toast from "./components/Toast";
import routes from "./routes";

/**
 * Root application component with providers and routing
 */
const App = () => (
  <Router>
    <AuthProvider>
      <AppLayout>
        <Routes>{routes}</Routes>
        <Toast />
      </AppLayout>
    </AuthProvider>
  </Router>
);

export default App;
