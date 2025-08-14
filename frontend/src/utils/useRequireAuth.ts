import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Hook for pages that require authentication
export default function useRequireAuth() {
  const navigate = useNavigate();
  const { isLoggedIn, authChecked } = useAuth();

  useEffect(() => {
    // Only check authentication status after it has been determined
    if (!authChecked) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, authChecked, navigate]);
}
