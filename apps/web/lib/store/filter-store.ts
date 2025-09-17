import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FilterState = Record<FilterFields, string[]>;
export type FilterFields = "categories" | "status";
export type FilterOperations =
	| "is" // also, is-any-of when there are multiple values
	| "is not" // also, is-not-any-of when there are multiple values
	| "is empty";

// predicate values (not every filter will have a value, eg, is-empty)
export type FilterValue = { id: string; label: string };
export type FilterStackItem = {
	// unique id for each filter applied
	// we don't the id much, generally the idx (index) is used
	id: string;
	field: FilterFields;
	operation: FilterOperations;
	values: FilterValue[];
};

export const MAX_FILTER_STACK_SIZE = 255;

export type FilterStore = {
	filter_stack: FilterStackItem[];
	filter_add: (
		field: FilterFields,
		operation: FilterOperations,
		values: FilterValue[],
		id: string,
	) => void;
	filter_remove: (idx: number) => void;
	filter_toggle: (
		field: FilterFields,
		operation: FilterOperations,
		value: FilterValue,
		id: string,
	) => void;
	filter_clear: () => void;

	// helper function to apply the filters to a db query using @supabase/postgrest-js
	filter_apply: (
		query: PostgrestFilterBuilder<
			{ PostgrestVersion: "12" },
			any,
			any,
			any
		>,
	) => PostgrestFilterBuilder<{ PostgrestVersion: "12" }, any, any, any>;
};

export const useFilterStore = create<FilterStore>()(
	persist(
		(set, get) => ({
			filter_stack: [],
			filter_add: (field, operation, values, id) => {
				const stack = get().filter_stack;
				let idx = stack.findIndex(x => x.id === id);
				if (idx === -1) stack.push({ field, operation, values, id });
				else {
					const item = stack[idx];
					item.operation = operation;
					item.values = values;
					item.id = id;
					stack[idx] = item;
				}
				set({
					filter_stack: [...stack.filter(x => x.values.length > 0)],
				});
			},
			filter_remove: idx => {
				const stack = get().filter_stack;
				if (idx < 0 || idx >= stack.length) return;
				stack.splice(idx, 1);
				set({ filter_stack: [...stack] });
			},
			filter_toggle: (field, operation, value, id) => {
				const idx = get().filter_stack.findIndex(x => x.id === id);
				if (idx < 0)
					return get().filter_add(field, operation, [value], id);
				let item = get().filter_stack[idx].values;
				const idx2 = item.findIndex(x => x.id === value.id);
				if (idx2 < 0) item = [...item, value];
				else item = [...item.slice(0, idx2), ...item.slice(idx2 + 1)];
				return get().filter_add(field, operation, [...item], id);
			},
			filter_clear: () => set({ filter_stack: [] }),

			filter_apply: q => {
				const property_map: Record<FilterFields, string> = {
					categories: "category_id",
					status: "status",
				};
				for (const { field, operation, values } of get().filter_stack) {
					if (values.length <= 0) continue;
					const mapped_field = property_map[field];
					if (operation === "is") {
						const x = values.map(x => x.id);
						q.in(mapped_field, x);
					} else if (operation === "is not") {
						q.not(
							"category_id",
							"in",
							"(" + values.map(x => x.id).join(",") + ")",
						);
					} else if (operation === "is empty") {
						q.is("category_id", null);
					}
				}
				return q;
			},
		}),
		{ name: "tr_filters" },
	),
);
