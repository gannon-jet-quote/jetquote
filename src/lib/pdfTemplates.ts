import jsPDF from "jspdf";

interface ProposalMeta {
  tone: string;
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  clientName: string;
  clientEmail?: string;
  serviceAddress: string;
  licensedInsured: boolean;
  satisfactionGuarantee: boolean;
}

interface ToneTheme {
  headerBg: [number, number, number];
  headerText: [number, number, number];
  accentColor: [number, number, number];
  headingColor: [number, number, number];
  bodyColor: [number, number, number];
  lightGray: [number, number, number];
  dividerColor: [number, number, number];
  sectionBg: [number, number, number] | null;
  fontStyle: "sans" | "serif";
  headerSize: number;
  sectionPadding: number;
  lineHeight: number;
}

const themes: Record<string, ToneTheme> = {
  standard: {
    headerBg: [30, 30, 35],
    headerText: [255, 255, 255],
    accentColor: [50, 50, 55],
    headingColor: [30, 30, 35],
    bodyColor: [60, 60, 65],
    lightGray: [140, 140, 145],
    dividerColor: [210, 210, 215],
    sectionBg: null,
    fontStyle: "sans",
    headerSize: 22,
    sectionPadding: 6,
    lineHeight: 6,
  },
  friendly: {
    headerBg: [56, 132, 206],
    headerText: [255, 255, 255],
    accentColor: [56, 132, 206],
    headingColor: [40, 100, 170],
    bodyColor: [55, 55, 60],
    lightGray: [130, 130, 140],
    dividerColor: [180, 210, 240],
    sectionBg: [245, 249, 255],
    fontStyle: "sans",
    headerSize: 22,
    sectionPadding: 7,
    lineHeight: 6.5,
  },
  premium: {
    headerBg: [18, 18, 28],
    headerText: [255, 255, 255],
    accentColor: [80, 100, 220],
    headingColor: [18, 18, 28],
    bodyColor: [50, 50, 60],
    lightGray: [130, 130, 140],
    dividerColor: [200, 200, 210],
    sectionBg: [248, 248, 252],
    fontStyle: "sans",
    headerSize: 24,
    sectionPadding: 8,
    lineHeight: 6.5,
  },
  luxury: {
    headerBg: [10, 10, 14],
    headerText: [230, 215, 180],
    accentColor: [180, 155, 100],
    headingColor: [10, 10, 14],
    bodyColor: [50, 50, 50],
    lightGray: [150, 145, 135],
    dividerColor: [210, 200, 185],
    sectionBg: null,
    fontStyle: "sans",
    headerSize: 26,
    sectionPadding: 10,
    lineHeight: 7,
  },
};

function parseProposalSections(proposal: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = proposal.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Detect section headers: lines starting with ## or **Section Name** or numbered like "1. Title"
    const headerMatch =
      trimmed.match(/^#{1,3}\s+(.+)/) ||
      trimmed.match(/^\*\*(.+?)\*\*\s*$/) ||
      trimmed.match(/^\d+\.\s+\*?\*?(.+?)\*?\*?\s*$/);

    if (headerMatch) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = headerMatch[1].replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(trimmed.replace(/\*\*/g, "").replace(/\*/g, ""));
    }
  }

  if (currentTitle || currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const tone = meta.tone || "standard";
  const theme = themes[tone] || themes.standard;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 22;
  const contentW = pageW - marginX * 2;
  let y = 0;
  let pageNum = 1;

  const setFont = (style: "normal" | "bold" | "italic" = "normal", size = 11) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };

  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);
  const setDrawColor = (c: [number, number, number]) => doc.setDrawColor(c[0], c[1], c[2]);
  const setFillColor = (c: [number, number, number]) => doc.setFillColor(c[0], c[1], c[2]);

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 30) {
      drawFooter();
      doc.addPage();
      pageNum++;
      y = 20;
    }
  };

  const drawFooter = () => {
    const footerY = pageH - 12;
    setDrawColor(theme.dividerColor);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 4, pageW - marginX, footerY - 4);
    setFont("normal", 8);
    setColor(theme.lightGray);
    doc.text(meta.businessName, marginX, footerY);
    doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, marginX, footerY + 3.5);
    doc.text(`Page ${pageNum}`, pageW - marginX, footerY, { align: "right" });
  };

  const drawDivider = () => {
    checkPage(8);
    setDrawColor(theme.dividerColor);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageW - marginX, y);
    y += 6;
  };

  const writeWrapped = (text: string, size = 10, color = theme.bodyColor, style: "normal" | "bold" = "normal") => {
    setFont(style, size);
    setColor(color);
    const lines = doc.splitTextToSize(text, contentW);
    for (const line of lines) {
      checkPage(theme.lineHeight);
      doc.text(line, marginX, y);
      y += theme.lineHeight;
    }
  };

  // ===== HEADER =====
  const headerH = tone === "luxury" ? 48 : 40;
  setFillColor(theme.headerBg);
  doc.rect(0, 0, pageW, headerH, "F");

  // Business name
  setFont("bold", theme.headerSize);
  setColor(theme.headerText);
  doc.text(meta.businessName, marginX, tone === "luxury" ? 22 : 18);

  // Contact line
  setFont("normal", 9);
  if (tone === "luxury") {
    setColor([...theme.accentColor] as [number, number, number]);
  } else {
    setColor([200, 200, 210]);
  }
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, marginX, tone === "luxury" ? 30 : 26);

  // Licensed badge
  if (meta.licensedInsured) {
    const badgeText = "Licensed & Insured";
    setFont("bold", 8);
    const bw = doc.getTextWidth(badgeText) + 8;
    const bx = pageW - marginX - bw;
    const by = tone === "luxury" ? 15 : 12;
    if (tone === "luxury") {
      setFillColor(theme.accentColor);
      doc.roundedRect(bx, by, bw, 7, 1, 1, "F");
      setColor([10, 10, 14]);
    } else {
      setDrawColor(theme.headerText);
      doc.setLineWidth(0.4);
      doc.roundedRect(bx, by, bw, 7, 1, 1, "S");
      setColor(theme.headerText);
    }
    doc.text(badgeText, bx + 4, by + 5);
  }

  // Proposal title
  setFont("bold", 13);
  if (tone === "luxury") {
    setColor(theme.accentColor);
    doc.text("SERVICE PROPOSAL", marginX, 40);
  } else {
    setColor(theme.headerText);
    doc.text("SERVICE PROPOSAL", marginX, tone === "luxury" ? 40 : 34);
  }

  y = headerH + 10;

  // ===== PREPARED FOR / BY =====
  setFont("bold", 9);
  setColor(theme.lightGray);
  doc.text("PREPARED FOR", marginX, y);
  doc.text("PREPARED BY", pageW / 2 + 5, y);
  y += 5;

  setFont("normal", 10);
  setColor(theme.headingColor);
  doc.text(meta.clientName, marginX, y);
  doc.text(meta.businessName, pageW / 2 + 5, y);
  y += 5;

  setFont("normal", 9);
  setColor(theme.bodyColor);
  const clientLines = doc.splitTextToSize(meta.serviceAddress, contentW / 2 - 10);
  for (const cl of clientLines) {
    doc.text(cl, marginX, y);
    y += 4.5;
  }
  // Reset y for business side
  let byY = y - clientLines.length * 4.5;
  doc.text(meta.businessPhone, pageW / 2 + 5, byY);
  byY += 4.5;
  doc.text(meta.businessEmail, pageW / 2 + 5, byY);
  if (meta.clientEmail) {
    setColor(theme.bodyColor);
    doc.text(meta.clientEmail, marginX, y);
    y += 4.5;
  }

  y += 6;

  // ===== SECTIONS =====
  const sections = parseProposalSections(proposal);

  for (const section of sections) {
    drawDivider();

    // Section heading
    checkPage(14);
    setFont("bold", 12);
    setColor(theme.headingColor);

    // Section background for friendly/premium
    if (theme.sectionBg) {
      setFillColor(theme.sectionBg);
      const sectionLines = doc.splitTextToSize(section.content, contentW - (theme.sectionPadding * 2));
      const sectionH = sectionLines.length * theme.lineHeight + 18;
      const maxH = Math.min(sectionH, pageH - y - 30);
      doc.roundedRect(marginX - 2, y - 4, contentW + 4, maxH, 2, 2, "F");
    }

    const headingLabel = section.title.toUpperCase();
    doc.text(headingLabel, marginX + (theme.sectionBg ? theme.sectionPadding : 0), y);

    // Accent underline for premium/luxury
    if (tone === "premium" || tone === "luxury") {
      y += 2;
      setDrawColor(theme.accentColor);
      doc.setLineWidth(0.6);
      doc.line(
        marginX + (theme.sectionBg ? theme.sectionPadding : 0),
        y,
        marginX + (theme.sectionBg ? theme.sectionPadding : 0) + doc.getTextWidth(headingLabel),
        y
      );
    }

    y += 6;

    // Section content
    const contentLines = section.content.split("\n");
    for (const line of contentLines) {
      const isBullet = line.startsWith("- ") || line.startsWith("• ");
      const displayLine = isBullet ? `  •  ${line.slice(2)}` : line;
      writeWrapped(displayLine, 10, theme.bodyColor, "normal");
      y += 1;
    }

    y += theme.sectionPadding;
  }

  // ===== FINAL FOOTER =====
  drawFooter();

  doc.save("JetQuote-Proposal.pdf");
}
