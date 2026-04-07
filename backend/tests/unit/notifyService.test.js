const { normalizeSriLankanPhone } = require("../../src/services/notifyService");

describe("notifyService - normalizeSriLankanPhone", () => {
  test("should normalize 0771234567 to 94771234567", () => {
    expect(normalizeSriLankanPhone("0771234567")).toBe("94771234567");
  });

  test("should normalize 771234567 to 94771234567", () => {
    expect(normalizeSriLankanPhone("771234567")).toBe("94771234567");
  });

  test("should keep 94771234567 unchanged", () => {
    expect(normalizeSriLankanPhone("94771234567")).toBe("94771234567");
  });

  test("should remove non-digit characters", () => {
    expect(normalizeSriLankanPhone("077-123-4567")).toBe("94771234567");
  });

  test("should return null for invalid number", () => {
    expect(normalizeSriLankanPhone("123")).toBe(null);
  });
});