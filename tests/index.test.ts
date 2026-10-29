import { describe, expect, it } from "vitest";

import { PROJECT_NAME } from "../src/index.js";

describe("project setup", () => {
  it("loads the TypeScript module", () => {
    expect(PROJECT_NAME).toBe("asin-tma-dep-2026");
  });
});
