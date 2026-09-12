import React, { useEffect, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Button, Card, Select, SimpleTable, useToast } from "../components/ui";
import type { Curso, Inscripcion, CertificadoEstado } from "../types";

const ESTADOS: CertificadoEstado[] = ["En elaboración", "Terminado", "Entregado"];
const BUCKET = "certificados";

export default function Certificados() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const { notify, ToastEl } = useToast();

  const courseName = (id: number) => cursos.find((c) => c.id === id)?.nombre ?? "—";

  const load = async () => {
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from("cursos").select("*"),
      supabase.from("inscripciones").select("*").order("created_at", { ascending: false }),
    ]);
    setCursos((c as Curso[]) ?? []);
    setInscripciones((i as Inscripcion[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setEstado = async (id: number, estado: CertificadoEstado) => {
    const { error } = await supabase.from("inscripciones").update({ certificado_estado: estado }).eq("id", id);
    if (error) {
      notify("No se pudo actualizar: " + error.message);
      return;
    }
    setInscripciones((prev) => prev.map((e) => (e.id === id ? { ...e, certificado_estado: estado } : e)));
  };

  const onUpload = async (id: number, file: File) => {
    setUploadingId(id);
    const path = `${id}/certificado.pdf`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      notify("No se pudo subir el archivo: " + upErr.message);
      setUploadingId(null);
      return;
    }
    const { error: dbErr } = await supabase.from("inscripciones").update({ certificado_ruta: path }).eq("id", id);
    if (dbErr) {
      notify("El archivo se subió pero no se pudo guardar la referencia: " + dbErr.message);
      setUploadingId(null);
      return;
    }
    setInscripciones((prev) => prev.map((e) => (e.id === id ? { ...e, certificado_ruta: path } : e)));
    notify("Certificado adjuntado.");
    setUploadingId(null);
  };

  const openFile = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
    if (error || !data) {
      notify("No se pudo abrir el archivo: " + (error?.message ?? ""));
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  if (loading) return <div>Cargando certificados…</div>;

  return (
    <Card style={{ padding: "18px 20px" }}>
      <SimpleTable
        minWidth={680}
        headers={["Alumno", "Curso", "Estado", "Archivo"]}
        rows={inscripciones.map((e) => [
          e.alumno_nombre,
          courseName(e.curso_id),
          <Select value={e.certificado_estado} onChange={(ev) => setEstado(e.id, ev.target.value as CertificadoEstado)} style={{ minWidth: 150 }}>
            {ESTADOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>,
          e.certificado_ruta ? (
            <Button variant="subtle" onClick={() => openFile(e.certificado_ruta!)}>
              <FileText size={13} /> Ver PDF
            </Button>
          ) : (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "#4A5568", cursor: "pointer" }}>
              <Upload size={13} />
              {uploadingId === e.id ? "Subiendo…" : "Adjuntar PDF"}
              <input
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(ev) => ev.target.files && onUpload(e.id, ev.target.files[0])}
              />
            </label>
          ),
        ])}
      />
      {ToastEl}
    </Card>
  );
}
