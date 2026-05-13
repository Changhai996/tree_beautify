import { describe, expect, it } from "vitest";

import { autoMatchPairs } from "../autoMatch";

describe("autoMatchPairs", () => {
  it("matches leaves by exact name", () => {
    const pairs = autoMatchPairs(
      [
        { key: "L1", kind: "leaf", name: "A" },
        { key: "L2", kind: "leaf", name: "B" },
      ],
      [
        { key: "R1", kind: "leaf", name: "B" },
        { key: "R2", kind: "leaf", name: "A" },
      ],
    );
    expect(pairs).toEqual([
      { leftKey: "L1", rightKey: "R2" },
      { leftKey: "L2", rightKey: "R1" },
    ]);
  });

  it("does not create matches when names differ", () => {
    const pairs = autoMatchPairs(
      [{ key: "L1", kind: "leaf", name: "A" }],
      [{ key: "R1", kind: "leaf", name: "C" }],
    );
    expect(pairs).toEqual([]);
  });

  it("matches folded clade names ignoring parentheses by default", () => {
    const pairs = autoMatchPairs(
      [{ key: "L1", kind: "folded-clade", name: "CladeX (12)" }],
      [{ key: "R1", kind: "folded-clade", name: "CladeX (5)" }],
    );
    expect(pairs).toEqual([{ leftKey: "L1", rightKey: "R1" }]);
  });
});

