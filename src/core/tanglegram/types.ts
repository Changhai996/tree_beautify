export type TanglegramTargetKind = "leaf" | "folded-clade";

export type TanglegramTarget = {
  treeNum: 1 | 2;
  kind: TanglegramTargetKind;
  key: string;
  name: string;
  nodeId: string;
};

export type ConnectionStyle = {
  color: string;
  width: number;
  opacity: number;
};

export type TanglegramConnection = {
  left: TanglegramTarget;
  right: TanglegramTarget;
  style: ConnectionStyle;
};

export type AutoMatchPair = {
  leftKey: string;
  rightKey: string;
};

