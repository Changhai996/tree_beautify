export type PdfExportFixOptions = {
  labelParenthesisNbspCount?: number;
  rightTreeDxNudge?: number;
  onlyTanglegramLabels?: boolean;
};

export type LabelWithParen = {
  main: string;
  paren: string;
};

export const splitLabelWithParen = (rawText: string): LabelWithParen | null => {
  const text = rawText.trim();
  if (!text.includes("(") || !text.endsWith(")")) return null;
  const openIdx = text.lastIndexOf("(");
  if (openIdx <= 0) return null;
  const main = text.slice(0, openIdx).trim();
  const paren = text.slice(openIdx + 1, -1).trim();
  if (!main || !paren) return null;
  return { main, paren };
};

const parseNumberAttr = (value: string | null | undefined): number | null => {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const ensureGapBeforeParen = (
  main: string,
  paren: string,
  nbspCount: number,
): { main: string; parenText: string } => {
  const gap = "\u00A0".repeat(Math.max(1, nbspCount));
  return { main, parenText: `${gap}(${paren})` };
};

const replaceTextWithTspans = (
  svg: SVGSVGElement,
  textEl: SVGTextElement,
  main: string,
  parenText: string,
): void => {
  if (textEl.querySelector("tspan")) return;
  while (textEl.firstChild) textEl.removeChild(textEl.firstChild);

  const doc = svg.ownerDocument || document;
  const tspan1 = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
  tspan1.textContent = main;
  textEl.appendChild(tspan1);

  const tspan2 = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
  tspan2.textContent = parenText;
  textEl.appendChild(tspan2);
};

export const applyPdfExportFixesToSvg = (
  svg: SVGSVGElement,
  options: PdfExportFixOptions = {},
): void => {
  const nbspCount = options.labelParenthesisNbspCount ?? 2;
  const rightNudge = options.rightTreeDxNudge ?? 0;
  const onlyTg = options.onlyTanglegramLabels ?? false;

  svg.setAttribute("xml:space", "preserve");

  svg.querySelectorAll("text").forEach((node) => {
    const textEl = node as SVGTextElement;

    if (onlyTg) {
      const role = textEl.getAttribute("data-tg-role");
      if (role !== "label") return;
    }

    const raw = textEl.textContent ?? "";
    const parts = splitLabelWithParen(raw);
    if (parts) {
      const fixed = ensureGapBeforeParen(parts.main, parts.paren, nbspCount);
      replaceTextWithTspans(svg, textEl, fixed.main, fixed.parenText);
    }

    if (rightNudge !== 0) {
      const inRightTree =
        textEl.closest("#tg-tree-2") != null ||
        textEl.getAttribute("data-tg-tree") === "2";
      if (!inRightTree) return;

      const role = textEl.getAttribute("data-tg-role");
      if (role && role !== "label") return;

      const anchor = textEl.getAttribute("text-anchor") ?? "";
      const dxAttr = textEl.getAttribute("dx");
      const dx = parseNumberAttr(dxAttr) ?? 0;

      if (anchor === "end") {
        textEl.setAttribute("dx", String(dx - rightNudge));
      } else if (anchor === "start") {
        textEl.setAttribute("dx", String(dx + rightNudge));
      }
    }
  });
};

