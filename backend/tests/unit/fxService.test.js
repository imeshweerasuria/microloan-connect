const { convertAmount } = require("../../src/services/fxService");

describe("fxService - convertAmount", () => {
  test("should convert amount correctly", () => {
    expect(convertAmount(1000, 0.0033)).toBe(3.3);
  });

  test("should round to 2 decimal places", () => {
    expect(convertAmount(1234.56, 0.004567)).toBe(5.64);
  });

  test("should return 0 for zero amount", () => {
    expect(convertAmount(0, 10)).toBe(0);
  });

  test("should handle whole numbers", () => {
    expect(convertAmount(500, 2)).toBe(1000);
  });
});