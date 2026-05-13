import type { TreeNode, TreeParseInput } from "./types";

import { TreeParser as LegacyTreeParser } from "../../js/treeParser";

const isTreeNodeLike = (value: unknown): value is TreeNode => {
  if (typeof value !== "object" || value === null) return false;
  const node = value as Record<string, unknown>;
  return (
    typeof node.name === "string" &&
    typeof node.length === "number" &&
    typeof node.nodeIndex === "string" &&
    typeof node.uniformNodeId === "string" &&
    Array.isArray(node.children)
  );
};

export class TreeParser {
  private readonly legacy = new LegacyTreeParser();

  identifyTreeFile(input: TreeParseInput): TreeNode {
    const root = this.legacy.identifyTreeFile(input);
    if (!isTreeNodeLike(root)) {
      throw new Error("TreeParser: invalid parsed tree shape");
    }
    return root;
  }
}

