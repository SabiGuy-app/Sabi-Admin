import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";

const App = () => {
  const [isAuth, setIsAuth] = useState(() => {
    return localStorage.getItem("authToken") !== null;
  });

  useEffect(() => {
    // Listen for custom auth token changes
    const handleAuthChange = () => {
      setIsAuth(localStorage.getItem("authToken") !== null);
    };

    window.addEventListener("authTokenChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authTokenChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return (
    <Routes>
      <Route path="auth/*" element={<AuthLayout />} />
      <Route
        path="admin/*"
        element={
          isAuth ? <AdminLayout /> : <Navigate to="/auth/sign-in" replace />
        }
      />
      <Route
        path="rtl/*"
        element={
          isAuth ? <RtlLayout /> : <Navigate to="/auth/sign-in" replace />
        }
      />
      <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default App;
