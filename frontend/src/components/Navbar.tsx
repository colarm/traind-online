import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

import ThemeSelect from "./ThemeSelect";

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/train", label: "Training" },
    { path: "/list", label: "Trainds" },
    { path: "/me", label: "Me" },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);

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
    </nav>
  );
};

export default Navbar;
