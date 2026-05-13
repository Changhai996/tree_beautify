export type TanglegramTreeMetrics = {
  width: number;
  height: number;
};

export type TanglegramLayoutState = {
  rightX: number;
  rightY: number;
};

export type TanglegramPadding = {
  x: number;
  y: number;
};

export type TanglegramCombinedLayout = {
  totalWidth: number;
  totalHeight: number;
  viewBox: string;
  positions: Record<1 | 2, { x: number; y: number }>;
  title: Record<1 | 2, { x: number; y: number; anchor: "start" | "end" }>;
  subtitle: Record<1 | 2, { x: number; y: number; anchor: "start" | "end" }>;
  transforms: Record<1 | 2, string>;
};

export const computeTanglegramCombinedLayout = (args: {
  left: TanglegramTreeMetrics;
  right: TanglegramTreeMetrics;
  layout: TanglegramLayoutState;
  padding?: TanglegramPadding;
  baseGap?: number;
  titleOffsetY?: number;
  subtitleOffsetY?: number;
}): TanglegramCombinedLayout => {
  const padding = args.padding ?? { x: 40, y: 58 };
  const baseGap = args.baseGap ?? 20;
  const titleOffsetY = args.titleOffsetY ?? 30;
  const subtitleOffsetY = args.subtitleOffsetY ?? 16;

  const minYOffset = Math.min(0, args.layout.rightY);
  const maxYOffset = Math.max(0, args.layout.rightY);
  const leftTreeX = padding.x;
  const rightTreeX = padding.x + args.left.width + baseGap + args.layout.rightX;
  const viewportMinY = minYOffset - titleOffsetY;

  const totalWidth = Math.max(padding.x * 2 + args.left.width, rightTreeX + args.right.width + padding.x);
  const totalHeight =
    padding.y * 2 + Math.max(args.left.height, args.right.height) + Math.abs(minYOffset) + maxYOffset;

  const positions: Record<1 | 2, { x: number; y: number }> = {
    1: { x: leftTreeX, y: padding.y },
    2: { x: rightTreeX, y: padding.y + args.layout.rightY },
  };

  const title: Record<1 | 2, { x: number; y: number; anchor: "start" | "end" }> = {
    1: { x: positions[1].x, y: positions[1].y - titleOffsetY, anchor: "start" },
    2: { x: positions[2].x + args.right.width, y: positions[2].y - titleOffsetY, anchor: "end" },
  };

  const subtitle: Record<1 | 2, { x: number; y: number; anchor: "start" | "end" }> = {
    1: { x: title[1].x, y: title[1].y + subtitleOffsetY, anchor: title[1].anchor },
    2: { x: title[2].x, y: title[2].y + subtitleOffsetY, anchor: title[2].anchor },
  };

  const transforms: Record<1 | 2, string> = {
    1: `translate(${positions[1].x},${positions[1].y})`,
    2: `translate(${positions[2].x + args.right.width},${positions[2].y}) scale(-1,1)`,
  };

  return {
    totalWidth,
    totalHeight,
    viewBox: `0 ${viewportMinY} ${totalWidth} ${totalHeight}`,
    positions,
    title,
    subtitle,
    transforms,
  };
};
