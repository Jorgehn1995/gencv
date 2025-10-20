import PDFDocument from "pdfkit";
import { getFirebaseStorage } from "@@/server/utils/firebase-admin";
import type {
  HarvardCV,
  PersonalInfo,
  WorkExperience,
  Skills,
  Education,
  Language,
  Project,
  ResponsibilityItem,
  Seniority,
  SeniorityES,
} from "@@/app/types/cv";

const COLORS = {
  primary: "#000000",
  secondary: "#333333",
  light: "#555555",
};

const TYPO = {
  name: 12,
  role: 12,
  section: 11,
  body: 10,
  meta: 9,
  gap: {
    section: 10,
    block: 6,
    list: 2,
  },
};

const MARGINS = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
};

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - MARGINS.left - MARGINS.right;
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  const x = MARGINS.left;
  const w = contentWidth(doc);

  doc
    .moveDown(0.2)
    .fontSize(TYPO.section)
    .font("Helvetica-Bold")
    .fillColor(COLORS.primary)
    .text(title.toUpperCase(), x, doc.y, { width: w });

  const y = doc.y + 3;
  doc
    .moveTo(x, y)
    .lineTo(x + w, y)
    .lineWidth(0.6)
    .strokeColor(COLORS.primary)
    .stroke();

  doc.moveDown(TYPO.gap.section / 10);
}

function bulletList(
  doc: PDFKit.PDFDocument,
  items: string[],
  options?: Partial<{
    bulletIndent: number;
    textIndent: number;
    lineGap: number;
  }>
) {
  const w = contentWidth(doc);
  doc.list(items, MARGINS.left, doc.y, {
    width: w,
    bulletRadius: 1.5,
    bulletIndent: options?.bulletIndent ?? 8,
    textIndent: options?.textIndent ?? 16,
    lineGap: options?.lineGap ?? TYPO.gap.list,
  });
}

function fmtCap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtLevel(level: Language["level"]): string {
  const raw = String(level).toLowerCase();
  const mapEnToEs: Record<string, string> = {
    basic: "Básico",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto",
    native: "Nativo",
  };
  const esSet = new Set([
    "básico",
    "lectura técnica",
    "intermedio",
    "avanzado",
    "experto",
    "nativo",
  ]);
  if (esSet.has(raw)) return fmtCap(level as string);
  return mapEnToEs[raw] ? mapEnToEs[raw] : fmtCap(level as string);
}

function fmtSeniority(s?: SeniorityES | Seniority): string | undefined {
  if (!s) return undefined;
  const raw = String(s).toLowerCase();
  if (raw === "junior") return "Junior";
  if (raw === "mid") return "Mid";
  if (raw === "senior") return "Senior";
  return fmtCap(s as string);
}

function fmtPeriodISO(start?: string, end?: string | "Present" | null) {
  const _start = start ?? "";
  let _end = end ?? "";
  if (_end === "Present") _end = "Presente";
  if (!_start && !_end) return "";
  return `${_start || ""} – ${_end || "Presente"}`.trim();
}

function fmtEducationPeriod(
  period?: string | { start?: string; end?: string | "Present" | null }
): string | undefined {
  if (!period) return undefined;
  if (typeof period === "string") return period;
  return fmtPeriodISO(period.start, period.end ?? null);
}

function normalizeResponsibilities(
  list: Array<string | ResponsibilityItem> | undefined
): string[] {
  if (!list?.length) return [];
  const items = list.map((x) =>
    typeof x === "string"
      ? ({ text: x, relevanceScore: 0 } as ResponsibilityItem)
      : x
  );
  items.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  return items.map((i) => i.text).filter(Boolean);
}

function addPersonalInfoSection(
  doc: PDFKit.PDFDocument,
  info: PersonalInfo,
  jobTarget?: HarvardCV["jobTarget"]
): void {
  const w = contentWidth(doc);
  const fullName = `${info.firstName}${
    info.lastName ? " " + info.lastName : ""
  }`.toUpperCase();

  doc
    .font("Helvetica-Bold")
    .fontSize(TYPO.name)
    .fillColor(COLORS.primary)
    .text(fullName, MARGINS.left, doc.y, { align: "center", width: w });

  const roleBits: string[] = [];

  if (jobTarget?.role) {
    roleBits.push(jobTarget.role);
  } else {
    if (info.position) roleBits.push(info.position);
  }

  if (roleBits.length) {
    doc.moveDown(0.2);
    doc
      .font("Helvetica")
      .fontSize(TYPO.role)
      .fillColor(COLORS.secondary)
      .text(roleBits.join(" • "), MARGINS.left, doc.y, {
        align: "center",
        width: w,
      });
  }

  const contact: string[] = [];
  if (info.email || info.phone || info.location)
    contact.push(
      [info.email, info.phone, info.location].filter(Boolean).join(" | ")
    );
  if (info.linkedin) contact.push(info.linkedin);
  if (info.portfolio) contact.push(info.portfolio);

  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(TYPO.meta).fillColor(COLORS.light);
  contact.forEach((line) =>
    doc.text(line, MARGINS.left, doc.y, { align: "center", width: w })
  );

  doc.moveDown(0.8);
}

function addExecutiveSummary(doc: PDFKit.PDFDocument, summary?: string): void {
  if (!summary) return;
  addSectionTitle(doc, "Resumen");

  doc
    .font("Helvetica")
    .fontSize(TYPO.body)
    .fillColor(COLORS.primary)
    .text(summary, MARGINS.left, doc.y, {
      width: contentWidth(doc),
      align: "justify",
      lineGap: 2,
    });

  doc.moveDown(0.6);
}

function addWorkExperience(
  doc: PDFKit.PDFDocument,
  experiences: WorkExperience[]
): void {
  if (!experiences?.length) return;
  addSectionTitle(doc, "Experiencia Laboral");
  const w = contentWidth(doc);

  experiences.forEach((exp, i) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLORS.primary)
      .text(exp.title, MARGINS.left, doc.y, { width: w });

    const companyLine = exp.location
      ? `${exp.company} — ${exp.location}`
      : exp.company;
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.secondary)
      .text(companyLine, MARGINS.left, doc.y, { width: w });

    const period = fmtPeriodISO(exp.period?.start, exp.period?.end ?? null);
    if (period) {
      doc
        .font("Helvetica")
        .fontSize(TYPO.meta)
        .fillColor(COLORS.light)
        .text(period, MARGINS.left, doc.y, { width: w });
    }

    doc.moveDown(0.2);

    const bullets = normalizeResponsibilities(exp.responsibilities);
    if (bullets.length) {
      doc.font("Helvetica").fontSize(TYPO.body).fillColor(COLORS.primary);
      bulletList(doc, bullets, { bulletIndent: 8, textIndent: 16 });
    }

    if (i < experiences.length - 1) doc.moveDown(TYPO.gap.block / 10);
  });

  doc.moveDown(0.4);
}

function addSkills(
  doc: PDFKit.PDFDocument,
  skills?: Skills,
  softSkills?: string[],
  skillsFlat?: string[]
): void {
  if (!skills && !softSkills?.length && !skillsFlat?.length) return;
  addSectionTitle(doc, "Competencias");

  const lines: string[] = [];
  if (skills?.languages?.length)
    lines.push(`Lenguajes: ${skills.languages.join(", ")}`);
  if (skills?.tools?.length)
    lines.push(`Herramientas: ${skills.tools.join(", ")}`);
  if (skills?.methodologies?.length)
    lines.push(`Metodologías: ${skills.methodologies.join(", ")}`);
  if (softSkills?.length) lines.push(`Blandas: ${softSkills.join(", ")}`);

  if (lines.length) {
    doc.font("Helvetica").fontSize(TYPO.body).fillColor(COLORS.primary);
    bulletList(doc, lines, { bulletIndent: 8, textIndent: 16 });
  }

  doc.moveDown(0.4);
}

function addLanguages(doc: PDFKit.PDFDocument, languages?: Language[]): void {
  if (!languages?.length) return;
  addSectionTitle(doc, "Idiomas");
  const items = languages.map((l) => `${l.name}: ${fmtLevel(l.level)}`);
  doc.font("Helvetica").fontSize(TYPO.body).fillColor(COLORS.primary);
  bulletList(doc, items, { bulletIndent: 8, textIndent: 16 });
  doc.moveDown(0.4);
}

function addEducation(doc: PDFKit.PDFDocument, education: Education[]): void {
  if (!education?.length) return;
  addSectionTitle(doc, "Educación");
  const w = contentWidth(doc);

  education.forEach((edu) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.primary)
      .text(edu.degree, MARGINS.left, doc.y, { width: w });

    const inst = edu.location
      ? `${edu.institution} — ${edu.location}`
      : edu.institution;
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(COLORS.secondary)
      .text(inst, MARGINS.left, doc.y, { width: w });

    const periodText = fmtEducationPeriod(edu.period);
    if (periodText)
      doc
        .font("Helvetica")
        .fontSize(TYPO.meta)
        .fillColor(COLORS.light)
        .text(periodText, MARGINS.left, doc.y, { width: w });

    if (edu.status)
      doc
        .font("Helvetica-Oblique")
        .fontSize(TYPO.meta)
        .fillColor(COLORS.light)
        .text(edu.status, MARGINS.left, doc.y, { width: w });

    doc.moveDown(TYPO.gap.block / 10);
  });
}

function addProjects(doc: PDFKit.PDFDocument, projects?: Project[]): void {
  if (!projects?.length) return;
  addSectionTitle(doc, "Proyectos");
  const w = contentWidth(doc);

  projects.forEach((p) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLORS.primary)
      .text(p.name, MARGINS.left, doc.y, { width: w });

    if (p.description)
      doc
        .font("Helvetica")
        .fontSize(TYPO.body)
        .fillColor(COLORS.primary)
        .text(p.description, MARGINS.left, doc.y, { width: w, lineGap: 2 });

    if (p.technologies?.length)
      doc
        .font("Helvetica-Oblique")
        .fontSize(TYPO.meta)
        .fillColor(COLORS.light)
        .text(
          `Tecnologías: ${p.technologies.join(", ")}`,
          MARGINS.left,
          doc.y,
          { width: w }
        );

    if (p.link)
      doc
        .font("Helvetica")
        .fontSize(TYPO.meta)
        .fillColor(COLORS.primary)
        .text(p.link, MARGINS.left, doc.y, {
          width: w,
          link: p.link,
          underline: false,
        });

    doc.moveDown(TYPO.gap.block / 10);
  });
}

export async function generateHarvardPDF(
  cvData: HarvardCV,
  userId: string
): Promise<string> {
  const doc = new PDFDocument({
    size: [612.28, 935.43],
    margins: MARGINS,
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  addPersonalInfoSection(doc, cvData.personalInfo, cvData.jobTarget);

  addExecutiveSummary(
    doc,
    (cvData as any).executiveSummary ?? (cvData as any).summary
  );

  if (cvData.workExperience?.length)
    addWorkExperience(doc, cvData.workExperience);
  if (cvData.skills || cvData.softSkills?.length || cvData.skillsFlat?.length) {
    addSkills(doc, cvData.skills, cvData.softSkills, cvData.skillsFlat);
  }
  if (cvData.languages?.length) addLanguages(doc, cvData.languages);
  if (cvData.education?.length) addEducation(doc, cvData.education);
  if (cvData.projects?.length) addProjects(doc, cvData.projects);

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const storage = getFirebaseStorage();
        const bucket = storage.bucket();
        const timestamp = Date.now();
        const filePath = `users/${userId}/files/optimized/cv_${timestamp}.pdf`;
        const file = bucket.file(filePath);

        await file.save(pdfBuffer, {
          metadata: { contentType: "application/pdf" },
        });

        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", reject);
  });
}
