import type { Timestamp } from "firebase/firestore";

// ── Base ──────────────────────────────────────────────────────────────────────
export type DateISO = string; // "2025-10" o "2025-10-19"

export type ProficiencyES =
  | "Básico"
  | "Lectura Técnica"
  | "Intermedio"
  | "Avanzado"
  | "Experto"
  | "Nativo";

export type SeniorityES = "Junior" | "Mid" | "Senior";

// (Compat: si tu UI aún usa estos, puedes mantenerlos)
export type Proficiency = "basic" | "intermediate" | "advanced" | "expert" | "native";
export type Seniority = "junior" | "mid" | "senior";

export type Status = "Enviado" | "Seleccionado" | "Entrevistado" | "Rechazado";
export type WorkMode = "onsite" | "hybrid" | "remote";

// ── HarvardCV ────────────────────────────────────────────────────────────────
export interface PersonalInfo {
  firstName: string;
  lastName?: string;
  position?: string;
  email: string;      // recomendado: minúsculas
  phone: string;      // recomendado: E.164 (+502…)
  location: string;
  linkedin?: string;  // URL completa https://…
  portfolio?: string; // URL completa https://…
}

export interface JobTarget {
  role?: string;
  seniority?: SeniorityES | Seniority;
  locationPreference?: string;
  workMode?: WorkMode;
  keywords?: string[];
}

export interface ResponsibilityItem {
  text: string;            // 1 línea, verbo en pasado + métrica si existe
  relevanceScore?: number; // 0–100 opcional
}

export interface PeriodISO {
  start: DateISO;
  end?: DateISO | "Present" | null;
}

export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  period: PeriodISO;
  // Compat: permite strings (legacy) o ítems enriquecidos
  responsibilities: Array<string | ResponsibilityItem>;
}

export interface Skills {
  languages: string[];       // lenguajes/tecnologías (TypeScript, Java…)
  tools: string[];           // frameworks/herramientas (Vue 3, NestJS, Docker…)
  methodologies?: string[];  // Scrum, DDD, TDD…
}

export interface Language {
  name: string;
  level: ProficiencyES | Proficiency;
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  // Compat: antes era string; ahora mejor objeto con ISO
  period?: string | { start?: DateISO; end?: DateISO | "Present" | null };
  status?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface HarvardCV {
  personalInfo: PersonalInfo;
  jobTarget?: JobTarget;   // ← NUEVO
  executiveSummary?: string;
  workExperience: WorkExperience[]; // orden cronológico (reciente primero)
  skills: Skills;
  softSkills?: string[];   // ← NUEVO (4–8 habilidades blandas)
  skillsFlat?: string[];   // ← NUEVO (keywords/sinónimos técnicos)
  languages?: Language[];
  education: Education[];
  projects?: Project[];
}

// ── Output sections ──────────────────────────────────────────────────────────
export interface Compatibility {
  percentage: number;        // entero 0–100
  description: string;       // 1–3 líneas
  keywordsMatched?: string[]; // JD ∩ CV
  keywordsMissing?: string[]; // JD \ CV
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface SalaryExpectation {
  expectation: number; // GTQ sin símbolos
  range: string;       // "Q6,000–Q10,000 mensuales"
  description: string; // con recencia {mes}/{año} o “hasta su última fecha de conocimiento”
}

export interface Job {
  title: string;
  companyName: string;
  jobDescription: string;
}

// ── Entidad principal (Optimization) ─────────────────────────────────────────
export interface Optimization {
  id: string;
  status: string;
  harvardCV: HarvardCV;
  coverLetter: string;
  compatibility: Compatibility;
  studyRecommendations: Recommendation[]; // 1–3
  cvImprovements: Recommendation[];       // 1–3
  salaryExpectation: SalaryExpectation;
  job: Job;
  fileURL?: string;
  fileURLDocx?: string;
  userId?: string;
  createdAt?: Timestamp | null;
  additionalNotes?: string[];
}
