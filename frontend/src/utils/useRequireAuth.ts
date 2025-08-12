import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkStatus } from "../api/auth";

/**
 * 用于受保护页面的hook，未登录则跳转到欢迎页
 */
export default function useRequireAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const res = await checkStatus();
      if (!res || !res.valid) {
        navigate("/", { replace: true });
      }
    })();
  }, [navigate]);
}
