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
  investmentBg: [number, number, number];
  investmentBorder: [number, number, number];
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
    investmentBg: [245, 245, 248],
    investmentBorder: [180, 180, 185],
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
    investmentBg: [235, 245, 255],
    investmentBorder: [100, 160, 220],
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
    investmentBg: [240, 242, 255],
    investmentBorder: [80, 100, 220],
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
    investmentBg: [250, 248, 242],
    investmentBorder: [180, 155, 100],
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
  // Filter out empty sections
  return sections.filter(s => s.content.trim().length > 0);
}

function setC(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setF(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setD(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function drawDivider(doc: jsPDF, y: number, mx: number, W: number, color: [number, number, number]) {
  setD(doc, color);
  doc.setLineWidth(0.25);
  doc.line(mx, y, W - mx, y);
}

// ── Main Export ──

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const tone = meta.tone || "standard";
  const theme = themes[tone] || themes.standard;
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();   // 215.9
  const H = doc.internal.pageSize.getHeight();   // 279.4
  const mx = 18;
  const cw = W - mx * 2;
  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  const sections = parseProposalSections(proposal);

  const findSection = (keywords: string[]) =>
    sections.find(s => keywords.some(k => s.title.toLowerCase().includes(k)));

  const scopeSection = findSection(["scope", "work", "service", "description"]);
  const timelineSection = findSection(["timeline", "schedule", "completion"]);
  const investmentSection = findSection(["investment", "pricing", "cost", "price", "estimate", "quote"]);
  const termsSection = findSection(["terms", "condition", "payment"]);
  const guaranteeSection = findSection(["guarantee", "warranty", "satisfaction"]);
  const nextStepsSection = findSection(["next", "step", "accept", "proceed", "signature"]);

  let y = 0;

  // ════════════════════════════════════════════════
  // ZONE 1: TOP HEADER
  // ════════════════════════════════════════════════

  if (tone === "luxury" && theme.headerBg) {
    setF(doc, theme.headerBg);
    doc.rect(0, 0, W, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    setC(doc, theme.headerText);
    doc.text(meta.businessName.toUpperCase(), mx, 14);

    if (meta.licensedInsured) {
      const badge = "LICENSED & INSURED";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const bw = doc.getTextWidth(badge) + 5;
      setF(doc, theme.accentColor);
      doc.roundedRect(mx + doc.getTextWidth(meta.businessName.toUpperCase()) * (18/doc.getFontSize()) + 8, 9.5, bw, 5, 1, 1, "F");
      // Recalculate position properly
      doc.setFontSize(18);
      const nameW = doc.getTextWidth(meta.businessName.toUpperCase());
      doc.setFontSize(6.5);
      setF(doc, theme.accentColor);
      const badgeX = mx + nameW + 6;
      doc.roundedRect(badgeX, 9, bw, 5.5, 1, 1, "F");
      setC(doc, [10, 10, 14]);
      doc.text(badge, badgeX + 2.5, 12.5);
    }

    // Right side contact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.accentColor);
    doc.text(meta.businessPhone, W - mx, 11, { align: "right" });
    doc.text(meta.businessEmail, W - mx, 15, { align: "right" });
    doc.text(`Date: ${today}`, W - mx, 19, { align: "right" });

    y = 32;
  } else {
    // Standard/Friendly/Premium header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    setC(doc, theme.headerText);
    doc.text(meta.businessName, mx, 14);

    if (meta.licensedInsured) {
      const badge = "Licensed & Insured";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const bw = doc.getTextWidth(badge) + 5;
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.35);
      doc.roundedRect(mx, 17, bw, 5, 1, 1, "S");
      setC(doc, theme.accentColor);
      doc.text(badge, mx + 2.5, 20.3);
    }

    // Right side
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.lightGray);
    doc.text(meta.businessPhone, W - mx, 11, { align: "right" });
    doc.text(meta.businessEmail, W - mx, 15, { align: "right" });
    doc.text(`Date: ${today}`, W - mx, 19, { align: "right" });

    y = 26;
  }

  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 5;

  // ════════════════════════════════════════════════
  // ZONE 2: CLIENT / BUSINESS COLUMNS
  // ════════════════════════════════════════════════

  const col1X = mx;
  const col2X = W / 2 + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  setC(doc, theme.lightGray);
  doc.text("PREPARED FOR", col1X, y);
  doc.text("PREPARED BY", col2X, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setC(doc, theme.headingColor);
  doc.text(meta.clientName, col1X, y);
  doc.text(meta.businessName, col2X, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  setC(doc, theme.bodyColor);

  const addrLines = doc.splitTextToSize(meta.serviceAddress, cw / 2 - 10);
  let clientY = y;
  for (const al of addrLines) {
    doc.text(al, col1X, clientY);
    clientY += 3.2;
  }
  if (meta.clientEmail) {
    doc.text(meta.clientEmail, col1X, clientY);
    clientY += 3.2;
  }

  let bizY = y;
  doc.text(meta.businessPhone, col2X, bizY);
  bizY += 3.2;
  doc.text(meta.businessEmail, col2X, bizY);

  y = Math.max(clientY, bizY) + 4;

  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 5;

  // ════════════════════════════════════════════════
  // ZONE 3: SCOPE OF WORK (condensed)
  // ════════════════════════════════════════════════

  const writeSection = (title: string, content: string, maxLines: number) => {
    if (!content || !content.trim()) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setC(doc, theme.accentColor);
    doc.text(title.toUpperCase(), mx, y);
    y += 1;
    if (tone === "premium" || tone === "luxury") {
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.4);
      doc.line(mx, y, mx + doc.getTextWidth(title.toUpperCase()), y);
    }
    y += 3;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.bodyColor);
    const allLines = content.split("\n");
    let written = 0;
    for (const rawLine of allLines) {
      if (written >= maxLines) break;
      const isBullet = rawLine.startsWith("- ") || rawLine.startsWith("• ");
      const display = isBullet ? `•  ${rawLine.slice(2)}` : rawLine;
      const wrapped = doc.splitTextToSize(display, cw - (isBullet ? 2 : 0));
      for (const wl of wrapped) {
        if (written >= maxLines) break;
        doc.text(wl, mx + (isBullet ? 2 : 0), y);
        y += 3.2;
        written++;
      }
    }
    y += 1;
  };

  if (scopeSection) {
    writeSection(scopeSection.title, scopeSection.content, 12);
    drawDivider(doc, y, mx, W, theme.dividerColor);
    y += 5;
  }

  // ════════════════════════════════════════════════
  // ZONE 4: INVESTMENT (visually emphasized, HIGH)
  // ════════════════════════════════════════════════

  if (investmentSection) {
    // Background block
    setF(doc, theme.investmentBg);
    setD(doc, theme.investmentBorder);
    doc.setLineWidth(0.4);

    // Pre-calculate height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const invLines = doc.splitTextToSize(investmentSection.content, cw - 8);
    const blockH = Math.min(invLines.length, 8) * 3.2 + 10;

    doc.roundedRect(mx, y - 1, cw, blockH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setC(doc, theme.headingColor);
    doc.text(investmentSection.title.toUpperCase(), mx + 4, y + 4);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setC(doc, theme.bodyColor);
    for (let i = 0; i < Math.min(invLines.length, 8); i++) {
      doc.text(invLines[i], mx + 4, y);
      y += 3.2;
    }
    y += 4;

    drawDivider(doc, y, mx, W, theme.dividerColor);
    y += 5;
  }

  // ════════════════════════════════════════════════
  // ZONE 5: DETAILS (Timeline, Terms)
  // ════════════════════════════════════════════════

  // Calculate remaining space for details before footer
  const footerStart = H - 38;
  const remainingForDetails = footerStart - y;
  const detailSections = [timelineSection, termsSection].filter(Boolean);
  // Also include other sections not yet rendered
  const usedTitles = new Set(
    [scopeSection, investmentSection, timelineSection, termsSection, guaranteeSection, nextStepsSection]
      .filter(Boolean).map(s => s!.title)
  );
  const otherSections = sections.filter(s => !usedTitles.has(s.title) && s.content.trim());
  const allDetailSections = [...detailSections, ...otherSections];

  const linesPerDetail = allDetailSections.length > 0
    ? Math.max(3, Math.floor((remainingForDetails / 3.2) / allDetailSections.length) - 3)
    : 6;

  for (const sec of allDetailSections) {
    if (y > footerStart - 8) break;
    if (sec) {
      writeSection(sec.title, sec.content, linesPerDetail);
      drawDivider(doc, y, mx, W, theme.dividerColor);
      y += 5;
    }
  }

  // ════════════════════════════════════════════════
  // ZONE 6: FOOTER (Guarantee, Next Steps, Contact)
  // ════════════════════════════════════════════════

  y = footerStart;
  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 4;

  if (meta.satisfactionGuarantee) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setC(doc, theme.accentColor);
    doc.text("SATISFACTION GUARANTEE", mx, y);
    y += 3.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setC(doc, theme.bodyColor);
    const gText = guaranteeSection?.content || "Your satisfaction is our top priority. We stand behind the quality of our work.";
    const gLines = doc.splitTextToSize(gText, cw);
    for (let i = 0; i < Math.min(gLines.length, 2); i++) {
      doc.text(gLines[i], mx, y);
      y += 3;
    }
    y += 2;
  }

  if (nextStepsSection) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setC(doc, theme.accentColor);
    doc.text("NEXT STEPS", mx, y);
    y += 3.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    setC(doc, theme.bodyColor);
    const nsLines = doc.splitTextToSize(nextStepsSection.content, cw);
    for (let i = 0; i < Math.min(nsLines.length, 2); i++) {
      doc.text(nsLines[i], mx, y);
      y += 3;
    }
    y += 2;
  }

  // Bottom contact bar
  const bottomY = H - 8;
  drawDivider(doc, bottomY - 3, mx, W, theme.dividerColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setC(doc, theme.lightGray);
  doc.text(meta.businessName, mx, bottomY);
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, W / 2, bottomY, { align: "center" });
  doc.text("Page 1", W - mx, bottomY, { align: "right" });

  doc.save("JetQuote-Proposal.pdf");
}
