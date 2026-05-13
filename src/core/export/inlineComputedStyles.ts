export type InlineComputedStylesOptions = {
  includeDisplayVisibility?: boolean;
  includeSvgNamespace?: boolean;
  preserveXmlSpace?: boolean;
};

const DEFAULT_SVG_NS = "http://www.w3.org/2000/svg";

type GetComputedStyleFn = (el: Element) => CSSStyleDeclaration;

export const cloneSvgWithComputedStyles = (
  svgElement: SVGSVGElement,
  options: InlineComputedStylesOptions = {},
  getComputedStyleFn?: GetComputedStyleFn,
): SVGSVGElement => {
  const exportSvg = svgElement.cloneNode(true) as SVGSVGElement;

  const includeNs = options.includeSvgNamespace ?? true;
  if (includeNs && !exportSvg.getAttribute("xmlns")) exportSvg.setAttribute("xmlns", DEFAULT_SVG_NS);

  const preserve = options.preserveXmlSpace ?? true;
  if (preserve) exportSvg.setAttribute("xml:space", "preserve");

  const originalNodes = Array.from(svgElement.querySelectorAll("*"));
  const cloneNodes = Array.from(exportSvg.querySelectorAll("*"));
  const styleGetter: GetComputedStyleFn =
    getComputedStyleFn ??
    ((el) => {
      const fn = (globalThis as unknown as { getComputedStyle?: GetComputedStyleFn }).getComputedStyle;
      if (!fn) throw new Error("getComputedStyle is not available");
      return fn(el);
    });

  for (let i = 0; i < originalNodes.length && i < cloneNodes.length; i++) {
    const orig = originalNodes[i];
    const clone = cloneNodes[i];
    if (!orig || !clone) continue;
    const cs = styleGetter(orig);
    if (!cs) continue;

    const tag = orig.tagName.toLowerCase();
    if (tag === "text" || tag === "tspan") {
      if (!clone.getAttribute("font-family")) clone.setAttribute("font-family", cs.fontFamily);
      if (!clone.getAttribute("font-size")) clone.setAttribute("font-size", cs.fontSize);
      if (!clone.getAttribute("font-weight")) clone.setAttribute("font-weight", cs.fontWeight);
      if (!clone.getAttribute("font-style")) clone.setAttribute("font-style", cs.fontStyle);
      if (!clone.getAttribute("fill")) clone.setAttribute("fill", cs.fill);
      if (!clone.getAttribute("text-anchor"))
        clone.setAttribute("text-anchor", cs.textAnchor || orig.getAttribute("text-anchor") || "");
    } else if (
      tag === "path" ||
      tag === "line" ||
      tag === "rect" ||
      tag === "circle" ||
      tag === "polygon" ||
      tag === "polyline"
    ) {
      if (!clone.getAttribute("fill")) clone.setAttribute("fill", cs.fill);
      if (!clone.getAttribute("stroke")) clone.setAttribute("stroke", cs.stroke);
      if (!clone.getAttribute("stroke-width")) clone.setAttribute("stroke-width", cs.strokeWidth);
      if (!clone.getAttribute("stroke-dasharray") && cs.strokeDasharray !== "none")
        clone.setAttribute("stroke-dasharray", cs.strokeDasharray);
    }

    if (!clone.getAttribute("opacity") && cs.opacity !== "1") clone.setAttribute("opacity", cs.opacity);

    if (options.includeDisplayVisibility) {
      if (!clone.getAttribute("display") && cs.display === "none") clone.setAttribute("display", cs.display);
      if (!clone.getAttribute("visibility") && cs.visibility === "hidden")
        clone.setAttribute("visibility", cs.visibility);
    }
  }

  return exportSvg;
};
