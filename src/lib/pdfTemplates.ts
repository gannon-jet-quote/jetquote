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
  },
};

// ── Helpers ──

/** Keywords that indicate a section is about client/business info (already rendered in header) */
const DUPLICATE_KEYWORDS = ["prepared for", "prepared by", "client info", "business info", "contact info", "service proposal", "proposal for"];

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
  // Filter empty sections AND duplicate client/business info sections
  return sections.filter(s => {
    if (s.content.trim().length === 0) return false;
    const lower = s.title.toLowerCase();
    return !DUPLICATE_KEYWORDS.some(k => lower.includes(k));
  });
}

function setC(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setF(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setD(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function drawDivider(doc: jsPDF, y: number, mx: number, W: number, color: [number, number, number]) {
  setD(doc, color);
  doc.setLineWidth(0.25);
  doc.line(mx, y, W - mx, y);
}

/** Extract a price string like "$600.00" from investment content */
function extractPrice(content: string): string | null {
  const match = content.match(/\$[\d,]+(?:\.\d{2})?/);
  return match ? match[0] : null;
}

/** Get remaining content after removing the price line */
function getInvestmentDetails(content: string): string {
  const lines = content.split("\n");
  return lines
    .filter(l => !l.match(/^\$[\d,]+(?:\.\d{2})?$/))
    .join("\n")
    .trim();
}

// ── Main Export ──

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const tone = meta.tone || "standard";
  const theme = themes[tone] || themes.standard;
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
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
  // ZONE 1: TOP HEADER (business name + contact)
  // ════════════════════════════════════════════════

  const isLuxury = tone === "luxury";
  const isPremium = tone === "premium";
  const headerNameSize = isLuxury ? 26 : isPremium ? 22 : 20;
  const contactSize = 8.5;

  if (isLuxury && theme.headerBg) {
    setF(doc, theme.headerBg);
    doc.rect(0, 0, W, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(headerNameSize);
    setC(doc, theme.headerText);
    doc.text(meta.businessName.toUpperCase(), mx, 16);

    if (meta.licensedInsured) {
      doc.setFontSize(headerNameSize);
      const nameW = doc.getTextWidth(meta.businessName.toUpperCase());
      const badge = "LICENSED & INSURED";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const bw = doc.getTextWidth(badge) + 5;
      const badgeX = mx + nameW + 5;
      setF(doc, theme.accentColor);
      doc.roundedRect(badgeX, 12, bw, 5.5, 1, 1, "F");
      setC(doc, [10, 10, 14]);
      doc.text(badge, badgeX + 2.5, 15.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(contactSize);
    setC(doc, theme.accentColor);
    doc.text(meta.businessPhone, W - mx, 12, { align: "right" });
    doc.text(meta.businessEmail, W - mx, 16.5, { align: "right" });
    doc.text(`Date: ${today}`, W - mx, 21, { align: "right" });

    y = 34;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(headerNameSize);
    setC(doc, theme.headerText);
    doc.text(meta.businessName, mx, 15);

    if (meta.licensedInsured) {
      const badge = "Licensed & Insured";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      const bw = doc.getTextWidth(badge) + 5;
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.35);
      doc.roundedRect(mx, 18, bw, 5.5, 1, 1, "S");
      setC(doc, theme.accentColor);
      doc.text(badge, mx + 2.5, 21.5);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(contactSize);
    setC(doc, theme.lightGray);
    doc.text(meta.businessPhone, W - mx, 11, { align: "right" });
    doc.text(meta.businessEmail, W - mx, 15.5, { align: "right" });
    doc.text(`Date: ${today}`, W - mx, 20, { align: "right" });

    y = 27;
  }

  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 4;

  // ════════════════════════════════════════════════
  // ZONE 2: PREPARED FOR / PREPARED BY (once only)
  // ════════════════════════════════════════════════

  const col1X = mx;
  const col2X = W / 2 + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setC(doc, theme.lightGray);
  doc.text("PREPARED FOR", col1X, y);
  doc.text("PREPARED BY", col2X, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setC(doc, theme.headingColor);
  doc.text(meta.clientName, col1X, y);
  doc.text(meta.businessName, col2X, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setC(doc, theme.bodyColor);

  const addrLines = doc.splitTextToSize(meta.serviceAddress, cw / 2 - 10);
  let clientY = y;
  for (const al of addrLines) {
    doc.text(al, col1X, clientY);
    clientY += 3;
  }
  if (meta.clientEmail) {
    doc.text(meta.clientEmail, col1X, clientY);
    clientY += 3;
  }

  let bizY = y;
  doc.text(meta.businessPhone, col2X, bizY);
  bizY += 3;
  doc.text(meta.businessEmail, col2X, bizY);

  y = Math.max(clientY, bizY) + 3;

  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 4;

  // ════════════════════════════════════════════════
  // ZONE 3: SCOPE OF WORK (condensed)
  // ════════════════════════════════════════════════

  const sectionHeaderSize = isLuxury ? 10.5 : isPremium ? 10 : 9.5;
  const bodySize = isLuxury ? 9 : isPremium ? 8.5 : 8.5;
  const bodyLineH = isLuxury ? 3.8 : 3.5;

  const writeSection = (title: string, content: string, maxLines: number) => {
    if (!content || !content.trim()) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionHeaderSize);
    setC(doc, theme.accentColor);
    doc.text(title.toUpperCase(), mx, y);
    y += 1.2;
    if (isPremium || isLuxury) {
      setD(doc, theme.accentColor);
      doc.setLineWidth(0.4);
      doc.line(mx, y, mx + doc.getTextWidth(title.toUpperCase()), y);
    }
    y += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(bodySize);
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
        y += bodyLineH;
        written++;
      }
    }
    y += 1.5;
  };

  if (scopeSection) {
    writeSection(scopeSection.title, scopeSection.content, 10);
    drawDivider(doc, y, mx, W, theme.dividerColor);
    y += 4;
  }

  // ════════════════════════════════════════════════
  // ZONE 4: INVESTMENT (visually emphasized)
  // ════════════════════════════════════════════════

  if (investmentSection) {
    const price = extractPrice(investmentSection.content);
    const details = getInvestmentDetails(investmentSection.content);

    // Calculate block height
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const detailLines = details ? doc.splitTextToSize(details, cw - 10) : [];
    const priceLineH = price ? 8 : 0;
    const detailH = Math.min(detailLines.length, 4) * 3;
    const blockH = 8 + priceLineH + detailH + 4;

    // Draw investment container
    setF(doc, theme.investmentBg);
    setD(doc, theme.investmentBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(mx, y - 1, cw, blockH, 2, 2, "FD");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(sectionHeaderSize);
    setC(doc, theme.headingColor);
    doc.text(investmentSection.title.toUpperCase(), mx + 5, y + 5);
    y += 8;

    // Large price
    const priceSize = isLuxury ? 26 : isPremium ? 24 : 22;
    if (price) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(priceSize);
      setC(doc, theme.accentColor);
      doc.text(price, mx + 5, y + 5);
      y += priceLineH + 2;
    }

    // Detail text
    if (detailLines.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      setC(doc, theme.bodyColor);
      for (let i = 0; i < Math.min(detailLines.length, 4); i++) {
        doc.text(detailLines[i], mx + 5, y);
        y += 3;
      }
    }

    y += 5;
    drawDivider(doc, y, mx, W, theme.dividerColor);
    y += 4;
  }

  // ════════════════════════════════════════════════
  // ZONE 5: DETAILS (Timeline, Terms, other)
  // ════════════════════════════════════════════════

  const footerStart = H - 36;
  const remainingForDetails = footerStart - y;
  const detailSections = [timelineSection, termsSection].filter(Boolean);

  // Collect other sections not already rendered
  const usedTitles = new Set(
    [scopeSection, investmentSection, timelineSection, termsSection, guaranteeSection, nextStepsSection]
      .filter(Boolean).map(s => s!.title)
  );
  const otherSections = sections.filter(s => !usedTitles.has(s.title) && s.content.trim());
  const allDetailSections = [...detailSections, ...otherSections];

  const linesPerDetail = allDetailSections.length > 0
    ? Math.max(3, Math.floor((remainingForDetails / 3) / allDetailSections.length) - 3)
    : 5;

  for (const sec of allDetailSections) {
    if (y > footerStart - 8) break;
    if (sec) {
      writeSection(sec.title, sec.content, linesPerDetail);
      drawDivider(doc, y, mx, W, theme.dividerColor);
      y += 4;
    }
  }

  // ════════════════════════════════════════════════
  // ZONE 6: FOOTER (Guarantee + Next Steps + Contact)
  // ════════════════════════════════════════════════

  y = footerStart;
  drawDivider(doc, y, mx, W, theme.dividerColor);
  y += 4;

  // Satisfaction Guarantee
  if (meta.satisfactionGuarantee) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setC(doc, theme.accentColor);
    doc.text("SATISFACTION GUARANTEE", mx, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, theme.bodyColor);
    const gText = guaranteeSection?.content || "Your satisfaction is our top priority. We stand behind the quality of our work.";
    const gLines = doc.splitTextToSize(gText, cw);
    for (let i = 0; i < Math.min(gLines.length, 2); i++) {
      doc.text(gLines[i], mx, y);
      y += 2.8;
    }
    y += 2;
  }

  // Consolidated Next Steps
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setC(doc, theme.accentColor);
  doc.text("NEXT STEPS", mx, y);
  y += 3.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setC(doc, theme.bodyColor);

  const nextStepsText = nextStepsSection?.content
    || `To accept this proposal, please contact us at ${meta.businessEmail} or ${meta.businessPhone}. We look forward to working with you.`;
  const nsLines = doc.splitTextToSize(nextStepsText, cw);
  for (let i = 0; i < Math.min(nsLines.length, 3); i++) {
    doc.text(nsLines[i], mx, y);
    y += 2.8;
  }

  // Bottom contact bar
  const bottomY = H - 7;
  drawDivider(doc, bottomY - 3, mx, W, theme.dividerColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setC(doc, theme.lightGray);
  doc.text(meta.businessName, mx, bottomY);
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, W / 2, bottomY, { align: "center" });
  doc.text("Page 1", W - mx, bottomY, { align: "right" });

  doc.save("JetQuote-Proposal.pdf");
}
