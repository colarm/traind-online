import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 用于受保护页面的hook，未登录则跳转到欢迎页
 */
export default function useRequireAuth() {
  const navigate = useNavigate();
  const { isLoggedIn, authChecked } = useAuth();

  useEffect(() => {
    // 只有认证检查完成后才判断
    if (!authChecked) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, authChecked, navigate]);
}
