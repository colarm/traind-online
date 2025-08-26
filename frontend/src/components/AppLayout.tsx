/**
 * Main layout wrapper with navigation and content area
 */

import React from "react";
import Navbar from "./Navbar";
import styles from "./AppLayout.module.css";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.container}>
    {/* Top navigation bar */}
    <Navbar />
    {/* Main content area */}
    <main className={styles.main}>{children}</main>
  </div>
);

export default AppLayout;
