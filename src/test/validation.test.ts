import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror of the production quote schema from src/routes/quote.tsx
const quoteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "Name must be under 100 characters."),
  business: z
    .string()
    .trim()
    .max(100, "Business name must be under 100 characters.")
    .optional()
    .default(""),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30, "Phone number must be under 30 characters.")
    .regex(/^[\d\s()+-]{7,30}$/, "Please enter a valid phone format."),
  quantity: z
    .string()
    .trim()
    .max(20, "Quantity must be under 20 characters.")
    .optional()
    .default(""),
  product: z.string().trim().min(1, "Please select a product."),
  details: z
    .string()
    .trim()
    .max(1000, "Details must be under 1000 characters.")
    .optional()
    .default(""),
  hp_website: z.string().max(0, "Bot submission blocked."),
});

describe("Form Validation & Data Integrity", () => {
  it("accepts valid quote submissions with minimal required fields", () => {
    const valid = {
      name: "Ahmed Khan",
      phone: "03399091707",
      product: "custom-corrugated-boxes",
      hp_website: "",
    };

    const result = quoteSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ahmed Khan");
      expect(result.data.business).toBe("");
      expect(result.data.quantity).toBe("");
    }
  });

  it("accepts full quote submissions with international phone formats", () => {
    const valid = {
      name: "Fatima Packaging Ltd",
      business: "Organic Eats",
      phone: "+92 (339) 909-1707",
      quantity: "5000 units",
      product: "printed-kraft-pouches",
      details: "Matte finish with front transparent window.",
      hp_website: "",
    };

    const result = quoteSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const invalid = {
      name: "   ",
      phone: "03399091707",
      product: "mailer-boxes",
      hp_website: "",
    };

    const result = quoteSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe("Please enter your name.");
    }
  });

  it("rejects invalid phone numbers", () => {
    const invalidPhones = ["123", "abc1234567", "call-me-now", "!!@@##$$%%"];

    for (const phone of invalidPhones) {
      const result = quoteSchema.safeParse({
        name: "Test User",
        phone,
        product: "custom-corrugated-boxes",
        hp_website: "",
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects bot honeypot submissions (hp_website filled)", () => {
    const botSubmission = {
      name: "Spam Bot",
      phone: "03399091707",
      product: "mailer-boxes",
      hp_website: "https://spam-link.ru",
    };

    const result = quoteSchema.safeParse(botSubmission);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe("Bot submission blocked.");
    }
  });

  it("rejects missing product selection", () => {
    const missingProduct = {
      name: "User Without Product",
      phone: "03399091707",
      product: "",
      hp_website: "",
    };

    const result = quoteSchema.safeParse(missingProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe("Please select a product.");
    }
  });

  it("rejects excessively long details (>1000 characters)", () => {
    const tooLong = {
      name: "User Long Text",
      phone: "03399091707",
      product: "mailer-boxes",
      details: "a".repeat(1001),
      hp_website: "",
    };

    const result = quoteSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe("Details must be under 1000 characters.");
    }
  });
});
