import { format, parse } from "date-fns";

export const transformers = {
	date: {
		parse: (x: string | undefined) =>
			!x ? undefined : parse(x, "yyyy-MM-dd", new Date()),
		parse_defined: (x: string) => parse(x, "yyyy-MM-dd", new Date()),
		format: (date: Date) => format(date, "yyyy-MM-dd"),
	},
	datetime: {
		format: (date: Date) => date.toISOString(),
	},
	commaSeparatedList: (x: string | undefined) =>
		!x || x === "" ? undefined : x.split(","),
};
