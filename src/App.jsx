import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Requests from "./pages/Requests";
import CreateRequest from "./pages/CreateRequest";
import RequestDetail from "./pages/RequestDetail";
import ChangePassword from "./pages/ChangePassword";
import ServicesAdmin from "./pages/admin/Services";
import ProvidersAdmin from "./pages/admin/Providers";
import RequestsStatusAdmin from "./pages/admin/RequestsStatus";
import Chatbot from "./pages/Chatbot";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">
          Se incarca...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<RequestDetail />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin/services" element={<ServicesAdmin />} />
          <Route path="/admin/providers" element={<ProvidersAdmin />} />
          <Route path="/admin/requests-status" element={<RequestsStatusAdmin />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
