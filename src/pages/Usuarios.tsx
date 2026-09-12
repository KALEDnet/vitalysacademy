import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { supabase, supabaseSignup } from "../lib/supabaseClient";
import { Button, Card, Field, Modal, Pill, Select, SimpleTable, TextInput, useToast } from "../components/ui";
import type { Profile, Role } from "../types";

export default function Usuarios() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "asesor" as Role });
  const { notify, ToastEl } = useToast();

  const load = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, role").order("full_name");
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      notify("Completa nombre, correo, y una contraseña de al menos 6 caracteres.");
      return;
    }
    setSaving(true);

    // Se usa un cliente aparte (sin guardar sesión) para no cerrar la
    // sesión del administrador que está creando el usuario.
    const { data, error } = await supabaseSignup.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (error || !data.user) {
      notify("No se pudo crear el usuario: " + (error?.message ?? "error desconocido"));
      setSaving(false);
      return;
    }

    // El nuevo usuario se crea con rol "asesor" por defecto (ver trigger
    // en la base de datos). Si el administrador eligió "admin", se
    // actualiza el rol aquí mismo.
    if (form.role === "admin") {
      await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
    }

    await supabaseSignup.auth.signOut();
    setForm({ full_name: "", email: "", password: "", role: "asesor" });
    setOpen(false);
    setSaving(false);
    notify("Usuario creado correctamente.");
    load();
  };

  if (loading) return <div>Cargando usuarios…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "#4A5568" }}>{users.length} usuarios con acceso</div>
        <Button onClick={() => setOpen(true)}>
          <UserPlus size={15} /> Nuevo usuario
        </Button>
      </div>

      <Card style={{ padding: "18px 20px" }}>
        <SimpleTable
          headers={["Nombre", "Rol"]}
          rows={users.map((u) => [
            u.full_name ?? "—",
            <Pill bg={u.role === "admin" ? "#F3E3C9" : "#E1EAE3"} fg={u.role === "admin" ? "#7A5217" : "#2F5C3C"}>
              {u.role === "admin" ? "Administrador" : "Asesor de ventas"}
            </Pill>,
          ])}
        />
      </Card>

      {open && (
        <Modal title="Crear nuevo usuario" onClose={() => setOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Nombre completo">
              <TextInput value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Nombre y apellido" />
            </Field>
            <Field label="Correo">
              <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@empresa.com" />
            </Field>
            <Field label="Contraseña temporal">
              <TextInput type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </Field>
            <Field label="Rol">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="asesor">Asesor de ventas</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? "Creando…" : "Crear usuario"}</Button>
            </div>
          </div>
        </Modal>
      )}
      {ToastEl}
    </div>
  );
}
