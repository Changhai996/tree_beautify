import { describe, expect, it } from "vitest";

import { collectLeafIdsFromRawTree } from "../leafIds";
import { TreeParser } from "../parserFacade";
import { splitLabelWithParen } from "../../export/pdfFixes";

describe("collectLeafIdsFromRawTree", () => {
  it("collects leaf ids from a nested tree", () => {
    const tree = {
      nodeIndex: "N0",
      children: [
        { name: "A" },
        { uniformNodeId: "B" },
        {
          children: [
            { id: "C" },
            { leafName: "D" },
          ],
        },
      ],
    };

    expect(collectLeafIdsFromRawTree(tree)).toEqual(["A", "B", "C", "D"]);
  });

  it("returns empty list for invalid inputs", () => {
    expect(collectLeafIdsFromRawTree(null)).toEqual([]);
    expect(collectLeafIdsFromRawTree(undefined)).toEqual([]);
    expect(collectLeafIdsFromRawTree(123)).toEqual([]);
  });
});

describe("TreeParser facade", () => {
  it("parses simple newick via legacy parser", () => {
    const parser = new TreeParser();
    const root = parser.identifyTreeFile("(A:1,B:2);");
    expect(root.children.length).toBe(2);
    expect(root.children.map((c) => c.name)).toEqual(["A", "B"]);
  });
});

describe("splitLabelWithParen", () => {
  it("splits label and parentheses payload", () => {
    expect(splitLabelWithParen("ABC (12)")).toEqual({ main: "ABC", paren: "12" });
    expect(splitLabelWithParen("ABC(12)")).toEqual({ main: "ABC", paren: "12" });
    expect(splitLabelWithParen("ABC   ( 12 )")).toEqual({ main: "ABC", paren: "12" });
  });

  it("returns null when no valid paren payload", () => {
    expect(splitLabelWithParen("ABC")).toBe(null);
    expect(splitLabelWithParen("(12)")).toBe(null);
    expect(splitLabelWithParen("ABC ()")).toBe(null);
  });
});
