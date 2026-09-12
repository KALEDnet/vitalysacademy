import React from "react";
import { ChevronDown, X } from "lucide-react";

export const C = {
  ink: "#1B2430",
  inkSoft: "#4A5568",
  paper: "#FAF9F6",
  panel: "#FFFFFF",
  line: "#E4E1D8",
  teal: "#2E6B63",
  tealDeep: "#1F4A44",
  amber: "#C6822F",
  amberSoft: "#F3E3C9",
  rose: "#B4543F",
  slateSoft: "#EEF0EA",
};

export const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";
export const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function money(n: number) {
  return "Bs " + Number(n || 0).toLocaleString("es-BO");
}

export function downloadCSV(rows: (string | number)[][], headers: string[], filename: string) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function Pill({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <span style={{ background: bg, color: fg, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="ui-field" style={{ fontFamily: SANS }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft }}>{label}</span>
      {children}
    </label>
  );
}

const inputBase: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 14,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: "9px 11px",
  outline: "none",
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputBase, width: "100%", ...(props.style || {}) }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ position: "relative" }}>
      <select {...props} style={{ ...inputBase, appearance: "none", width: "100%", paddingRight: 30, ...(props.style || {}) }}>
        {props.children}
      </select>
      <ChevronDown size={14} color={C.inkSoft} style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }} />
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "subtle" }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C.tealDeep, color: "#fff", border: `1px solid ${C.tealDeep}` },
    ghost: { background: "transparent", color: C.inkSoft, border: `1px solid ${C.line}` },
    subtle: { background: C.slateSoft, color: C.ink, border: `1px solid ${C.line}` },
  };
  return (
    <button
      {...rest}
      style={{
        ...styles[variant],
        fontFamily: SANS,
        fontSize: 13.5,
        fontWeight: 600,
        padding: "9px 14px",
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        cursor: rest.disabled ? "not-allowed" : "pointer",
        opacity: rest.disabled ? 0.6 : 1,
        ...(rest.style || {}),
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, ...style }}>{children}</div>;
}

export function SimpleTable({ headers, rows, minWidth }: { headers: string[]; rows: React.ReactNode[][]; minWidth?: number }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: minWidth || "auto" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, padding: "0 12px 10px 0", borderBottom: `1px solid ${C.line}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} style={{ fontSize: 13.5, padding: "10px 12px 10px 0", borderBottom: `1px solid ${C.line}`, verticalAlign: "middle" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} style={{ padding: "18px 0", color: C.inkSoft, fontSize: 13 }}>
                No hay registros para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(27,36,48,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, borderRadius: 12, padding: "22px 24px", width: 440, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={18} color={C.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<string | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  const ToastEl = toast ? (
    <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13.5, fontFamily: SANS, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", zIndex: 100 }}>
      {toast}
    </div>
  ) : null;
  return { notify, ToastEl };
}
