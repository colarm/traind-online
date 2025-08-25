import React, { useState, useEffect } from "react";
import {
  listHelpTitles,
  getHelpById,
  HelpTitle,
  HelpContent,
} from "../api/help";
import styles from "./HelpPage.module.css";

const HelpPage = () => {
  const [helpTitles, setHelpTitles] = useState<HelpTitle[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<HelpContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Load help titles on component mount
  useEffect(() => {
    const loadHelpTitles = async () => {
      try {
        setLoading(true);
        setError("");
        const titles = await listHelpTitles();
        setHelpTitles(titles);

        // Auto-select first help item if available
        if (titles.length > 0) {
          await loadHelpContent(titles[0].id);
        }
      } catch (err) {
        console.error("Error loading help titles:", err);
        setError("Failed to load help topics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadHelpTitles();
  }, []);

  const loadHelpContent = async (id: string) => {
    try {
      setContentLoading(true);
      setError("");
      const content = await getHelpById(id);
      setSelectedHelp(content);
    } catch (err) {
      console.error("Error loading help content:", err);
      setError("Failed to load help content. Please try again.");
    } finally {
      setContentLoading(false);
    }
  };

  const handleHelpItemClick = (id: string) => {
    if (selectedHelp?.id !== id) {
      loadHelpContent(id);
    }
  };

  const renderContent = (content: string) => {
    // Enhanced markdown-like rendering
    let html = content
      // Handle headers first
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      // Handle bold and italic
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Handle inline code
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // Handle line breaks and paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    // Wrap in paragraph tags if not starting with a heading
    if (!html.startsWith("<h")) {
      html = "<p>" + html + "</p>";
    }

    // Fix empty paragraphs
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p><br><\/p>/g, "");

    return html;
  };

  if (loading) {
    return (
      <div className={styles.helpPage}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading help topics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Help Center</h1>
        <p className={styles.subtitle}>
          Find answers to common questions and learn how to use Traind.online
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>📚 Help Topics</h2>

          {helpTitles.length > 0 ? (
            <ul className={styles.helpList}>
              {helpTitles.map((help) => (
                <li key={help.id} className={styles.helpItem}>
                  <button
                    type="button"
                    className={`${styles.helpItemButton} ${
                      selectedHelp?.id === help.id ? styles.active : ""
                    }`}
                    onClick={() => handleHelpItemClick(help.id)}
                  >
                    <span>📖</span>
                    {help.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.icon}>📭</div>
              <div className={styles.message}>No help topics available</div>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {contentLoading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <span>Loading content...</span>
            </div>
          ) : selectedHelp ? (
            <>
              <h1 className={styles.contentTitle}>
                <span>📖</span>
                {selectedHelp.title}
              </h1>
              <div
                className={styles.contentBody}
                dangerouslySetInnerHTML={{
                  __html: renderContent(selectedHelp.content),
                }}
              />
            </>
          ) : helpTitles.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.icon}>🔍</div>
              <div className={styles.message}>No help content available</div>
              <div className={styles.submessage}>
                Check back later for helpful guides and documentation
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.icon}>👆</div>
              <div className={styles.message}>Select a help topic</div>
              <div className={styles.submessage}>
                Choose a topic from the sidebar to view its content
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
