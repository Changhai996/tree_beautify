import type { TreeNode } from "./types";

export const traversePreorder = (
  root: TreeNode,
  visitor: (node: TreeNode) => void,
): void => {
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    visitor(node);
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      if (child) stack.push(child);
    }
  }
};

export const findNodeByIndex = (
  root: TreeNode,
  nodeIndex: string,
): TreeNode | null => {
  let found: TreeNode | null = null;
  traversePreorder(root, (node) => {
    if (found) return;
    if (node.nodeIndex === nodeIndex) found = node;
  });
  return found;
};
