import type { AutoMatchPair, TanglegramTargetKind } from "./types";

export type AutoMatchTargetLite = {
  key: string;
  name: string;
  kind: TanglegramTargetKind;
};

export type AutoMatchOptions = {
  ignoreParenSuffixForFoldedClade?: boolean;
};

const normalizeLeafName = (raw: string): string => raw.trim();

const normalizeFoldedCladeName = (raw: string, ignoreParenSuffix: boolean): string => {
  const text = raw.trim();
  if (!ignoreParenSuffix) return text;
  const idx = text.indexOf("(");
  return (idx >= 0 ? text.slice(0, idx) : text).trim();
};

const makeMatchKey = (
  kind: TanglegramTargetKind,
  name: string,
  options: Required<AutoMatchOptions>,
): string | null => {
  const normalized =
    kind === "leaf"
      ? normalizeLeafName(name)
      : normalizeFoldedCladeName(name, options.ignoreParenSuffixForFoldedClade);
  if (!normalized) return null;
  return `${kind}:${normalized}`;
};

export const autoMatchPairs = (
  left: AutoMatchTargetLite[],
  right: AutoMatchTargetLite[],
  options?: AutoMatchOptions,
): AutoMatchPair[] => {
  const opts: Required<AutoMatchOptions> = {
    ignoreParenSuffixForFoldedClade: options?.ignoreParenSuffixForFoldedClade ?? true,
  };

  const rightMap = new Map<string, AutoMatchTargetLite[]>();
  for (const r of right) {
    const key = makeMatchKey(r.kind, r.name, opts);
    if (!key) continue;
    const bucket = rightMap.get(key);
    if (bucket) bucket.push(r);
    else rightMap.set(key, [r]);
  }

  const usedRightKeys = new Set<string>();
  const result: AutoMatchPair[] = [];

  for (const l of left) {
    const mkey = makeMatchKey(l.kind, l.name, opts);
    if (!mkey) continue;
    const candidates = rightMap.get(mkey);
    if (!candidates || candidates.length === 0) continue;

    const candidate = candidates.find((c) => !usedRightKeys.has(c.key));
    if (!candidate) continue;

    usedRightKeys.add(candidate.key);
    result.push({ leftKey: l.key, rightKey: candidate.key });
  }

  return result;
};

