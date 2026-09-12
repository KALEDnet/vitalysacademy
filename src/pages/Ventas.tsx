import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Download, Upload } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, Field, Modal, Select, SimpleTable, TextInput, downloadCSV, money, useToast } from "../components/ui";
import type { Curso, Inscripcion } from "../types";

const DEPARTAMENTOS = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Tarija", "Chuquisaca", "Beni", "Pando"];

export default function Ventas() {
  const { profile } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const { notify, ToastEl } = useToast();

  const [form, setForm] = useState({
    alumno_nombre: "",
    celular: "",
    profesion: "",
    departamento: DEPARTAMENTOS[0],
    curso_id: "",
    monto: "",
  });

  const courseName = (id: number) => cursos.find((c) => c.id === id)?.nombre ?? "—";

  const load = async () => {
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from("cursos").select("*").order("nombre"),
      supabase.from("inscripciones").select("*").order("created_at", { ascending: false }),
    ]);
    setCursos((c as Curso[]) ?? []);
    setInscripciones((i as Inscripcion[]) ?? []);
    if (c && c.length && !form.curso_id) setForm((f) => ({ ...f, curso_id: String((c as Curso[])[0].id) }));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    if (!query.trim()) return inscripciones;
    const q = query.toLowerCase();
    return inscripciones.filter((e) => e.alumno_nombre.toLowerCase().includes(q) || courseName(e.curso_id).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inscripciones, query, cursos]);

  const submit = async () => {
    if (!form.alumno_nombre.trim() || !form.celular.trim() || !form.monto || !form.curso_id) {
      notify("Completa alumno, celular, curso y monto para registrar la venta.");
      return;
    }
    const { error } = await supabase.from("inscripciones").insert({
      alumno_nombre: form.alumno_nombre,
      celular: form.celular,
      profesion: form.profesion || null,
      departamento: form.departamento,
      curso_id: Number(form.curso_id),
      asesor_id: profile!.id,
      monto: Number(form.monto),
    });
    if (error) {
      notify("No se pudo registrar la venta: " + error.message);
      return;
    }
    setForm({ ...form, alumno_nombre: "", celular: "", profesion: "", monto: "" });
    notify("Inscripción registrada.");
    load();
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setImportRows(rows);
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = async () => {
    if (!importRows.length) return;
    const toInsert = importRows
      .map((r) => {
        const curso = cursos.find((c) => c.nombre.toLowerCase().trim() === String(r["Curso"]).toLowerCase().trim());
        if (!curso) return null;
        return {
          alumno_nombre: String(r["Nombre del alumno"] ?? r["Nombre"] ?? "").trim(),
          celular: String(r["Celular"] ?? "").trim(),
          profesion: String(r["Profesión"] ?? r["Profesion"] ?? "").trim() || null,
          departamento: String(r["Departamento"] ?? r["Ubicación"] ?? "").trim() || "La Paz",
          curso_id: curso.id,
          asesor_id: profile!.id,
          monto: Number(r["Monto pagado"] ?? r["Monto"] ?? 0),
        };
      })
      .filter(Boolean);

    if (!toInsert.length) {
      notify("Ninguna fila coincide con un curso existente. Revisa la columna 'Curso'.");
      return;
    }
    const { error } = await supabase.from("inscripciones").insert(toInsert as any[]);
    if (error) {
      notify("Error al importar: " + error.message);
      return;
    }
    notify(`${toInsert.length} inscripciones importadas.`);
    setShowImport(false);
    setImportRows([]);
    load();
  };

  if (loading) return <div>Cargando inscripciones…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Registrar nueva venta</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <Field label="Nombre del alumno">
            <TextInput value={form.alumno_nombre} onChange={(e) => setForm({ ...form, alumno_nombre: e.target.value })} placeholder="Nombre completo" />
          </Field>
          <Field label="Celular">
            <TextInput value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} placeholder="70000000" />
          </Field>
          <Field label="Profesión">
            <TextInput value={form.profesion} onChange={(e) => setForm({ ...form, profesion: e.target.value })} placeholder="Ej. Médico" />
          </Field>
          <Field label="Departamento">
            <Select value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })}>
              {DEPARTAMENTOS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Curso">
            <Select value={form.curso_id} onChange={(e) => setForm({ ...form, curso_id: e.target.value })}>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Monto pagado (Bs)">
            <TextInput type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="450" />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button onClick={submit} style={{ width: "100%", justifyContent: "center" }}>
              <Plus size={15} /> Registrar venta
            </Button>
          </div>
        </div>
      </Card>

      <Card style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 260 }}>
            <Search size={14} color="#4A5568" style={{ position: "absolute", left: 10, top: 11 }} />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por alumno o curso…" style={{ paddingLeft: 30 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="subtle" onClick={() => setShowImport(true)}>
              <Upload size={14} /> Importar Excel
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                downloadCSV(
                  visible.map((e) => [e.alumno_nombre, e.celular, e.profesion ?? "", e.departamento, courseName(e.curso_id), e.monto, e.fecha]),
                  ["Alumno", "Celular", "Profesión", "Departamento", "Curso", "Monto", "Fecha"],
                  "inscripciones.csv"
                )
              }
            >
              <Download size={14} /> Exportar CSV
            </Button>
          </div>
        </div>
        <SimpleTable
          minWidth={720}
          headers={["Alumno", "Celular", "Profesión", "Departamento", "Curso", "Monto", "Fecha"]}
          rows={visible.map((e) => [e.alumno_nombre, e.celular, e.profesion ?? "—", e.departamento, courseName(e.curso_id), money(e.monto), e.fecha])}
        />
      </Card>

      {showImport && (
        <Modal title="Importar inscripciones desde Excel" onClose={() => { setShowImport(false); setImportRows([]); }}>
          <p style={{ fontSize: 13.5, color: "#4A5568", lineHeight: 1.6, marginBottom: 14 }}>
            El archivo debe tener las columnas: <b>Nombre del alumno, Celular, Profesión, Departamento, Curso, Monto pagado</b>.
            El texto de la columna "Curso" debe coincidir exactamente con el nombre de un curso ya creado.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ fontSize: 13.5 }}
            onChange={(e) => e.target.files && onFile(e.target.files[0])}
          />
          {importRows.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>{importRows.length} filas leídas del archivo.</div>
              <Button onClick={confirmImport}>Confirmar importación</Button>
            </div>
          )}
        </Modal>
      )}
      {ToastEl}
    </div>
  );
}
