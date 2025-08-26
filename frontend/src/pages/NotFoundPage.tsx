/**
 * 404 error page with interactive animation
 * Displayed when users navigate to non-existent routes
 */

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFound() {
  const navigate = useNavigate();
  const ballRef = useRef<HTMLDivElement>(null);

  // Interactive 3D rotation effect on mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const ball = ballRef.current;
    if (!ball) return;
    const rect = ball.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * -12;
    ball.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.08)`;
  };

  // Reset animation when mouse leaves
  const handleMouseLeave = () => {
    const ball = ballRef.current;
    if (ball) ball.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 Not Found</h1>
      <p className={styles.subtitle}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <div
        className={styles.animation}
        ref={ballRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label="Animated ball"
      >
        <div className={styles.breathingBall}></div>
      </div>
      <button
        type="button"
        className={styles.homeButton}
        onClick={() => navigate("/")}
      >
        Go Back Home
      </button>
    </div>
  );
}

export default NotFound;
