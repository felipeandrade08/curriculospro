// Currículo em Word (.docx): uma coluna, texto real e editável, bom para sistemas de triagem (ATS).
import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeData, ResumeSection } from "@/lib/resume";

const TITLES: Record<ResumeSection, string> = {
  summary: "Objetivo profissional",
  experiences: "Experiência profissional",
  education: "Formação",
  skills: "Competências",
  languages: "Idiomas",
  courses: "Cursos e certificações",
};

const FONT = "Calibri";
const has = (s: string | undefined) => !!s && s.trim().length > 0;
const hex = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c.slice(1).toUpperCase() : "1553D6");

// A4 com margens de 1,8 cm; a data fica alinhada à direita por tabulação.
const TWIP_PER_CM = 567;
const MARGIN = Math.round(1.8 * TWIP_PER_CM);
const CONTENT_WIDTH = Math.round(21 * TWIP_PER_CM) - 2 * MARGIN;

function heading(text: string, color: string) {
  return new Paragraph({
    spacing: { before: 260, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 2 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 21,
        color,
        font: FONT,
        characterSpacing: 20,
      }),
    ],
  });
}

function bullets(lines: string[]) {
  return lines.map(
    (line) =>
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: line, size: 21, font: FONT })],
      }),
  );
}

function descriptionLines(description: string) {
  return description
    .split("\n")
    .map((l) => l.replace(/^\s*[•\-–*]\s*/, "").trim())
    .filter(Boolean);
}

export async function resumeToDocx(
  cv: ResumeData,
  opts: { accent: string; order: ResumeSection[]; hidden: ResumeSection[] },
) {
  const color = hex(opts.accent);
  const body: Paragraph[] = [];

  body.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: cv.name.trim() || "Seu nome",
          bold: true,
          size: 44,
          font: FONT,
          color: "0E1B2E",
        }),
      ],
    }),
  );
  if (has(cv.role))
    body.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: cv.role.trim(), size: 26, bold: true, color, font: FONT })],
      }),
    );
  const contacts = [cv.phone, cv.email, cv.city].filter(has).map((x) => x.trim());
  if (contacts.length)
    body.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: contacts.join("   |   "), size: 19, color: "4A5A72", font: FONT })],
      }),
    );

  for (const key of opts.order) {
    if (opts.hidden.includes(key)) continue;
    if (key === "summary" && has(cv.summary)) {
      body.push(heading(TITLES.summary, color));
      body.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: cv.summary.trim(), size: 21, font: FONT })],
        }),
      );
    }
    if (key === "experiences" || key === "education") {
      const items = cv[key].filter((x) => has(x.title) || has(x.subtitle) || has(x.description));
      if (!items.length) continue;
      body.push(heading(TITLES[key], color));
      for (const item of items) {
        body.push(
          new Paragraph({
            keepNext: true,
            spacing: { before: 100, after: 20 },
            tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
            children: [
              new TextRun({ text: item.title.trim(), bold: true, size: 22, font: FONT }),
              ...(has(item.period)
                ? [new TextRun({ text: "\t" + item.period.trim(), size: 19, color: "4A5A72", font: FONT })]
                : []),
            ],
          }),
        );
        if (has(item.subtitle))
          body.push(
            new Paragraph({
              keepNext: has(item.description),
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: item.subtitle.trim(),
                  italics: true,
                  size: 21,
                  color: "33415A",
                  font: FONT,
                }),
              ],
            }),
          );
        body.push(...bullets(descriptionLines(item.description)));
      }
    }
    if (key === "skills") {
      const skills = cv.skills.filter(has).map((x) => x.trim());
      if (!skills.length) continue;
      body.push(heading(TITLES.skills, color));
      body.push(
        new Paragraph({ children: [new TextRun({ text: skills.join("  •  "), size: 21, font: FONT })] }),
      );
    }
    if (key === "languages" || key === "courses") {
      const list = cv[key].filter(has).map((x) => x.trim());
      if (!list.length) continue;
      body.push(heading(TITLES[key], color));
      body.push(...bullets(list));
    }
  }

  const doc = new Document({
    creator: "CurriculosPRO",
    title: "Currículo — " + (cv.name.trim() || "CurriculosPRO"),
    styles: { default: { document: { run: { font: FONT, size: 21 } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 240 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: Math.round(21 * TWIP_PER_CM), height: Math.round(29.7 * TWIP_PER_CM) },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children: body,
      },
    ],
  });
  return Packer.toBuffer(doc);
}
