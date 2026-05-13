export type TreeNodeIndex = `N${number}` | string;

export type TreeNode = {
  name: string;
  length: number;
  children: TreeNode[];
  nodeIndex: TreeNodeIndex;
  uniformNodeId: string;
  parent?: TreeNode;
  btArr?: number[];
  hasInternalNodeID?: boolean;
  internalNodeID?: string;
  otherProperty_L?: Record<string, unknown>;
  isDivergenceTimeTree?: boolean;
};

export type TreeParseInput = string | unknown;

