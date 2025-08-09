import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 Not Found</h1>
      <p className={styles.subtitle}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <div className={styles.animation}></div>
      <button className={styles.homeButton} onClick={() => navigate("/")}>
        Go Back Home
      </button>
    </div>
  );
}

export default NotFound;
