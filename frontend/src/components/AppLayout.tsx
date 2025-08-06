import React from "react";
import Navbar from "./Navbar";
import styles from "./AppLayout.module.css";

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.container}>
    <Navbar />
    <main className={styles.main}>{children}</main>
  </div>
);

export default AppLayout;
