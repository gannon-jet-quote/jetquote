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
  headerBg: [number, number, number] | null;
  headerText: [number, number, number];
  accentColor: [number, number, number];
  headingColor: [number, number, number];
  bodyColor: [number, number, number];
  lightGray: [number, number, number];
  dividerColor: [number, number, number];
  tableBg: [number, number, number];
  tableHeaderBg: [number, number, number];
  tableHeaderText: [number, number, number];
}

const themes: Record<string, ToneTheme> = {
  standard: {
    headerBg: null,
    headerText: [30, 30, 35],
    accentColor: [50, 50, 55],
    headingColor: [30, 30, 35],
    bodyColor: [60, 60, 65],
    lightGray: [140, 140, 145],
    dividerColor: [200, 200, 205],
    tableBg: [248, 248, 250],
    tableHeaderBg: [40, 40, 45],
    tableHeaderText: [255, 255, 255],
  },
  friendly: {
    headerBg: null,
    headerText: [35, 80, 150],
    accentColor: [35, 80, 150],
    headingColor: [35, 80, 150],
    bodyColor: [55, 55, 60],
    lightGray: [130, 130, 140],
    dividerColor: [180, 210, 240],
    tableBg: [240, 247, 255],
    tableHeaderBg: [35, 80, 150],
    tableHeaderText: [255, 255, 255],
  },
  premium: {
    headerBg: null,
    headerText: [18, 18, 28],
    accentColor: [80, 100, 220],
    headingColor: [18, 18, 28],
    bodyColor: [50, 50, 60],
    lightGray: [130, 130, 140],
    dividerColor: [200, 200, 210],
    tableBg: [245, 245, 252],
    tableHeaderBg: [50, 50, 70],
    tableHeaderText: [255, 255, 255],
  },
  luxury: {
    headerBg: [10, 10, 14],
    headerText: [230, 215, 180],
    accentColor: [180, 155, 100],
    headingColor: [10, 10, 14],
    bodyColor: [50, 50, 50],
    lightGray: [150, 145, 135],
    dividerColor: [210, 200, 185],
    tableBg: [252, 250, 245],
    tableHeaderBg: [10, 10, 14],
    tableHeaderText: [230, 215, 180],
  },
};

// ── Helpers ──

function parseProposalSections(proposal: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = proposal.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const headerMatch =
      trimmed.match(/^#{1,3}\s+(.+)/) ||
      trimmed.match(/^\*\*(.+?)\*\*\s*$/) ||
      trimmed.match(/^\d+\.\s+\*?\*?(.+?)\*?\*?\s*$/);

    if (headerMatch) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = headerMatch[1].replace(/\*\*/g, "").replace(/^#+\s*/, "").trim();
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(trimmed.replace(/\*\*/g, "").replace(/\*/g, ""));
    }
  }
  if (currentTitle || currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }
  return sections;
}

function setC(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setF(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setD(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

// ── Main Export ──

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const tone = meta.tone || "standard";
  const theme = themes[tone] || themes.standard;
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();   // 215.9
  const H = doc.internal.pageSize.getHeight();   // 279.4
  const mx = 18; // margin x
  const cw = W - mx * 2; // content width
  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  const sections = parseProposalSections(proposal);

  // Categorise sections by keyword
  const findSection = (keywords: string[]) =>
    sections.find(s => keywords.some(k => s.title.toLowerCase().includes(k)));

  const scopeSection = findSection(["scope", "work", "service", "description"]);
  const timelineSection = findSection(["timeline", "schedule", "completion"]);
  const investmentSection = findSection(["investment", "pricing", "cost", "price", "estimate", "quote"]);
  const termsSection = findSection(["terms", "condition", "payment"]);
  const guaranteeSection = findSection(["guarantee", "warranty", "satisfaction"]);
  const nextStepsSection = findSection(["next", "step", "accept", "proceed", "signature"]);
  // Remaining sections
  const usedTitles = new Set([scopeSection, timelineSection, investmentSection, termsSection, guaranteeSection, nextStepsSection].filter(Boolean).map(s => s!.title));
  const otherSections = sections.filter(s => !usedTitles.has(s.title));

  let y = 0;

  // ══════════════════════════════════════════
  // HEADER — top ~15%
  // ══════════════════════════════════════════

  if (tone === "luxury" && theme.headerBg) {
    setF(doc, theme.headerBg);
    doc.rect(0, 0, W, 38, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    setC(doc, theme.headerText);
    doc.text(meta.businessName.toUpperCase(), mx, 16);
    doc.setFontSize(8);
    setC(doc, theme.accentColor);
    doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, mx, 23);
    if (meta.licensedInsured) {
      const badge = "LICENSED & INSURED";
      doc.setFontSize(7);
      const bw = doc.getTextWidth(badge) + 6;
      setF(doc, theme.accentColor);
      doc.roundedRect(W - mx - bw, 11, bw, 6, 1, 1, "F");
      setC(doc, [10, 10, 14]);
      doc.text(badge, W - mx - bw + 3, 15);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    setC(doc, theme.accentColor);
    doc.text("SERVICE PROPOSAL", mx, 33);
    y = 44;
  } else {
    // Non-luxury header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    setC(doc, theme.headerText);
    doc.text(meta.businessName, mx, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, theme.lightGray);
    doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, mx, 22);

    // Right side — title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setC(doc, theme.accentColor);
    doc.text("SERVICE PROPOSAL", W - mx, 16, { align: "right" });

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, theme.lightGray);
    doc.text(`Date: ${today}`, W - mx, 22, { align: "right" });

    if (meta.licensedInsured) {
      const badge = "Licensed & Insured";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      const bw = doc.getTextWidth(badge) + 6;
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.4);
      doc.roundedRect(W - mx - bw, 25, bw, 5.5, 1, 1, "S");
      setC(doc, theme.accentColor);
      doc.text(badge, W - mx - bw + 3, 28.8);
    }

    // Divider
    y = 35;
    setD(doc, theme.dividerColor);
    doc.setLineWidth(0.4);
    doc.line(mx, y, W - mx, y);
    y += 6;
  }

  // ── Prepared For / By ──
  const col1X = mx;
  const col2X = W / 2 + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setC(doc, theme.lightGray);
  doc.text("PREPARED FOR", col1X, y);
  doc.text("PREPARED BY", col2X, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setC(doc, theme.headingColor);
  doc.text(meta.clientName, col1X, y);
  doc.text(meta.businessName, col2X, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setC(doc, theme.bodyColor);
  // Client address (compact)
  const addrLines = doc.splitTextToSize(meta.serviceAddress, cw / 2 - 10);
  for (const al of addrLines) {
    doc.text(al, col1X, y);
    y += 3.5;
  }
  // Reset for business side
  let bY = y - addrLines.length * 3.5;
  doc.text(meta.businessPhone, col2X, bY);
  bY += 3.5;
  doc.text(meta.businessEmail, col2X, bY);
  if (meta.clientEmail) {
    doc.text(meta.clientEmail, col1X, y);
    y += 3.5;
  }
  y += 4;

  // ══════════════════════════════════════════
  // BODY — sections rendered compactly
  // ══════════════════════════════════════════

  const drawSectionDivider = () => {
    setD(doc, theme.dividerColor);
    doc.setLineWidth(0.2);
    doc.line(mx, y, W - mx, y);
    y += 4;
  };

  const drawSectionHeading = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setC(doc, theme.accentColor);
    doc.text(title.toUpperCase(), mx, y);
    y += 1;
    // Underline accent for premium/luxury
    if (tone === "premium" || tone === "luxury") {
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.5);
      const tw = doc.getTextWidth(title.toUpperCase());
      doc.line(mx, y, mx + tw, y);
    }
    y += 3;
  };

  const writeCompactContent = (content: string, maxLines = 20) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, theme.bodyColor);
    const allLines = content.split("\n");
    let linesWritten = 0;
    for (const rawLine of allLines) {
      if (linesWritten >= maxLines) break;
      const isBullet = rawLine.startsWith("- ") || rawLine.startsWith("• ");
      const display = isBullet ? `•  ${rawLine.slice(2)}` : rawLine;
      const wrapped = doc.splitTextToSize(display, cw);
      for (const wl of wrapped) {
        if (linesWritten >= maxLines) break;
        doc.text(wl, mx + (isBullet ? 2 : 0), y);
        y += 3.5;
        linesWritten++;
      }
    }
  };

  // Calculate available body space
  const footerStart = H - 40;
  const bodyBudget = footerStart - y;

  // Gather body sections
  type BodyItem = { title: string; content: string; emphasis?: boolean };
  const bodyItems: BodyItem[] = [];
  if (scopeSection) bodyItems.push({ title: scopeSection.title, content: scopeSection.content });
  if (timelineSection) bodyItems.push({ title: timelineSection.title, content: timelineSection.content });
  for (const os of otherSections) bodyItems.push({ title: os.title, content: os.content });
  if (investmentSection) bodyItems.push({ title: investmentSection.title, content: investmentSection.content, emphasis: true });
  if (termsSection) bodyItems.push({ title: termsSection.title, content: termsSection.content });

  // Dynamic max lines per section
  const maxLinesPerSection = Math.max(4, Math.floor((bodyBudget / 3.5) / Math.max(bodyItems.length, 1)) - 2);

  for (const item of bodyItems) {
    if (y > footerStart - 10) break;
    drawSectionDivider();

    // Investment emphasis
    if (item.emphasis) {
      setF(doc, theme.tableBg);
      doc.roundedRect(mx - 1, y - 2, cw + 2, 14, 1.5, 1.5, "F");
    }

    drawSectionHeading(item.title);
    writeCompactContent(item.content, maxLinesPerSection);
    y += 2;
  }

  // ══════════════════════════════════════════
  // FOOTER — bottom ~20%
  // ══════════════════════════════════════════

  y = footerStart;
  setD(doc, theme.dividerColor);
  doc.setLineWidth(0.3);
  doc.line(mx, y, W - mx, y);
  y += 4;

  // Guarantee
  if (meta.satisfactionGuarantee) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setC(doc, theme.accentColor);
    doc.text("SATISFACTION GUARANTEE", mx, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.bodyColor);
    const gText = guaranteeSection?.content || "Your satisfaction is our top priority. We stand behind the quality of our work.";
    const gLines = doc.splitTextToSize(gText, cw);
    for (let i = 0; i < Math.min(gLines.length, 3); i++) {
      doc.text(gLines[i], mx, y);
      y += 3;
    }
    y += 2;
  }

  // Next Steps
  if (nextStepsSection) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setC(doc, theme.accentColor);
    doc.text("NEXT STEPS", mx, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.bodyColor);
    const nsLines = doc.splitTextToSize(nextStepsSection.content, cw);
    for (let i = 0; i < Math.min(nsLines.length, 3); i++) {
      doc.text(nsLines[i], mx, y);
      y += 3;
    }
    y += 2;
  }

  // Bottom contact bar
  const bottomY = H - 10;
  setD(doc, theme.dividerColor);
  doc.setLineWidth(0.2);
  doc.line(mx, bottomY - 4, W - mx, bottomY - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setC(doc, theme.lightGray);
  doc.text(meta.businessName, mx, bottomY);
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, W / 2, bottomY, { align: "center" });
  doc.text(`Page 1`, W - mx, bottomY, { align: "right" });

  doc.save("JetQuote-Proposal.pdf");
}
