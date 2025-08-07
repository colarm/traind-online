import React, { useState } from "react";
import styles from "./WelcomePage.module.css";

const WelcomePage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.fullscreen}>
      <div className={styles.centerText}>
        <h1 className={styles.title}>
          Tr<span className={styles.ai_highlight}>ai</span>nd.online
        </h1>
        <p className={styles.subtitle}>Traind to See, Trend to Know</p>
        <button
          type="button"
          className={styles.button}
          onClick={() => setShowModal(true)}
        >
          🚀 Start Training
        </button>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Start Your Analysis</h2>
            <p>Modal content goes here...</p>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
