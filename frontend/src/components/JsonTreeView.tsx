import React, { useState } from "react";
import styles from "./JsonTreeView.module.css";

interface JsonTreeViewProps {
  data: any;
  level?: number;
}

const isObject = (val: any) =>
  val && typeof val === "object" && !Array.isArray(val);

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, level = 0 }) => {
  const [collapsed, setCollapsed] = useState(true);

  if (data === null) return <span className={styles.null}>null</span>;
  if (typeof data === "boolean")
    return <span className={styles.bool}>{String(data)}</span>;
  if (typeof data === "number")
    return <span className={styles.number}>{data}</span>;
  if (typeof data === "string")
    return <span className={styles.string}>"{data}"</span>;

  if (Array.isArray(data)) {
    return (
      <div
        className={`${styles.array} ${styles[`indent-${level}`]}${
          collapsed ? " " + styles.collapsed : ""
        }`}
      >
        <span
          className={styles.toggle}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className={styles.arrow}>{collapsed ? "▶" : "▼"}</span>
          Array ({data.length})
        </span>
        {!collapsed && (
          <ul className={styles.list}>
            {data.map((item, idx) => (
              <li key={idx}>
                <JsonTreeView data={item} level={level + 1} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (isObject(data)) {
    const keys = Object.keys(data);
    return (
      <div
        className={`${styles.object} ${styles[`indent-${level}`]}${
          collapsed ? " " + styles.collapsed : ""
        }`}
      >
        <span
          className={styles.toggle}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className={styles.arrow}>{collapsed ? "▶" : "▼"}</span>
          Object ({keys.length})
        </span>
        {!collapsed && (
          <ul className={styles.list}>
            {keys.map((key) => (
              <li key={key}>
                <span className={styles.key}>{key}:</span>
                <JsonTreeView data={data[key]} level={level + 1} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return <span className={styles.unknown}>{String(data)}</span>;
};

export default JsonTreeView;
