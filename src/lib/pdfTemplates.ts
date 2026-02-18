import jsPDF from "jspdf";

// ── Types ──

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
  totalPrice: string;
  logoDataUrl?: string | null;
  primaryColor?: { name: string; hex: string; rgb: number[] } | null;
  secondaryColor?: { name: string; hex: string; rgb: number[] } | null;
  tertiaryColor?: { name: string; hex: string; rgb: number[] } | null;
}

interface ToneColors {
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

interface ToneTypography {
  businessNameSize: number;
  priceSize: number;
  sectionHeaderSize: number;
  bodySize: number;
  bodyLineHeight: number;
  contactSize: number;
  badgeSize: number;
  badgeStyle: "outline" | "filled";
  businessNameTransform: "uppercase" | "none";
  underlineSectionHeaders: boolean;
}

interface ToneStyle {
  colors: ToneColors;
  typography: ToneTypography;
}

// ── Tone Style Definitions ──

const toneStyles: Record<string, ToneStyle> = {
  standard: {
    colors: {
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
    typography: {
      businessNameSize: 20,
      priceSize: 22,
      sectionHeaderSize: 9.5,
      bodySize: 8.5,
      bodyLineHeight: 3.5,
      contactSize: 8.5,
      badgeSize: 7,
      badgeStyle: "outline",
      businessNameTransform: "none",
      underlineSectionHeaders: false,
    },
  },
  friendly: {
    colors: {
      headerBg: null,
      headerText: [45, 95, 160],
      accentColor: [45, 95, 160],
      headingColor: [45, 95, 160],
      bodyColor: [60, 60, 65],
      lightGray: [140, 140, 150],
      dividerColor: [185, 212, 240],
      investmentBg: [238, 246, 255],
      investmentBorder: [110, 168, 225],
    },
    typography: {
      businessNameSize: 20,
      priceSize: 20,
      sectionHeaderSize: 9.5,
      bodySize: 8.5,
      bodyLineHeight: 3.8,
      contactSize: 8.5,
      badgeSize: 7,
      badgeStyle: "outline",
      businessNameTransform: "none",
      underlineSectionHeaders: false,
    },
  },
  premium: {
    colors: {
      headerBg: [32, 36, 48],
      headerText: [240, 240, 245],
      accentColor: [80, 100, 220],
      headingColor: [18, 18, 28],
      bodyColor: [50, 50, 60],
      lightGray: [130, 130, 140],
      dividerColor: [200, 200, 210],
      investmentBg: [240, 242, 255],
      investmentBorder: [80, 100, 220],
    },
    typography: {
      businessNameSize: 22,
      priceSize: 24,
      sectionHeaderSize: 10,
      bodySize: 8.5,
      bodyLineHeight: 3.5,
      contactSize: 8.5,
      badgeSize: 7,
      badgeStyle: "outline",
      businessNameTransform: "none",
      underlineSectionHeaders: true,
    },
  },
  luxury: {
    colors: {
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
    typography: {
      businessNameSize: 28,
      priceSize: 26,
      sectionHeaderSize: 10.5,
      bodySize: 9,
      bodyLineHeight: 4.0,
      contactSize: 8.5,
      badgeSize: 6.5,
      badgeStyle: "filled",
      businessNameTransform: "uppercase",
      underlineSectionHeaders: true,
    },
  },
};

// ── Helpers ──

const DUPLICATE_KEYWORDS = [
  "prepared for", "prepared by", "client info", "business info",
  "contact info", "service proposal", "proposal for",
];

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

/** Extract the canonical investment amount from content. Returns the last price match. */
function extractInvestmentAmount(content: string): string | null {
  const matches = content.match(/\$[\d,]+(?:\.\d{2})?/g);
  return matches ? matches[matches.length - 1] : null;
}

/** Get supporting text with ALL price occurrences removed to prevent duplication. */
function getInvestmentDetails(content: string): string {
  return content
    .split("\n")
    .map(l => l.replace(/\$[\d,]+(?:\.\d{2})?/g, "").trim())
    .filter(l => l.length > 0)
    .join("\n")
    .trim();
}

/** Strip leading numbering like "1. " or "2) " from section titles */
function stripNumbering(title: string): string {
  return title.replace(/^\d+[\.\)]\s*/, "");
}

// ── Base Template ──

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const style = JSON.parse(JSON.stringify(toneStyles[meta.tone] || toneStyles.standard)) as ToneStyle;

  // Apply user-selected colors
  if (meta.tone === "friendly" && meta.primaryColor) {
    const rgb = meta.primaryColor.rgb as [number, number, number];
    style.colors.accentColor = rgb;
    style.colors.headingColor = rgb;
    style.colors.headerText = rgb;
    style.colors.dividerColor = [rgb[0] + 80, rgb[1] + 80, rgb[2] + 80].map(v => Math.min(v, 240)) as [number, number, number];
    style.colors.investmentBorder = rgb;
  } else if ((meta.tone === "premium" || meta.tone === "luxury") && meta.primaryColor) {
    style.colors.headerBg = meta.primaryColor.rgb as [number, number, number];
    if (meta.secondaryColor) {
      const sec = meta.secondaryColor.rgb as [number, number, number];
      style.colors.accentColor = sec;
      style.colors.investmentBorder = sec;
    }
  }

  // Luxury tertiary color: override header text color only
  if (meta.tone === "luxury" && meta.tertiaryColor) {
    style.colors.headerText = meta.tertiaryColor.rgb as [number, number, number];
  }

  const { colors: c, typography: t } = style;

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

  // Track all assigned sections to prevent duplicates
  const assignedSections = new Set(
    [scopeSection, timelineSection, investmentSection, termsSection, guaranteeSection, nextStepsSection]
      .filter(Boolean).map(s => s!.title)
  );

  let y = 0;

  // ═══ ZONE 1: HEADER ═══
  const businessNameDisplay = t.businessNameTransform === "uppercase"
    ? meta.businessName.toUpperCase() : meta.businessName;

  const headerH = c.headerBg ? (meta.tone === "luxury" ? 34 : 30) : 0;
  if (c.headerBg) {
    setF(doc, c.headerBg);
    doc.rect(0, 0, W, headerH, "F");
  }

  // Logo rendering
  let logoW = 0;
  const logoH = 10;
  const logoX = mx;
  const logoYBase = c.headerBg ? (meta.tone === "luxury" ? 10 : 8) : 5;
  if (meta.logoDataUrl) {
    try {
      const fmt = meta.logoDataUrl.includes("image/png") ? "PNG" : meta.logoDataUrl.includes("image/svg") ? "PNG" : "JPEG";
      doc.addImage(meta.logoDataUrl, fmt, logoX, logoYBase, 0, logoH);
      // Estimate width from aspect ratio (approx)
      logoW = logoH * 2.5; // rough estimate, logo will auto-scale
    } catch {
      logoW = 0;
    }
  }

  const textOffsetX = logoW > 0 ? mx + logoW + 3 : mx;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(t.businessNameSize);
  setC(doc, c.headerText);
  const nameY = c.headerBg ? (meta.tone === "luxury" ? 18 : 16) : 15;
  doc.text(businessNameDisplay, textOffsetX, nameY);

  // Right column: contact info — Phone, Email, Date, then Licensed & Insured badge
  doc.setFont("helvetica", "normal");
  doc.setFontSize(t.contactSize);
  setC(doc, c.headerBg ? c.headerText : c.lightGray);
  const contactBaseY = c.headerBg ? (meta.tone === "luxury" ? 12 : 10) : 9;
  let contactY = contactBaseY;
  doc.text(meta.businessPhone, W - mx, contactY, { align: "right" });
  contactY += 4;
  doc.text(meta.businessEmail, W - mx, contactY, { align: "right" });
  contactY += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(t.contactSize);
  setC(doc, c.headerBg ? c.headerText : c.lightGray);
  doc.text(`Date: ${today}`, W - mx, contactY, { align: "right" });
  contactY += 4;

  if (meta.licensedInsured) {
    const badge = t.badgeStyle === "filled" ? "LICENSED & INSURED" : "Licensed & Insured";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(t.badgeSize);
    const bw = doc.getTextWidth(badge) + 5;
    const badgeX = W - mx - bw;

    if (t.badgeStyle === "filled") {
      setF(doc, c.accentColor);
      doc.roundedRect(badgeX, contactY - 3.5, bw, 5, 1, 1, "F");
      setC(doc, c.headerBg || [255, 255, 255]);
      doc.text(badge, badgeX + 2.5, contactY);
    } else {
      setD(doc, c.accentColor);
      doc.setLineWidth(0.35);
      doc.roundedRect(badgeX, contactY - 3.5, bw, 5, 1, 1, "S");
      setC(doc, c.accentColor);
      doc.text(badge, badgeX + 2.5, contactY);
    }
    contactY += 5;
  }

  y = c.headerBg ? headerH + 4 : 27;
  drawDivider(doc, y, mx, W, c.dividerColor);
  y += 4;

  // ═══ ZONE 2: PREPARED FOR / PREPARED BY ═══
  const col1X = mx;
  const col2X = W / 2 + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setC(doc, c.lightGray);
  doc.text("PREPARED FOR", col1X, y);
  doc.text("PREPARED BY", col2X, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setC(doc, c.headingColor);
  doc.text(meta.clientName, col1X, y);
  doc.text(meta.businessName, col2X, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setC(doc, c.bodyColor);

  const addrLines = doc.splitTextToSize(meta.serviceAddress, cw / 2 - 10);
  let clientY = y;
  for (const al of addrLines) { doc.text(al, col1X, clientY); clientY += 3; }
  if (meta.clientEmail) { doc.text(meta.clientEmail, col1X, clientY); clientY += 3; }

  let bizY = y;
  doc.text(meta.businessPhone, col2X, bizY); bizY += 3;
  doc.text(meta.businessEmail, col2X, bizY);

  y = Math.max(clientY, bizY) + 3;
  drawDivider(doc, y, mx, W, c.dividerColor);
  y += 4;

  // ═══ Shared section writer ═══
  const writeSection = (title: string, content: string, maxLines: number) => {
    if (!content?.trim()) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(t.sectionHeaderSize);
    setC(doc, c.accentColor);
    doc.text(title.toUpperCase(), mx, y);
    y += 1.2;
    if (t.underlineSectionHeaders) {
      setD(doc, c.accentColor);
      doc.setLineWidth(0.4);
      doc.line(mx, y, mx + doc.getTextWidth(title.toUpperCase()), y);
    }
    y += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(t.bodySize);
    setC(doc, c.bodyColor);
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
        y += t.bodyLineHeight;
        written++;
      }
    }
    y += 1.5;
  };

  // ═══ ZONE 3: SCOPE OF WORK ═══
  if (scopeSection) {
    writeSection(stripNumbering(scopeSection.title), scopeSection.content, 10);
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += 4;
  }

  // ═══ ZONE 4: INVESTMENT (always rendered — single canonical amount) ═══
  {
    // Canonical price from user input — single source of truth
    const canonicalPrice = meta.totalPrice?.trim();
    const displayAmount = canonicalPrice
      ? (canonicalPrice.startsWith("$") ? canonicalPrice : `$${canonicalPrice}`)
      : "Investment amount unavailable";
    const hasPrice = !!canonicalPrice;

    const investmentDetails = investmentSection
      ? getInvestmentDetails(investmentSection.content)
      : "";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const detailLines = investmentDetails
      ? doc.splitTextToSize(investmentDetails, cw - 10).slice(0, 4)
      : [];
    const detailH = detailLines.length * 3;
    const blockH = 8 + 8 + detailH + 4;

    setF(doc, c.investmentBg);
    setD(doc, c.investmentBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(mx, y - 1, cw, blockH, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(t.sectionHeaderSize);
    setC(doc, c.headingColor);
    doc.text("INVESTMENT", mx + 5, y + 5);
    y += 8;

    // Single canonical price — always rendered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(t.priceSize);
    setC(doc, hasPrice ? c.accentColor : [180, 50, 50]);
    doc.text(displayAmount, mx + 5, y + 5);
    y += 10;

    if (detailLines.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.bodySize);
      setC(doc, c.bodyColor);
      for (const line of detailLines) {
        doc.text(line, mx + 5, y);
        y += 3;
      }
    }

    y += 5;
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += 4;
  }

  // ═══ ZONE 5: DETAILS (Timeline, Terms — no duplicates) ═══
  const footerStart = H - 36;

  // Build ordered detail sections; only include unassigned extras
  const extraSections = sections.filter(s => !assignedSections.has(s.title) && s.content.trim());
  const detailSections = [timelineSection, termsSection, ...extraSections].filter(Boolean) as { title: string; content: string }[];

  const linesPerDetail = detailSections.length > 0
    ? Math.max(3, Math.floor((footerStart - y) / 3 / detailSections.length) - 3)
    : 5;

  for (const sec of detailSections) {
    if (y > footerStart - 8) break;
    const displayTitle = stripNumbering(sec.title);
    writeSection(displayTitle, sec.content, linesPerDetail);
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += 4;
  }

  // ═══ ZONE 6: FOOTER ═══
  y = footerStart;
  drawDivider(doc, y, mx, W, c.dividerColor);
  y += 4;

  if (meta.satisfactionGuarantee) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setC(doc, c.accentColor);
    doc.text("SATISFACTION GUARANTEE", mx, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, c.bodyColor);
    const gText = guaranteeSection?.content || "Your satisfaction is our top priority. We stand behind the quality of our work.";
    const gLines = doc.splitTextToSize(gText, cw);
    for (let i = 0; i < Math.min(gLines.length, 2); i++) { doc.text(gLines[i], mx, y); y += 2.8; }
    y += 2;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setC(doc, c.accentColor);
  doc.text("NEXT STEPS", mx, y);
  y += 3.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setC(doc, c.bodyColor);
  const nextStepsText = nextStepsSection?.content
    || `To accept this proposal, please contact us at ${meta.businessEmail} or ${meta.businessPhone}. We look forward to working with you.`;
  const nsLines = doc.splitTextToSize(nextStepsText, cw);
  for (let i = 0; i < Math.min(nsLines.length, 3); i++) { doc.text(nsLines[i], mx, y); y += 2.8; }

  const bottomY = H - 7;
  drawDivider(doc, bottomY - 3, mx, W, c.dividerColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setC(doc, c.lightGray);
  doc.text(meta.businessName, mx, bottomY);
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, W / 2, bottomY, { align: "center" });
  doc.text("Page 1", W - mx, bottomY, { align: "right" });

  doc.save("JetQuote-Proposal.pdf");
}
