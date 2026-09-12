import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const { session, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function RequireAdmin({ children }: { children: React.ReactElement }) {
  const { profile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function FullScreenLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#4A5568" }}>
      Cargando…
    </div>
  );
}
