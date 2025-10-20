import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  UnderlineType,
} from "docx";
import { getFirebaseStorage } from "@@/server/utils/firebase-admin";
import type {
  HarvardCV,
  ResponsibilityItem,
  Seniority,
  SeniorityES,
  Language,
} from "@@/app/types/cv";

const FONT = "Arial";

const FONT_SIZES = {
  name: 24,
  role: 24,
  section: 22,
  body: 20,
  meta: 18,
};

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

export async function generateHarvardDOCX(
  cvData: HarvardCV,
  userId: string
): Promise<string> {
  const sections: Paragraph[] = [];

  const fullName = `${cvData.personalInfo.firstName}${
    cvData.personalInfo.lastName ? " " + cvData.personalInfo.lastName : ""
  }`.toUpperCase();

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: fullName,
          font: FONT,
          size: FONT_SIZES.name,
          bold: true,
          color: "000000",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  const roleBits: string[] = [];
  if (cvData.jobTarget?.role) {
    roleBits.push(cvData.jobTarget.role);
  } else {
    if (cvData.personalInfo.position)
      roleBits.push(cvData.personalInfo.position);
  }

  if (roleBits.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: roleBits.join(" • "),
            font: FONT,
            size: FONT_SIZES.role,
            color: "333333",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  const contact: string[] = [];
  if (
    cvData.personalInfo.email ||
    cvData.personalInfo.phone ||
    cvData.personalInfo.location
  )
    contact.push(
      [
        cvData.personalInfo.email,
        cvData.personalInfo.phone,
        cvData.personalInfo.location,
      ]
        .filter(Boolean)
        .join(" | ")
    );
  if (cvData.personalInfo.linkedin) contact.push(cvData.personalInfo.linkedin);
  if (cvData.personalInfo.portfolio)
    contact.push(cvData.personalInfo.portfolio);

  contact.forEach((line) => {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: FONT,
            size: FONT_SIZES.meta,
            color: "555555",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
      })
    );
  });

  sections.push(new Paragraph({ text: "", spacing: { after: 200 } }));

  const executiveSummary =
    (cvData as any).executiveSummary ?? (cvData as any).summary;
  if (executiveSummary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "RESUMEN",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: executiveSummary,
            font: FONT,
            size: FONT_SIZES.body,
            color: "000000",
          }),
        ],
        spacing: { after: 200 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  if (cvData.workExperience?.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EXPERIENCIA LABORAL",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    cvData.workExperience.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.title,
              font: FONT,
              bold: true,
              size: 22,
              color: "000000",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      const companyLine = exp.location
        ? `${exp.company} — ${exp.location}`
        : exp.company;
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: companyLine,
              font: FONT,
              size: FONT_SIZES.body,
              color: "333333",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      const period = fmtPeriodISO(exp.period?.start, exp.period?.end ?? null);
      if (period) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: period,
                font: FONT,
                size: FONT_SIZES.meta,
                color: "555555",
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      const bullets = normalizeResponsibilities(exp.responsibilities);
      bullets.forEach((bullet) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: bullet,
                font: FONT,
                size: FONT_SIZES.body,
                color: "000000",
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 50 },
          })
        );
      });

      sections.push(new Paragraph({ text: "", spacing: { after: 150 } }));
    });
  }

  if (cvData.skills || cvData.softSkills?.length || cvData.skillsFlat?.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "COMPETENCIAS",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    const lines: string[] = [];
    if (cvData.skills?.languages?.length)
      lines.push(`Lenguajes: ${cvData.skills.languages.join(", ")}`);
    if (cvData.skills?.tools?.length)
      lines.push(`Herramientas: ${cvData.skills.tools.join(", ")}`);
    if (cvData.skills?.methodologies?.length)
      lines.push(`Metodologías: ${cvData.skills.methodologies.join(", ")}`);
    if (cvData.softSkills?.length)
      lines.push(`Blandas: ${cvData.softSkills.join(", ")}`);

    lines.forEach((line) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: FONT,
              size: FONT_SIZES.body,
              color: "000000",
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    });

    sections.push(new Paragraph({ text: "", spacing: { after: 150 } }));
  }

  if (cvData.languages?.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "IDIOMAS",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    cvData.languages.forEach((lang) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${lang.name}: ${fmtLevel(lang.level)}`,
              font: FONT,
              size: FONT_SIZES.body,
              color: "000000",
            }),
          ],
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    });

    sections.push(new Paragraph({ text: "", spacing: { after: 150 } }));
  }

  if (cvData.education?.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EDUCACIÓN",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    cvData.education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              font: FONT,
              bold: true,
              size: FONT_SIZES.body,
              color: "000000",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      const inst = edu.location
        ? `${edu.institution} — ${edu.location}`
        : edu.institution;
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: inst,
              font: FONT,
              size: FONT_SIZES.body,
              color: "333333",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      const periodText = fmtEducationPeriod(edu.period);
      if (periodText) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: periodText,
                font: FONT,
                size: FONT_SIZES.meta,
                color: "555555",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (edu.status) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.status,
                font: FONT,
                italics: true,
                size: FONT_SIZES.meta,
                color: "555555",
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    });
  }

  if (cvData.projects?.length) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROYECTOS",
            font: FONT,
            size: FONT_SIZES.section,
            bold: true,
            color: "000000",
          }),
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: "000000",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    cvData.projects.forEach((proj) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name,
              font: FONT,
              bold: true,
              size: FONT_SIZES.body,
              color: "000000",
            }),
          ],
          spacing: { after: 50 },
        })
      );

      if (proj.description) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.description,
                font: FONT,
                size: FONT_SIZES.body,
                color: "000000",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (proj.technologies?.length) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Tecnologías: ${proj.technologies.join(", ")}`,
                font: FONT,
                italics: true,
                size: FONT_SIZES.meta,
                color: "555555",
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (proj.link) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.link,
                font: FONT,
                size: FONT_SIZES.meta,
                color: "000000",
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      sections.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const storage = getFirebaseStorage();
  const bucket = storage.bucket();
  const timestamp = Date.now();
  const filePath = `users/${userId}/files/optimized/cv_${timestamp}.docx`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    metadata: {
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });

  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  return publicUrl;
}
