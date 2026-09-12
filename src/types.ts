export type Role = "admin" | "asesor";

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
}

export type Area = "Ciencias de la Salud" | "Tecnología" | "Habilidades Blandas";

export interface Curso {
  id: number;
  nombre: string;
  area: Area;
  precio: number;
}

export type CertificadoEstado = "En elaboración" | "Terminado" | "Entregado";

export interface Inscripcion {
  id: number;
  alumno_nombre: string;
  celular: string;
  profesion: string | null;
  departamento: string;
  curso_id: number;
  asesor_id: string;
  monto: number;
  fecha: string;
  certificado_estado: CertificadoEstado;
  certificado_ruta: string | null;
  created_at: string;
}
