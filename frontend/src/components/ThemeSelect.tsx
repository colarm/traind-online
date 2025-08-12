import { useState, useRef, useEffect } from "react";
import styles from "./ThemeSelect.module.css";
import {
  themes,
  getCurrentThemeLocal,
  changeTheme,
} from "../utils/themeManager";

const ThemeSelect = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => getCurrentThemeLocal());
  const ref = useRef<HTMLDivElement>(null);

  // Apply theme when selected changes
  useEffect(() => {
    changeTheme(selected);
  }, [selected]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.icon}>
          {themes.find((t) => t.value === selected)?.label.split(" ")[0]}
        </span>
        <span className={styles.label}>
          {themes
            .find((t) => t.value === selected)
            ?.label.split(" ")
            .slice(1)
            .join(" ")}
        </span>
        <span className={styles.arrow}>▾</span>
      </button>

      {open && (
        <ul className={styles.menu}>
          {themes.map((t) => (
            <li
              key={t.value}
              className={`${styles.item} ${
                t.value === selected ? styles.active : ""
              }`}
              onClick={() => {
                setSelected(t.value);
                setOpen(false);
              }}
            >
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSelect;
