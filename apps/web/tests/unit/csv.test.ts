import { describe, expect, it } from "vitest";
import { escapeCsvField, toCsvRow } from "@/lib/csv";

describe("escapeCsvField", () => {
  it("leaves simple text unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("quotes and escapes special characters", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvField("a,b")).toBe('"a,b"');
    expect(escapeCsvField("line\nbreak")).toBe('"line\nbreak"');
  });
});

describe("toCsvRow", () => {
  it("joins cells with CRLF terminator", () => {
    expect(toCsvRow(["a", "b"])).toBe("a,b\r\n");
  });
});
