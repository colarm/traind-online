import { useState, useRef, useEffect } from "react";
import styles from "./ThemeSelect.module.css";
import {
  themes,
  getCurrentThemeLocal,
  changeTheme,
} from "../utils/themeManager";

const ThemeSelect = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTheme = getCurrentThemeLocal();
    setSelected(currentTheme);
  }, []);

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

  const handleThemeSelect = (themeValue: string) => {
    setSelected(themeValue);
    changeTheme(themeValue);
    setOpen(false);
  };

  const getCurrentThemeDisplay = () => {
    if (!selected) {
      return { icon: "🌫️", label: "Loading..." };
    }

    const currentTheme = themes.find((t) => t.value === selected);
    if (!currentTheme) {
      return { icon: "🌫️", label: "Unknown" };
    }

    const [icon, ...labelParts] = currentTheme.label.split(" ");
    return {
      icon,
      label: labelParts.join(" "),
    };
  };

  const { icon, label } = getCurrentThemeDisplay();

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen(!open)}
        disabled={!selected}
      >
        <span className={styles.icon}>{icon}</span>
        <span className={styles.label}>{label}</span>
        <span className={styles.arrow}>▾</span>
      </button>

      {open && selected && (
        <ul className={styles.menu}>
          {themes.map((theme) => (
            <li
              key={theme.value}
              className={`${styles.item} ${
                theme.value === selected ? styles.active : ""
              }`}
              onClick={() => handleThemeSelect(theme.value)}
            >
              {theme.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThemeSelect;
