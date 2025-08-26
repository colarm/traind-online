/**
 * Authentication guard hook
 * Redirects unauthenticated users to home page
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook for pages that require user authentication
 * Automatically redirects to home page if user is not logged in
 */
export default function useRequireAuth() {
  const navigate = useNavigate();
  const { isLoggedIn, authChecked } = useAuth();

  useEffect(() => {
    // Wait for auth status to be determined before checking
    if (!authChecked) {
      return;
    }

    // Redirect to home if not authenticated
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, authChecked, navigate]);
}
