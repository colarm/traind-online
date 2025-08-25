import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { logout } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, username, setIsLoggedIn, refreshAuth } = useAuth();

  const navItems = [
    { path: "/trainds", label: "Trainds" },
    { path: "/training", label: "Training" },
    { path: "/help", label: "Help" },
    { path: "/me", label: "Me" },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      await refreshAuth();
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleLogin = () => {
    navigate("/", { state: { modal: "login" } });
    setTimeout(() => {
      const event = new Event("open-login-modal");
      window.dispatchEvent(event);
    }, 100); // Delay to ensure WelcomePage is mounted
  };

  const handleRegister = () => {
    navigate("/", { state: { modal: "register" } });
    setTimeout(() => {
      const event = new Event("open-register-modal");
      window.dispatchEvent(event);
    }, 100); // Delay to ensure WelcomePage is mounted
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Traind.online</Link>
      </div>

      {isLoggedIn && (
        <div className={styles.menuToggle} onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}

      {isLoggedIn && (
        <ul className={`${styles.navList} ${isOpen ? styles.open : ""}`}>
          {navItems.map((item) => (
            <li
              key={item.path}
              className={`${styles.navItem} ${
                location.pathname === item.path ? styles.active : ""
              }`}
            >
              <Link to={item.path} onClick={() => setIsOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <span className={styles.userEmail}>@{username}</span>
          </li>
        </ul>
      )}

      <div className={styles.userActions}>
        {isLoggedIn ? (
          <>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/help" className={styles.actionButton}>
              Help
            </Link>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleLogin}
            >
              Login
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={handleRegister}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
