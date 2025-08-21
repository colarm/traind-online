import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { checkStatus } from "../api/auth";
import { initializeTheme } from "../utils/themeManager";

interface AuthContextType {
  isLoggedIn: boolean;
  userEmail: string;
  username: string;
  authChecked: boolean;
  refreshAuth: () => Promise<void>;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const refreshAuth = async () => {
    try {
      const result = await checkStatus();

      if (result && !result.error) {
        setIsLoggedIn(result.valid);
        setUserEmail(result.email || "");
        setUsername(result.username || "");
      } else {
        console.error("Auth check failed:", result.error);
        setIsLoggedIn(false);
        setUserEmail("");
        setUsername("");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsLoggedIn(false);
      setUserEmail("");
      setUsername("");
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    const checkTheme = async () => {
      if (isLoggedIn) {
        await initializeTheme();
      }
    };
    checkTheme();
  }, [isLoggedIn]);

  useEffect(() => {
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    isLoggedIn,
    userEmail,
    username,
    authChecked,
    refreshAuth,
    setIsLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
