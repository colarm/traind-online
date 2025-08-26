/**
 * JSON Tree View Component
 * Renders JSON data in an expandable/collapsible tree structure
 *
 * Filename: JsonTreeView.tsx
 * Author: Haicheng Zhao
 * Date: 2025-08-24
 * AI Usage Declaration:
 * - This file contains code generated with the help of AI tools.
 * - Tool Used: Claude
 * - Date Generated: 2025-08-24
 * - AI-generated sections are marked with comments: # [AI-GENERATED]
 * I have reviewed, tested, and understood all AI-generated code.
 */

import React, { useState } from "react";
import styles from "./JsonTreeView.module.css";

interface JsonTreeViewProps {
  data: any;
  level?: number;
}

// [AI-GENERATED: Claude, 2025-08-24]
const isObject = (val: any) =>
  val && typeof val === "object" && !Array.isArray(val);

/**
 * Recursive component that renders JSON data as an interactive tree
 */
// [AI-GENERATED: Claude, 2025-08-24]
const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, level = 0 }) => {
  const [collapsed, setCollapsed] = useState(true);

  // Handle primitive data types
  if (data === null) return <span className={styles.null}>null</span>;
  if (typeof data === "boolean")
    return <span className={styles.bool}>{String(data)}</span>;
  if (typeof data === "number")
    return <span className={styles.number}>{data}</span>;
  if (typeof data === "string")
    return <span className={styles.string}>"{data}"</span>;

  // Handle arrays with collapsible structure
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

  // Handle objects with collapsible structure
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

  // Fallback for unknown data types
  return <span className={styles.unknown}>{String(data)}</span>;
};

export default JsonTreeView;
