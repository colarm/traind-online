import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import ThemeSelect from "./ThemeSelect";
import { logout, checkStatus } from "../api/auth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      const result = await checkStatus();
      if (result && !result.error) {
        setIsLoggedIn(result.valid);
        setUserEmail(result.email || "");
      } else {
        console.error("Failed to fetch status", result.error);
      }
    };
    fetchStatus();
  }, []);

  const navItems = [
    { path: "/trainds", label: "Trainds" },
    { path: "/training", label: "Training" },
    { path: "/me", label: "Me" },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      window.location.href = "/";
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

      <ThemeSelect />

      <div className={styles.menuToggle} onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

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
      </ul>

      <div className={styles.userActions}>
        {isLoggedIn ? (
          <>
            <span className={styles.userEmail}>{userEmail}</span>
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
