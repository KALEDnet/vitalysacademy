import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import RequireAuth, { RequireAdmin } from "./routes/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cursos from "./pages/Cursos";
import Ventas from "./pages/Ventas";
import Reportes from "./pages/Reportes";
import Certificados from "./pages/Certificados";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="ventas" element={<Ventas />} />
            <Route
              path="cursos"
              element={
                <RequireAdmin>
                  <Cursos />
                </RequireAdmin>
              }
            />
            <Route
              path="reportes"
              element={
                <RequireAdmin>
                  <Reportes />
                </RequireAdmin>
              }
            />
            <Route
              path="certificados"
              element={
                <RequireAdmin>
                  <Certificados />
                </RequireAdmin>
              }
            />
            <Route
              path="usuarios"
              element={
                <RequireAdmin>
                  <Usuarios />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
