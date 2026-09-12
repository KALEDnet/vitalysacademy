import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  FileCheck2,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { C, SANS, SERIF } from "./ui";

const NAV_ADMIN = [
  { to: "/", label: "Panel general", icon: LayoutDashboard, end: true },
  { to: "/cursos", label: "Cursos", icon: BookOpen },
  { to: "/ventas", label: "Inscripciones", icon: ClipboardList },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/certificados", label: "Certificados", icon: FileCheck2 },
  { to: "/usuarios", label: "Usuarios", icon: Users },
];

const NAV_ASESOR = [
  { to: "/", label: "Panel general", icon: LayoutDashboard, end: true },
  { to: "/ventas", label: "Inscripciones", icon: ClipboardList },
];

export default function Layout() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const nav = profile?.role === "admin" ? NAV_ADMIN : NAV_ASESOR;

  const SidebarContent = (
    <>
      <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 600, color: "#fff", lineHeight: 1.15 }}>
        Vitalis
        <br />
        Academy
      </div>
      <div style={{ fontSize: 11.5, color: "#B9D1CA", marginTop: 4, marginBottom: 28 }}>Panel interno</div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end as boolean}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: 600,
                color: isActive ? C.tealDeep : "#DCEAE5",
                background: isActive ? "#EAF1EE" : "transparent",
              })}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #2F5D55" }}>
        <div style={{ fontSize: 12, color: "#DCEAE5", fontWeight: 600 }}>{profile?.full_name ?? "—"}</div>
        <div style={{ fontSize: 11.5, color: "#9FC2BA", marginBottom: 12 }}>
          {profile?.role === "admin" ? "Administrador" : "Asesor de ventas"}
        </div>
        <button
          onClick={signOut}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#DCEAE5", fontFamily: SANS, fontSize: 13, cursor: "pointer", padding: 0 }}
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div style={{ fontFamily: SANS, background: C.paper, color: C.ink, minHeight: "100vh", display: "flex" }}>
      {/* Sidebar escritorio */}
      {!isMobile && (
        <aside style={{ width: 224, flexShrink: 0, background: C.tealDeep, color: "#EAF1EE", display: "flex", flexDirection: "column", padding: "22px 16px", position: "sticky", top: 0, height: "100vh" }}>
          {SidebarContent}
        </aside>
      )}

      {/* Cajón móvil */}
      {isMobile && mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.4)" }} onClick={() => setMobileOpen(false)}>
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{ width: 240, height: "100%", background: C.tealDeep, color: "#EAF1EE", display: "flex", flexDirection: "column", padding: "22px 16px" }}
          >
            <button onClick={() => setMobileOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", color: "#EAF1EE", marginBottom: 8, cursor: "pointer" }}>
              <X size={20} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {isMobile && (
          <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.line}`, background: C.panel }}>
            <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Menu size={22} color={C.ink} />
            </button>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>Vitalis Academy</div>
          </header>
        )}
        <main style={{ padding: isMobile ? 16 : 28, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
