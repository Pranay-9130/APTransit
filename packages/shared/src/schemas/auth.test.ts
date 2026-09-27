import { describe, expect, it } from "vitest";
import {
  maskEmail,
  maskPhone,
  OtpRequestInput,
  OtpVerifyInput,
  UpdateMeInput,
} from "./auth";

describe("auth schemas and helpers", () => {
  it("masks phone numbers correctly", () => {
    expect(maskPhone("+919876543210")).toBe("+91******3210");
    expect(maskPhone("+911234567890")).toBe("+91******7890");
    expect(maskPhone("123")).toBe("123");
  });

  it("masks email addresses correctly", () => {
    expect(maskEmail("citizen@aptransit.test")).toBe("c***@aptransit.test");
    expect(maskEmail("a@b.com")).toBe("a@b.com");
  });

  it("validates OtpRequestInput for phone and email", () => {
    const validPhone = OtpRequestInput.safeParse({
      channel: "PHONE",
      target: "+919876543210",
    });
    expect(validPhone.success).toBe(true);

    const invalidPhone = OtpRequestInput.safeParse({
      channel: "PHONE",
      target: "9876543210",
    });
    expect(invalidPhone.success).toBe(false);

    const validEmail = OtpRequestInput.safeParse({
      channel: "EMAIL",
      target: "user@example.com",
    });
    expect(validEmail.success).toBe(true);

    const invalidEmail = OtpRequestInput.safeParse({
      channel: "EMAIL",
      target: "not-an-email",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates OtpVerifyInput code format", () => {
    const valid = OtpVerifyInput.safeParse({
      channel: "PHONE",
      target: "+919876543210",
      code: "123456",
    });
    expect(valid.success).toBe(true);

    const invalidCode = OtpVerifyInput.safeParse({
      channel: "PHONE",
      target: "+919876543210",
      code: "12345",
    });
    expect(invalidCode.success).toBe(false);
  });

  it("validates UpdateMeInput", () => {
    const valid = UpdateMeInput.safeParse({
      name: "Ravi Kumar",
      preferredLocale: "te",
    });
    expect(valid.success).toBe(true);

    const invalidLocale = UpdateMeInput.safeParse({
      preferredLocale: "fr",
    });
    expect(invalidLocale.success).toBe(false);
  });
});
