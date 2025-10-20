/**
 * Prompt Pro – HarvardCV + Cover Letter + Compatibility + Study Recs + CV Improvements + Salary Expectation (ATS+SoftSkills)
 * - Output must be valid JSON. All VALUES in SPANISH; field NAMES in English.
 * - No comments, no backticks, no extra text. One JSON object only.
 * - Facts only from Original CV (no invented companies/tech/dates/achievements).
 */

interface GeneratePromptParams {
  cvText: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

export function buildProCVPrompt({
  cvText,
  jobTitle,
  companyName,
  jobDescription,
}: GeneratePromptParams): string {
  return `
You are an expert in CV writing, ATS optimization, and technical recruiting.

Produce ONE **valid JSON** object in which **all values are in Spanish** (field names in English). Do not include comments, markdown, or backticks. **Do not invent facts** (companies, technologies, dates, achievements). Use only data from the Original CV for factual content.

Sections to produce:
1. "harvardCV" — Harvard CV (updated types below, ATS-friendly).
2. "coverLetter" — 180–280 palabras, personalizada para "${companyName}" y "${jobTitle}".
3. "compatibility" — integer "percentage" (0–100), short "description" (1–3 líneas), "keywordsMatched" y "keywordsMissing" comparando CV vs. JD.
4. "studyRecommendations" — 1–3 items { title, description } (temas concretos a estudiar; no afirmar experiencia).
5. "cvImprovements" — 1–3 items { title, description } (mejoras accionables de estructura/enfoque).
6. "salaryExpectation" — Guatemala (GTQ), con { expectation:number, range:string, description:string } e indicación de recencia **{mes} y {año} actuales** o “hasta su última fecha de conocimiento” si no hay datos actuales.

Writing style:
- Español profesional y natural.
- Verbos de acción en **pasado** (Desarrollé, Implementé, Configuré, Diseñé, Automaticé, Gestioné...).
- Frases cortas, directas, con **métricas** cuando existan (%, tiempo, usuarios, costos, ingresos).
- Resumen ejecutivo adaptado a la vacante "${jobTitle}" usando experiencia real del CV.
- Enfocar responsabilidades en impacto y resultados.
- **No usar “Experto en …” ni “experta/experto en …”.** En su lugar, escribir **“Con amplia experiencia en …”** (p. ej., “Con amplia experiencia en Vue 3 y Firebase”).
- Si el texto original del CV afirmara literalmente “experto”, **sustituir** en la redacción por **“Con amplia experiencia en …”** (regla STRICT incluso en el executiveSummary).

ATS rules and normalization (STRICT):
- 'workExperience' en **orden cronológico** (más reciente primero).
- Fechas en **ISO-8601** ("YYYY-MM" o "YYYY-MM-DD"). Si rol actual: 'end: "Present"'.
- 'phone' en formato **E.164** (+502…), 'email' en minúsculas.
- 'linkedin' y 'portfolio' con URLs completas válidas (https://…).
- Incluir 'jobTarget' { role, seniority, locationPreference, workMode, keywords }.
- Incluir 'skillsFlat' (array llano de tecnologías/sinónimos: p. ej., "Vue 3", "Vue.js 3", "Node.js", "NestJS", "TypeScript", "Firebase", "SQL Server").
- Incluir **soft skills** en 'softSkills' (4–8 ítems): liderazgo, comunicación, trabajo en equipo, pensamiento crítico, adaptabilidad, gestión del tiempo, negociación, resolución de problemas, etc.
- Cada responsabilidad es **una sola línea** (concisa) con verbo en pasado y, si es posible, **métrica**; puede llevar 'relevanceScore' (0–100).
- 'compatibility.percentage' es **entero** 0–100.
- 'salaryExpectation.expectation' es **número GTQ** (sin símbolos). 'range' tipo "Q6,000–Q10,000 mensuales".

Types (reference; field names in English, values in Spanish):
type Proficiency = "Básico" | "Lectura Técnica" | "Intermedio" | "Avanzado" | "Experto" | "Nativo";
type Seniority   = "Junior" | "Mid" | "Senior";
type DateISO     = string; // "2024-11" o "2024-11-15"

interface JobTarget {
  role?: string;
  seniority?: "Junior" | "Mid" | "Senior";
  locationPreference?: string;
  workMode?: "onsite" | "hybrid" | "remote";
  keywords?: string[];
}

interface HarvardCV {
  personalInfo: {
    firstName: string;
    lastName?: string;
    position?: string;
    email: string;      // minúsculas
    phone: string;      // E.164 (+502…)
    location: string;
    linkedin?: string;  // URL completa
    portfolio?: string; // URL completa
  };
  jobTarget?: JobTarget;
  executiveSummary?: string; // Usar “Con amplia experiencia en …” (no “Experto en …”)

  workExperience: {
    title: string;
    company: string;
    location?: string;
    period: { start: DateISO; end?: DateISO | "Present" | null }; // ISO-8601
    responsibilities: { text: string; relevanceScore?: number }[]; // 1 línea cada una
  }[]; // cronológico: más reciente primero

  skills: {
    languages: string[];       // lenguajes/tecnologías (p.ej., TypeScript, Java, Python)
    tools: string[];           // frameworks/herramientas (p.ej., Vue 3, NestJS, Docker, Firebase)
    methodologies?: string[];  // Scrum, DDD, TDD, etc.
  };

  softSkills?: string[];       // 4–8 habilidades blandas relevantes
  skillsFlat?: string[];       // lista plana de keywords técnicas + sinónimos

  languages?: { name: string; level: Proficiency }[];

  education: {
    degree: string;
    institution: string;
    location?: string;
    period?: { start?: DateISO; end?: DateISO | "Present" | null };
    status?: string;
  }[];

  projects?: {
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }[];
}

interface Compatibility {
  percentage: number;           // entero 0–100
  description: string;          // 1–3 líneas
  keywordsMatched?: string[];   // intersección JD ∩ CV
  keywordsMissing?: string[];   // JD \ CV
}

interface SalaryExpectation {
  expectation: number;  // GTQ, sin símbolos
  range: string;        // "Q6,000–Q10,000 mensuales"
  description: string;  // breve justificación (seniority, stack, responsabilidades, sector), con recencia {mes}/{año}
}

interface Output {
  harvardCV: HarvardCV;
  coverLetter: string;
  compatibility: Compatibility;
  studyRecommendations: { title: string; description: string }[]; // 1–3
  cvImprovements: { title: string; description: string }[];       // 1–3
  salaryExpectation: SalaryExpectation;
}

Job Context
Position: ${jobTitle}
Company: ${companyName}
Description: ${jobDescription}

Original CV
${cvText}

Output
Return ONE valid JSON object that strictly matches the Output interface above (values in Spanish, field names in English).
`;
}
