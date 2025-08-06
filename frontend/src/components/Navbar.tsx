import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/train", label: "Training" },
    { path: "/list", label: "Trainds" },
    { path: "/me", label: "Me" },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">Traind.online</Link>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li
            key={item.path}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.active : ""
            }`}
          >
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
