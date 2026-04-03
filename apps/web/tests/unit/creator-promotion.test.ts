import { describe, expect, it } from "vitest";
import {
  getArchiveCategoryForSubmissionType,
  getPromotionTargetForSubmissionType,
  slugifyPromotionTitle,
} from "@/lib/creator-promotion";

describe("creator promotion helpers", () => {
  it("slugifies titles into stable admin draft slugs", () => {
    expect(slugifyPromotionTitle(" Signal OS Build Kit ")).toBe("signal-os-build-kit");
    expect(slugifyPromotionTitle("Prompt Weight Lab!!!")).toBe("prompt-weight-lab");
    expect(slugifyPromotionTitle("")).toBe("submission-draft");
  });

  it("routes application submissions into the application target", () => {
    expect(getPromotionTargetForSubmissionType("APPLICATION")).toBe("APPLICATION");
  });

  it("maps non-application submissions into archive categories", () => {
    expect(getPromotionTargetForSubmissionType("CONFIG_PACK")).toBe("ARCHIVE_ENTRY");
    expect(getArchiveCategoryForSubmissionType("CONFIG_PACK")).toBe("CONFIGURATION");
    expect(getArchiveCategoryForSubmissionType("MODEL")).toBe("MODEL");
    expect(getArchiveCategoryForSubmissionType("SECURITY_TOOL")).toBe("SECURITY_TOOL");
  });
});
