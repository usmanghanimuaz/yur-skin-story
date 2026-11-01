import { describe, it, expect } from "vitest";
import { googleMessage } from "@/components/app/auth-page";
describe("googleMessage", () => {
  it("explains a cancelled sign-in", () => expect(googleMessage("access_denied")).toMatch(/cancelled/));
  it("explains a closed popup", () => expect(googleMessage("Popup closed by user")).toMatch(/pop-ups/));
  it("falls back for unknown errors", () => expect(googleMessage(undefined)).toMatch(/try again/));
});
