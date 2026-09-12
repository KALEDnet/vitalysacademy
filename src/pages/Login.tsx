import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, C, Field, SANS, SERIF, TextInput } from "../components/ui";

export default function Login() {
  const { session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError("Correo o contraseña incorrectos.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.paper, fontFamily: SANS, padding: 16 }}>
      <form onSubmit={submit} style={{ width: 360, maxWidth: "100%", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "32px 28px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Vitalis Academy</div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 24 }}>Ingresa con tu cuenta del panel interno.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Correo">
            <TextInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@empresa.com" />
          </Field>
          <Field label="Contraseña">
            <TextInput type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
        </div>

        {error && <div style={{ color: "#B4543F", fontSize: 13, marginTop: 12 }}>{error}</div>}

        <Button type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>
          {loading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
