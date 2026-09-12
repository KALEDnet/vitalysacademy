import React, { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "../lib/supabaseClient";
import { Button, C, Card, Field, Select, SimpleTable, TextInput, downloadCSV, money } from "../components/ui";
import type { Curso, Inscripcion, Profile } from "../types";

const DEPARTAMENTOS = ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí", "Tarija", "Chuquisaca", "Beni", "Pando"];
const AREA_COLOR: Record<string, string> = {
  "Ciencias de la Salud": C.rose,
  Tecnología: C.teal,
  "Habilidades Blandas": C.amber,
};

export default function Reportes() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [asesores, setAsesores] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [profesion, setProfesion] = useState("Todas");
  const [departamento, setDepartamento] = useState("Todos");
  const [alumnoQuery, setAlumnoQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: i }, { data: p }] = await Promise.all([
        supabase.from("cursos").select("*"),
        supabase.from("inscripciones").select("*"),
        supabase.from("profiles").select("id, full_name, role"),
      ]);
      setCursos((c as Curso[]) ?? []);
      setInscripciones((i as Inscripcion[]) ?? []);
      setAsesores((p as Profile[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const courseName = (id: number) => cursos.find((c) => c.id === id)?.nombre ?? "—";
  const courseArea = (id: number) => cursos.find((c) => c.id === id)?.area ?? "";
  const asesorName = (id: string) => asesores.find((a) => a.id === id)?.full_name ?? "—";

  const profesiones = ["Todas", ...Array.from(new Set(inscripciones.map((e) => e.profesion).filter(Boolean) as string[]))];

  const filtered = useMemo(
    () =>
      inscripciones.filter(
        (e) => (profesion === "Todas" || e.profesion === profesion) && (departamento === "Todos" || e.departamento === departamento)
      ),
    [inscripciones, profesion, departamento]
  );

  const perCourse = cursos.map((c) => ({
    nombre: c.nombre.split(" ").slice(0, 2).join(" "),
    inscritos: filtered.filter((e) => e.curso_id === c.id).length,
    area: c.area,
  }));

  const perAsesor = useMemo(() => {
    const map: Record<string, { asesor: string; ventas: number; monto: number }> = {};
    filtered.forEach((e) => {
      const name = asesorName(e.asesor_id);
      map[name] = map[name] || { asesor: name, ventas: 0, monto: 0 };
      map[name].ventas += 1;
      map[name].monto += Number(e.monto);
    });
    return Object.values(map).sort((a, b) => b.monto - a.monto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, asesores]);

  const historial = alumnoQuery.trim()
    ? inscripciones.filter((e) => e.alumno_nombre.toLowerCase().includes(alumnoQuery.toLowerCase()))
    : [];

  if (loading) return <div>Cargando reportes…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <Field label="Profesión">
            <Select value={profesion} onChange={(e) => setProfesion(e.target.value)} style={{ minWidth: 170 }}>
              {profesiones.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Departamento">
            <Select value={departamento} onChange={(e) => setDepartamento(e.target.value)} style={{ minWidth: 150 }}>
              <option>Todos</option>
              {DEPARTAMENTOS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="ghost"
              onClick={() =>
                downloadCSV(
                  filtered.map((e) => [e.alumno_nombre, courseName(e.curso_id), asesorName(e.asesor_id), e.departamento, e.profesion ?? "", e.monto, e.fecha]),
                  ["Alumno", "Curso", "Asesor", "Departamento", "Profesión", "Monto", "Fecha"],
                  "reporte_inscripciones.csv"
                )
              }
            >
              <Download size={14} /> Exportar vista actual
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Card style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Inscritos por curso</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perCourse} margin={{ top: 0, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.line} />
              <XAxis dataKey="nombre" tick={{ fontSize: 10.5, fill: C.inkSoft }} />
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

        <Card style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Rendimiento por vendedor</div>
          <SimpleTable headers={["Asesor", "Ventas", "Monto generado"]} rows={perAsesor.map((a) => [a.asesor, a.ventas, money(a.monto)])} />
        </Card>
      </div>

      <Card style={{ padding: "20px 22px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Historial de un alumno</div>
        <div style={{ position: "relative", width: 280, marginBottom: 14 }}>
          <Search size={14} color={C.inkSoft} style={{ position: "absolute", left: 10, top: 11 }} />
          <TextInput value={alumnoQuery} onChange={(e) => setAlumnoQuery(e.target.value)} placeholder="Escribe el nombre del alumno…" style={{ paddingLeft: 30 }} />
        </div>
        {alumnoQuery.trim() ? (
          <SimpleTable
            headers={["Curso", "Área", "Monto", "Fecha", "Certificado"]}
            rows={historial.map((e) => [courseName(e.curso_id), courseArea(e.curso_id), money(e.monto), e.fecha, e.certificado_estado])}
          />
        ) : (
          <div style={{ fontSize: 13, color: C.inkSoft }}>Busca un alumno para ver todos los cursos en los que se inscribió.</div>
        )}
      </Card>
    </div>
  );
}
