import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      // Clear authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch auth token change event
      window.dispatchEvent(new Event("authTokenChange"));

      // Log the action
      console.log("User logged out successfully");

      // Redirect to sign in page
      navigate("/auth/sign-in", { replace: true });
    };

    handleLogout();
  }, [navigate]);

  return null;
}
