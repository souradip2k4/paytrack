import { parse } from "date-fns";
import { describe, expect, it } from "vitest";
import { fzDatetime } from "../index";

describe("fzDatetime", () => {
	const today = new Date();

	const expectedDate = parse("2023-10-26", "yyyy-MM-dd", new Date());
	it.each([
		{ input: "2023-10-26", description: "should handle yyyy-MM-dd" },
		{ input: "2023/10/26", description: "should handle yyyy/MM/dd" },
		{ input: "2023.10.26", description: "should handle yyyy.MM.dd" },
		{
			input: "  2023  10 26 ",
			description: "should ignore unnecessary spaces",
		},
	])("$description", ({ input }) => {
		expect(fzDatetime(input)).toEqual(expectedDate);
	});

	describe("partial dates", () => {
		it("should handle yy", () => {});
		it("should handle yy-MM", () => {});
		it("should handle yy-MM-dd", () => {});
		it("should handle yy-MM-dd HH", () => {});
		it("should handle yy-MM-dd HH:mm", () => {});
		it("should handle yy-MM-dd HH:mm:ss", () => {});
		it("should handle yy-MM-dd HH:mm:ss.SSS", () => {});

		it("should handle yyyy");
		it("should handle yyyy-MM");
		it("should handle yyyy-MM-dd");
		it("should handle yyyy-MM-dd HH");
		it("should handle yyyy-MM-dd HH:mm");
		it("should handle yyyy-MM-dd HH:mm:ss");
		it("should handle yyyy-MM-dd HH:mm:ss.SSS");

		it("should handle ISO 8601 format", () => {});
		it("should handle ISO 8601 format with timezone", () => {});
		it("should handle ISO 8601 format with timezone and offset", () => {});
		it("should handle ISO 8601 format with offset", () => {});

		it("should handle UNIX timestamp", () => {});
		it("should handle UNIX timestamp with milliseconds", () => {});
		it("should handle UNIX timestamp with milliseconds and timezone", () => {});
	});

	describe("named months", () => {
		it.each([
			{ input: "Jan", description: "should handle Jan" },
			{ input: "Feb", description: "should handle Feb" },
			{ input: "Mar", description: "should handle Mar" },
			{ input: "Apr", description: "should handle Apr" },
			{ input: "May", description: "should handle May" },
			{ input: "Jun", description: "should handle Jun" },
			{ input: "Jul", description: "should handle Jul" },
			{ input: "Aug", description: "should handle Aug" },
			{ input: "Sep", description: "should handle Sep" },
			{ input: "Oct", description: "should handle Oct" },
			{ input: "Nov", description: "should handle Nov" },
			{ input: "Dec", description: "should handle Dec" },
		])("$description", ({ input }) => {
			expect(fzDatetime(input).getMonth()).toEqual(
				expectedDate.getMonth(),
			);
		});

		it.each([
			{ input: "January", description: "should handle January" },
			{ input: "February", description: "should handle February" },
			{ input: "March", description: "should handle March" },
			{ input: "April", description: "should handle April" },
			{ input: "May", description: "should handle May" },
			{ input: "June", description: "should handle June" },
			{ input: "July", description: "should handle July" },
			{ input: "August", description: "should handle August" },
			{ input: "September", description: "should handle September" },
			{ input: "October", description: "should handle October" },
			{ input: "November", description: "should handle November" },
			{ input: "December", description: "should handle December" },
		])("$description", ({ input }) => {
			expect(fzDatetime(input).getMonth()).toEqual(
				expectedDate.getMonth(),
			);
		});
	});

	describe("no coerce values provided", () => {});
});
