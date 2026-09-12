import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Card, SimpleTable, SERIF, C, money } from "../components/ui";
import type { Curso, Inscripcion } from "../types";

const AREA_COLOR: Record<string, string> = {
  "Ciencias de la Salud": C.rose,
  Tecnología: C.teal,
  "Habilidades Blandas": C.amber,
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: i }] = await Promise.all([
        supabase.from("cursos").select("*").order("nombre"),
        supabase.from("inscripciones").select("*").order("created_at", { ascending: false }),
      ]);
      setCursos((c as Curso[]) ?? []);
      setInscripciones((i as Inscripcion[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ color: C.inkSoft }}>Cargando panel…</div>;

  const courseName = (id: number) => cursos.find((c) => c.id === id)?.nombre ?? "—";
  const totalInscritos = inscripciones.length;
  const totalVentas = inscripciones.reduce((s, e) => s + Number(e.monto), 0);
  const pendientesCert = inscripciones.filter((e) => e.certificado_estado !== "Entregado").length;
  const esteMes = inscripciones.filter((e) => {
    const d = new Date(e.fecha);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const perCourse = cursos.map((c) => ({
    nombre: c.nombre.split(" ").slice(0, 2).join(" "),
    inscritos: inscripciones.filter((e) => e.curso_id === c.id).length,
    area: c.area,
  }));

  const kpis = [
    { label: "Inscritos totales", value: totalInscritos },
    { label: "Ingresos registrados", value: money(totalVentas) },
    { label: "Inscritos este mes", value: esteMes },
    { label: "Certificados pendientes", value: pendientesCert },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{k.label}</div>
            <div style={{ fontFamily: SERIF, fontSize: 26, marginTop: 6 }}>{k.value}</div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Inscritos por curso</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={perCourse} margin={{ top: 0, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={C.line} />
            <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: C.inkSoft }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.inkSoft }} />
            <Tooltip cursor={{ fill: C.slateSoft }} />
            <Bar dataKey="inscritos" radius={[4, 4, 0, 0]}>
              {perCourse.map((p, i) => (
                <Cell key={i} fill={AREA_COLOR[p.area]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {profile?.role === "admin" && (
        <Card style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Últimas inscripciones</div>
          <SimpleTable
            headers={["Alumno", "Curso", "Monto", "Fecha"]}
            rows={inscripciones.slice(0, 5).map((e) => [e.alumno_nombre, courseName(e.curso_id), money(e.monto), e.fecha])}
          />
        </Card>
      )}
    </div>
  );
}
