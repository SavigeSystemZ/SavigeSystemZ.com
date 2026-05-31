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

  it("rejects non-http(s) hrefs", () => {
    expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("file:///etc/passwd")).toBe(false);
    expect(isSafeHref("ftp://example.com/x")).toBe(false);
    expect(isSafeHref("mailto:a@b.c")).toBe(false);
    expect(isSafeHref("//example.com")).toBe(false);
    expect(isSafeHref("/relative")).toBe(false);
    expect(isSafeHref("")).toBe(false);
  });

  it("strips mixed-case script tags and multiline payloads", () => {
    expect(sanitizeLine('before<ScRiPt>alert(1)</ScRiPt>after')).toBe("beforeafter");
    expect(sanitizeLine('a<script\n>x</script\n>b')).toBe("ab");
  });

  it("strips event handlers with single quotes and unusual whitespace", () => {
    expect(sanitizeLine("<div ONLOAD = 'do()' >x</div>")).toBe("<div  >x</div>");
    expect(sanitizeLine('<img src="ok" onerror="boom()">')).toBe('<img src="ok" >');
  });

  it("does not mistake plain text for tags", () => {
    expect(sanitizeLine("a < b && c > d")).toBe("a < b && c > d");
    expect(sanitizeLine("function on(x) { return x; }")).toBe("function on(x) { return x; }");
  });
});
