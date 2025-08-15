import React, { useState, useEffect, useCallback } from "react";
import styles from "./Toast.module.css";

// ===== Types =====
export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface ConfirmData {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: (id: string) => void;
}

interface ConfirmProps {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: (id: string) => void;
}

interface ToastContainerProps {
  maxToasts?: number;
}

// ===== Global Toast Manager =====
let globalToastFunction:
  | ((toast: {
      message: string;
      type: "success" | "error" | "warning" | "info";
      duration?: number;
    }) => void)
  | null = null;

let globalConfirmFunction:
  | ((confirm: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => void)
  | null = null;

const setToastFunction = (fn: typeof globalToastFunction) => {
  globalToastFunction = fn;
};

const setConfirmFunction = (fn: typeof globalConfirmFunction) => {
  globalConfirmFunction = fn;
};

export const showSuccess = (message: string, duration?: number) => {
  if (globalToastFunction) {
    globalToastFunction({ message, type: "success", duration });
  }
};

export const showError = (message: string, duration?: number) => {
  if (globalToastFunction) {
    globalToastFunction({ message, type: "error", duration });
  }
};

export const showWarning = (message: string, duration?: number) => {
  if (globalToastFunction) {
    globalToastFunction({ message, type: "warning", duration });
  }
};

export const showInfo = (message: string, duration?: number) => {
  if (globalToastFunction) {
    globalToastFunction({ message, type: "info", duration });
  }
};

export const showConfirm = (options: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) => {
  if (globalConfirmFunction) {
    globalConfirmFunction(options);
  }
};

// ===== Confirm Dialog Component =====
const ConfirmDialog: React.FC<ConfirmProps> = ({
  id,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    onClose(id);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose(id);
  };

  return (
    <div
      className={`${styles.confirmOverlay} ${isVisible ? styles.visible : ""}`}
    >
      <div
        className={`${styles.confirmDialog} ${isVisible ? styles.visible : ""}`}
      >
        <div className={styles.confirmHeader}>
          <h3 className={styles.confirmTitle}>{title}</h3>
        </div>
        <div className={styles.confirmContent}>
          <p className={styles.confirmMessage}>{message}</p>
        </div>
        <div className={styles.confirmActions}>
          <button
            className={`${styles.confirmButton} ${styles.cancelButton}`}
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.confirmButton} ${styles.confirmButtonPrimary}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Toast Component =====
const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match CSS transition duration
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${
        isVisible && !isExiting ? styles.visible : ""
      } ${isExiting ? styles.exiting : ""}`}
      onClick={handleClose}
    >
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button className={styles.closeButton} onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

// ===== Toast Container Component =====
const ToastContainer: React.FC<ToastContainerProps> = ({ maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirms, setConfirms] = useState<ConfirmData[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => {
        const newToasts = [newToast, ...prev];
        return newToasts.slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts]
  );

  const addConfirm = useCallback((confirm: Omit<ConfirmData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newConfirm = { ...confirm, id };

    setConfirms((prev) => [newConfirm, ...prev]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeConfirm = useCallback((id: string) => {
    setConfirms((prev) => prev.filter((confirm) => confirm.id !== id));
  }, []);

  // Register the functions globally
  useEffect(() => {
    setToastFunction(addToast);
    setConfirmFunction(addConfirm);
    return () => {
      setToastFunction(null);
      setConfirmFunction(null);
    };
  }, [addToast, addConfirm]);

  return (
    <>
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
      {confirms.map((confirm) => (
        <ConfirmDialog
          key={confirm.id}
          id={confirm.id}
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText || "Confirm"}
          cancelText={confirm.cancelText || "Cancel"}
          onConfirm={confirm.onConfirm}
          onCancel={confirm.onCancel || (() => {})}
          onClose={removeConfirm}
        />
      ))}
    </>
  );
};

export default ToastContainer;
