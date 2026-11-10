import { describe, expect, it } from "vitest";
import { isCompleteUsPhone } from "@/lib/phone";

describe("isCompleteUsPhone", () => {
  it("accepts 10 digits, with or without a leading 1", () => {
    expect(isCompleteUsPhone("856-555-0147")).toBe(true);
    expect(isCompleteUsPhone("18565550147")).toBe(true);
  });
  it("rejects 9 digits", () => {
    expect(isCompleteUsPhone("856-555-014")).toBe(false);
  });
});
