import { describe, expect, it } from "vitest";
import { isSafeHref, sanitizeLine } from "@/components/markdown-render";

describe("markdown render sanitization helpers", () => {
  it("rejects javascript links", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("https://example.com")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
  });

  it("removes script and iframe tags", () => {
    expect(sanitizeLine('<script>alert("x")</script>hello')).toBe("hello");
    expect(sanitizeLine('<iframe src="https://bad.example"></iframe>ok')).toBe("ok");
  });

  it("removes inline event handlers", () => {
    expect(sanitizeLine('<a href="https://safe.example" onclick="alert(1)">safe</a>')).toBe(
      '<a href="https://safe.example" >safe</a>',
    );
  });
});
