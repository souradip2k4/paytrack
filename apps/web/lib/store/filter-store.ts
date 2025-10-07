import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FilterState = Record<FilterFields, string[]>;
export type FilterFields =
	| "amount"
	| "category"
	| "status"
	| "created_at"
	| "updated_at"
	| "transaction_date";
export type FilterOperations =
	| "eq"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "is" // also, is-any-of when there are multiple values
	| "is not" // also, is-not-any-of when there are multiple values
	| "is empty"
	| "from"
	| "to"
	| "between";

export const allowed_operations_map: Record<FilterFields, FilterOperations[]> =
	{
		amount: ["eq", "gt", "gte", "lt", "lte"],
		category: ["is", "is not", "is empty"],
		status: ["is", "is not", "is empty"],
		created_at: ["from", "to", "between"],
		updated_at: ["from", "to", "between"],
		transaction_date: ["from", "to", "between"],
	};

/**
 * @param id - Unique id for each filter applied. No redundancy is checked, make sure your ids are unique.
 * @param value - Predicate values are not deep cloned, so make sure you don't mutate them. Not every filter will have a value, eg, is-empty)
 */
export type FilterValue = {
	id: string;
	value: any;
	label?: string;
};

// TODO: using idx can have concurrency issues when two conflicting filters before a re-render
/**
 * FilterStackItem
 * @param id - Unique id for each filter applied. We don't use id much, generally the idx (index) is used.
 */
export type FilterStackItem = {
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

	/** No collision check is done, make sure your ids are unique */
	filter_toggle: (
		field: FilterFields,
		operation: FilterOperations,
		value: FilterValue,
		id: string,
	) => void;
	filter_clear: () => void;

	/** Helper function to apply the filters to a db query using `@supabase/postgrest-js` */
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
				if (stack.length >= MAX_FILTER_STACK_SIZE) return;
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
				let original_operation = get().filter_stack[idx].operation;
				let values = get().filter_stack[idx].values;
				const idx2 = values.findIndex(x => x.id === value.id);
				if (idx2 < 0) values = [...values, value];
				else
					values = [
						...values.slice(0, idx2),
						...values.slice(idx2 + 1),
					];
				return get().filter_add(
					field,
					original_operation,
					[...values],
					id,
				);
			},

			filter_clear: () => set({ filter_stack: [] }),

			filter_apply: q => {
				const properties_map: Record<FilterFields, string> = {
					amount: "amount",
					category: "category_id",
					status: "status",
					created_at: "created_at",
					updated_at: "updated_at",
					transaction_date: "transaction_date",
				};

				for (const { field, operation, values } of get().filter_stack) {
					const mapped_field = properties_map[field];

					// check if operation is allowed for this field
					if (!allowed_operations_map[field].includes(operation))
						continue;

					if (field === "amount") {
						if (values.length < 1) continue;
						const value = Number(values[0].value);
						if (Number.isNaN(value)) continue;
						// @ts-ignore
						q[operation](mapped_field, value);
						continue;
					}

					if (field === "category" || field === "status") {
						if (operation === "is empty") {
							q.is(mapped_field, null);
							continue;
						}

						if (values.length < 1) continue;
						const x = values.map(x => x.value.toString());

						if (operation === "is") {
							q.in(mapped_field, x);
							continue;
						}

						if (operation === "is not") {
							q.not(mapped_field, "in", "(" + x.join(",") + ")");
							continue;
						}

						continue;
					}

					if (
						field === "created_at" ||
						field === "updated_at" ||
						field === "transaction_date"
					) {
						if (values.length < 1) continue;
						const value =
							values[0].value instanceof Date ?
								values[0].value
							:	null;

						if (operation === "from") {
							q.gte(mapped_field, value);
							continue;
						}

						if (operation === "to") {
							q.lte(mapped_field, value);
							continue;
						}

						if (operation === "between") {
							const d1 = value;
							const d2 =
								(
									values.length >= 2 &&
									values[1].value instanceof Date
								) ?
									values[1].value
								:	null;
							q.gt(mapped_field, d1);
							q.lt(mapped_field, d2);
						}
					}
				}
				return q;
			},
		}),
		{ name: "tr_filter" },
	),
);

export const serializeFilterStack = (stack: FilterStackItem[]) => {
	return stack.map(stackItem => {
		const field = stackItem.field;
		let value = [];
		if (field === "category" || field === "status")
			value = stackItem.values.map(v => v.value);
		else value = stackItem.values[0]?.value;
		return {
			field: stackItem.field,
			operation: stackItem.operation,
			value,
		};
	});
};
