import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Button, Card, Field, Modal, Pill, Select, SimpleTable, TextInput, money, useToast } from "../components/ui";
import type { Area, Curso } from "../types";

const AREAS: Area[] = ["Ciencias de la Salud", "Tecnología", "Habilidades Blandas"];
const AREA_COLOR: Record<string, string> = {
  "Ciencias de la Salud": "#B4543F",
  Tecnología: "#2E6B63",
  "Habilidades Blandas": "#C6822F",
};

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", area: AREAS[0], precio: "" });
  const { notify, ToastEl } = useToast();

  const load = async () => {
    const { data } = await supabase.from("cursos").select("*").order("nombre");
    setCursos((data as Curso[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.nombre.trim() || !form.precio) {
      notify("Completa el nombre y el precio del curso.");
      return;
    }
    const { error } = await supabase.from("cursos").insert({
      nombre: form.nombre,
      area: form.area,
      precio: Number(form.precio),
    });
    if (error) {
      notify("No se pudo crear el curso: " + error.message);
      return;
    }
    setForm({ nombre: "", area: AREAS[0], precio: "" });
    setOpen(false);
    notify("Curso creado.");
    load();
  };

  if (loading) return <div>Cargando cursos…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "#4A5568" }}>{cursos.length} cursos activos</div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={15} /> Nuevo curso
        </Button>
      </div>

      <Card style={{ padding: "18px 20px" }}>
        <SimpleTable
          headers={["Curso", "Área", "Precio"]}
          rows={cursos.map((c) => [
            c.nombre,
            <Pill bg={AREA_COLOR[c.area] + "22"} fg={AREA_COLOR[c.area]}>{c.area}</Pill>,
            money(c.precio),
          ])}
        />
      </Card>

      {open && (
        <Modal title="Nuevo curso" onClose={() => setOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Nombre del curso">
              <TextInput value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Nutrición Clínica Aplicada" />
            </Field>
            <Field label="Área">
              <Select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as Area })}>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Precio (Bs)">
              <TextInput type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="450" />
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit}>Crear curso</Button>
            </div>
          </div>
        </Modal>
      )}
      {ToastEl}
    </div>
  );
}
