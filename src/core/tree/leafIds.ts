export type TreeLeafIdSource = {
  name?: unknown;
  uniformNodeId?: unknown;
  id?: unknown;
  leafName?: unknown;
  children?: unknown;
};

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const pickLeafId = (nodeData: TreeLeafIdSource): string | null => {
  return (
    toNonEmptyString(nodeData.name) ??
    toNonEmptyString(nodeData.uniformNodeId) ??
    toNonEmptyString(nodeData.id) ??
    toNonEmptyString(nodeData.leafName)
  );
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toNode = (value: unknown): TreeLeafIdSource | null => {
  if (!isObject(value)) return null;
  return value as TreeLeafIdSource;
};

export const collectLeafIdsFromRawTree = (nodeData: unknown): string[] => {
  const output: string[] = [];

  const visit = (value: unknown) => {
    const node = toNode(value);
    if (!node) return;

    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach(visit);
      return;
    }

    const leafId = pickLeafId(node);
    if (leafId) output.push(leafId);
  };

  visit(nodeData);
  return output;
};

