import { describe, it, expect } from "vitest";
import { evaluateExpression } from "./math-parser";

describe("math-parser", () => {
  describe("basic arithmetic", () => {
    it("should add numbers", () => {
      expect(evaluateExpression("2+2")).toBe(4);
      expect(evaluateExpression("10 + 20")).toBe(30);
    });

    it("should subtract numbers", () => {
      expect(evaluateExpression("10-2")).toBe(8);
      expect(evaluateExpression("5 - 10")).toBe(-5);
    });

    it("should multiply numbers", () => {
      expect(evaluateExpression("3*4")).toBe(12);
      expect(evaluateExpression("2 * 5")).toBe(10);
    });

    it("should divide numbers", () => {
      expect(evaluateExpression("10/2")).toBe(5);
      expect(evaluateExpression("12 / 4")).toBe(3);
    });
  });

  describe("decimals", () => {
    it("should handle decimals", () => {
      expect(evaluateExpression("2.5 + 2.5")).toBe(5);
      expect(evaluateExpression("10.5 * 2")).toBe(21);
      // Floating point precision check
      expect(evaluateExpression("0.1 + 0.2")).toBeCloseTo(0.3);
    });
  });

  describe("precedence", () => {
    it("should respect order of operations", () => {
      expect(evaluateExpression("2 + 3 * 4")).toBe(14);
      expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
      expect(evaluateExpression("10 - 2 * 3")).toBe(4);
      expect(evaluateExpression("10 * 2 / 5")).toBe(4);
    });
  });

  describe("advanced operators", () => {
    it("should handle exponentiation", () => {
      expect(evaluateExpression("2^3")).toBe(8);
      expect(evaluateExpression("4 ^ 0.5")).toBe(2);
      // Right associativity check: 2^3^2 = 2^(3^2) = 2^9 = 512
      expect(evaluateExpression("2^3^2")).toBe(512);
    });

    it("should handle modulo", () => {
      expect(evaluateExpression("10 % 3")).toBe(1);
      expect(evaluateExpression("10.5 % 3")).toBe(1.5);
    });
  });

  describe("unary operators", () => {
    it("should handle negative numbers", () => {
      expect(evaluateExpression("-5")).toBe(-5);
      expect(evaluateExpression("2 + -3")).toBe(-1);
      expect(evaluateExpression("-(2+2)")).toBe(-4);
    });

    it("should handle double negatives", () => {
        expect(evaluateExpression("--5")).toBe(5);
    });
  });

  describe("formatting", () => {
    it("should ignore whitespace", () => {
      expect(evaluateExpression("  2   +   2  ")).toBe(4);
    });
  });

  describe("errors", () => {
    it("should throw on invalid syntax", () => {
      expect(() => evaluateExpression("2 +")).toThrow();
      expect(() => evaluateExpression("2 * * 3")).toThrow();
      expect(() => evaluateExpression("(2 + 3")).toThrow();
      expect(() => evaluateExpression("2 + 3)")).toThrow();
      expect(() => evaluateExpression("foo")).toThrow();
    });

    it("should throw on division by zero", () => {
      expect(() => evaluateExpression("2 / 0")).toThrow("Division by zero");
    });
  });
});
