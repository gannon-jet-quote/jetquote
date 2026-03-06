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

/** Keywords that map parsed sections to fixed layout slots */
const SECTION_KEYWORDS: Record<string, string[]> = {
  scope: ["scope", "work", "service", "description"],
  timeline: ["timeline", "schedule", "completion"],
  investment: ["investment", "pricing", "cost", "price", "estimate", "quote"],
  terms: ["terms", "condition", "payment"],
  guarantee: ["guarantee", "warranty", "satisfaction"],
  nextSteps: ["next", "step", "accept", "proceed", "signature"],
};

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

/**
 * Sanitize body content: strip ALL CAPS inline header lines (e.g. "SERVICE DELIVERY: OUR TEAM…"),
 * remove markdown bold/italic, and normalize whitespace.
 */
function sanitizeBodyContent(content: string): string {
  return content
    .split("\n")
    .map(line => {
      // Strip lines that are entirely uppercase (inline accent headers)
      // e.g. "SERVICE DELIVERY: OUR TEAM WILL ARRIVE ON SCHEDULED DATE"
      const stripped = line.replace(/[^A-Za-z]/g, "");
      if (stripped.length > 8 && stripped === stripped.toUpperCase()) {
        // Convert to sentence case instead of removing
        const lower = line.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return line;
    })
    .map(line => line.replace(/\*\*/g, "").replace(/\*/g, ""))
    .filter(line => line.trim().length > 0)
    .join("\n");
}

function setC(doc: jsPDF, c: [number, number, number]) { doc.setTextColor(c[0], c[1], c[2]); }
function setF(doc: jsPDF, c: [number, number, number]) { doc.setFillColor(c[0], c[1], c[2]); }
function setD(doc: jsPDF, c: [number, number, number]) { doc.setDrawColor(c[0], c[1], c[2]); }

function drawDivider(doc: jsPDF, y: number, mx: number, W: number, color: [number, number, number]) {
  setD(doc, color);
  doc.setLineWidth(0.25);
  doc.line(mx, y, W - mx, y);
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

/**
 * Assign parsed sections to fixed layout slots. Unassigned content merges into Scope of Work.
 */
function assignSections(sections: { title: string; content: string }[]) {
  const findSection = (keywords: string[]) =>
    sections.find(s => keywords.some(k => s.title.toLowerCase().includes(k)));

  const scope = findSection(SECTION_KEYWORDS.scope);
  const timeline = findSection(SECTION_KEYWORDS.timeline);
  const investment = findSection(SECTION_KEYWORDS.investment);
  const terms = findSection(SECTION_KEYWORDS.terms);
  const guarantee = findSection(SECTION_KEYWORDS.guarantee);
  const nextSteps = findSection(SECTION_KEYWORDS.nextSteps);

  const assigned = new Set(
    [scope, timeline, investment, terms, guarantee, nextSteps]
      .filter(Boolean).map(s => s!.title)
  );

  // Merge any unassigned sections into scope content
  const extraContent = sections
    .filter(s => !assigned.has(s.title) && s.content.trim())
    .map(s => s.content)
    .join("\n");

  const mergedScopeContent = [scope?.content, extraContent].filter(Boolean).join("\n");

  return {
    scope: scope ? { title: scope.title, content: mergedScopeContent } : (extraContent ? { title: "Scope of Work", content: extraContent } : null),
    timeline,
    investment,
    terms,
    guarantee,
    nextSteps,
  };
}

// ── Base Template ──

function buildStyledDoc(proposal: string, meta: ProposalMeta): jsPDF {
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

  // ── Parse and assign sections to fixed slots ──
  const sections = parseProposalSections(proposal);
  const slots = assignSections(sections);

  // ── Consistent spacing constants ──
  const SECTION_GAP = 4;      // gap after divider before next section
  const DIVIDER_GAP = 1.5;    // gap after content before divider
  const FOOTER_HEIGHT = 36;   // reserved footer area
  const footerStart = H - FOOTER_HEIGHT;

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
      logoW = logoH * 2.5;
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

  // Header contact block removed — info is in "Prepared By" section below

  y = c.headerBg ? headerH + 4 : 27;
  drawDivider(doc, y, mx, W, c.dividerColor);
  y += SECTION_GAP;

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
  y += SECTION_GAP;

  // ── Calculate available space for content zones ──
  // We need to fit: Scope, Investment, Timeline, Terms, (Guarantee), Next Steps, Footer
  // Calculate how much space each section can use adaptively.
  const contentEnd = footerStart;
  const availableSpace = contentEnd - y;

  // Count sections that will be rendered
  const hasScope = !!slots.scope;
  const hasTimeline = !!(slots.timeline?.content?.trim());
  const hasTerms = !!(slots.terms?.content?.trim());
  const hasGuarantee = meta.satisfactionGuarantee;
  const investmentBlockH = 28; // fixed height for investment box
  const footerContentH = (hasGuarantee ? 12 : 0) + 12; // guarantee + next steps in footer

  // Space for variable sections (scope, timeline, terms)
  const fixedSpaceUsed = investmentBlockH + footerContentH + SECTION_GAP * 4;
  const variableSpace = availableSpace - fixedSpaceUsed;
  const variableSectionCount = [hasScope, hasTimeline, hasTerms].filter(Boolean).length;

  // Adaptive line budget per variable section
  const baseMaxLines = variableSectionCount > 0
    ? Math.max(3, Math.floor(variableSpace / t.bodyLineHeight / variableSectionCount) - 2)
    : 8;

  // If content is very dense, reduce font slightly
  let bodySize = t.bodySize;
  let bodyLineHeight = t.bodyLineHeight;
  if (baseMaxLines < 4 && variableSectionCount > 1) {
    bodySize = Math.max(7.5, t.bodySize - 0.5);
    bodyLineHeight = Math.max(3.0, t.bodyLineHeight - 0.3);
  }

  // ═══ Shared section writer (with content sanitization) ═══
  const writeSection = (title: string, rawContent: string, maxLines: number) => {
    const content = sanitizeBodyContent(rawContent);
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
    doc.setFontSize(bodySize);
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
        // Prevent overflow beyond content area
        if (y > contentEnd - 4) break;
        doc.text(wl, mx + (isBullet ? 2 : 0), y);
        y += bodyLineHeight;
        written++;
      }
    }
    y += DIVIDER_GAP;
  };

  // ═══ ZONE 3: SCOPE OF WORK ═══
  if (slots.scope) {
    // Scope gets the largest share of lines
    const scopeMaxLines = Math.max(6, Math.min(baseMaxLines + 2, 14));
    writeSection(stripNumbering(slots.scope.title), slots.scope.content, scopeMaxLines);
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += SECTION_GAP;
  }

  // ═══ ZONE 4: INVESTMENT ═══
  {
    const canonicalPrice = meta.totalPrice?.trim();
    const displayAmount = canonicalPrice
      ? (canonicalPrice.startsWith("$") ? canonicalPrice : `$${canonicalPrice}`)
      : "Investment amount unavailable";
    const hasPrice = !!canonicalPrice;

    const investmentDetails = slots.investment
      ? getInvestmentDetails(slots.investment.content)
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

    doc.setFont("helvetica", "bold");
    doc.setFontSize(t.priceSize);
    setC(doc, hasPrice ? c.accentColor : [180, 50, 50]);
    doc.text(displayAmount, mx + 5, y + 5);
    y += 10;

    if (detailLines.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodySize);
      setC(doc, c.bodyColor);
      for (const line of detailLines) {
        doc.text(line, mx + 5, y);
        y += 3;
      }
    }

    y += 5;
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += SECTION_GAP;
  }

  // ═══ ZONE 5: TIMELINE ═══
  if (hasTimeline && slots.timeline) {
    const timelineMax = Math.min(baseMaxLines, 6);
    writeSection(stripNumbering(slots.timeline.title), slots.timeline.content, timelineMax);
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += SECTION_GAP;
  }

  // ═══ ZONE 6: TERMS ═══
  if (hasTerms && slots.terms) {
    const termsMax = Math.min(baseMaxLines, 6);
    writeSection(stripNumbering(slots.terms.title), slots.terms.content, termsMax);
    drawDivider(doc, y, mx, W, c.dividerColor);
    y += SECTION_GAP;
  }

  // ═══ ZONE 7: FOOTER (Guarantee + Next Steps + Bottom Bar) ═══
  // Jump to footer start to ensure consistent placement
  y = Math.max(y, footerStart);
  drawDivider(doc, y, mx, W, c.dividerColor);
  y += SECTION_GAP;

  if (meta.satisfactionGuarantee) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setC(doc, c.accentColor);
    doc.text("SATISFACTION GUARANTEE", mx, y);
    y += 3.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setC(doc, c.bodyColor);
    const gText = slots.guarantee?.content || "Your satisfaction is our top priority. We stand behind the quality of our work.";
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
  const nextStepsText = slots.nextSteps?.content
    || `To accept this proposal, please contact us at ${meta.businessEmail} or ${meta.businessPhone}. We look forward to working with you.`;
  const nsLines = doc.splitTextToSize(nextStepsText, cw);
  for (let i = 0; i < Math.min(nsLines.length, 3); i++) { doc.text(nsLines[i], mx, y); y += 2.8; }

  // ═══ Bottom bar ═══
  const bottomY = H - 7;
  drawDivider(doc, bottomY - 3, mx, W, c.dividerColor);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  setC(doc, c.lightGray);
  doc.text(meta.businessName, mx, bottomY);
  doc.text(`${meta.businessPhone}  |  ${meta.businessEmail}`, W / 2, bottomY, { align: "center" });
  doc.text("Page 1", W - mx, bottomY, { align: "right" });

  return doc;
}

export function generateStyledPDF(proposal: string, meta: ProposalMeta): void {
  const doc = buildStyledDoc(proposal, meta);
  const fileDate = new Date().toISOString().slice(0, 10);
  const sanitized = meta.clientName
    ?.trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const prefix = sanitized || "JetQuote-Proposal";
  doc.save(`${prefix}-${fileDate}.pdf`);
}

export function generatePDFBase64(proposal: string, meta: ProposalMeta): string {
  const doc = buildStyledDoc(proposal, meta);
  return doc.output("datauristring").split(",")[1];
}
