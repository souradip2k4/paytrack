import { type Entry } from "@/app/api/[[...route]]/server";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { type RowSelectionState } from "@tanstack/react-table";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FilterState = Record<FilterFields, string[]>;
export type FilterFields = "categories" | "status";
export type FilterOperations =
	| "is" // also, is-any-of when there are multiple values
	| "is not" // also, is-not-any-of when there are multiple values
	| "is empty";
export type FilterValue = { id: string; label: string };
export type FilterStackItem = {
	id: string;
	field: FilterFields;
	operation: FilterOperations;
	values: FilterValue[];
};

export type Store = {
	fields: string[];
	addField: () => void;
	removeField: (index: number) => void;

	filters: FilterState;
	existsFilter: (field: FilterFields, value: string) => boolean;
	resetAllFilters: () => void;
	toggleFilter: (field: FilterFields, value: string) => void;

	filter_date_to: Date;
	filter_date_from: Date;
	set_filter_date_from: (date: Date) => void;
	set_filter_date_to: (date: Date) => void;

	data_entries: Entry[];
	set_data_entries: (data_entries: Entry[]) => void;
	row_selection_entries: RowSelectionState;
	set_row_selection_entries: (row_selection: RowSelectionState) => void;

	yearly_billing: boolean;
	set_yearly_billing: (yearly_billing: boolean) => void;

	popover_transaction_dialog_open: boolean;
	popover_category_picker_open: boolean;
	popover_currency_picker_open: boolean;

	popover_transaction_dialog_set_open: (s: boolean) => void;
	popover_category_picker_set_open: (s: boolean) => void;
	popover_currency_picker_set_open: (s: boolean) => void;
};

type FilterStore = {
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

	apply_filter: (
		query: PostgrestFilterBuilder<
			{ PostgrestVersion: "12" },
			any,
			any,
			any
		>,
	) => PostgrestFilterBuilder<{ PostgrestVersion: "12" }, any, any, any>;
};

export const today = new Date();

export const useStore = create<Store>((set, get) => ({
	fields: [nanoid()],
	addField: () =>
		set(s => ({
			fields: [...s.fields, nanoid()],
		})),
	removeField: (i: number) =>
		set(s => ({
			fields: s.fields.toSpliced(i, 1),
		})),

	filters: {
		category: [],
		tag: [],
	},
	existsFilter: (field: FilterFields, value: string) =>
		get().filters[field].includes(value),

	resetAllFilters: () => {
		set({
			filters: {
				category: [],
				tag: [],
			},
		});
	},

	toggleFilter: (name: FilterFields, value: string) => {
		const filters = get().filters;
		const f = [...(filters[name] || [])];
		let x: FilterState =
			f.includes(value) ?
				{
					...filters,
					[name]: f.filter(item => item !== value),
				}
			:	{
					...filters,
					[name]: [...f, value],
				};
		set({
			filters: x,
		});
	},

	filter_date_from: addDays(today, -30),
	filter_date_to: addDays(today, 2),
	set_filter_date_from: (date: Date) =>
		set({
			filter_date_from: date,
		}),
	set_filter_date_to: (date: Date) =>
		set({
			filter_date_to: date,
		}),

	data_entries: [],
	set_data_entries: data_entries =>
		set({
			data_entries,
		}),
	row_selection_entries: {},
	set_row_selection_entries: row_selection_entries =>
		set({
			row_selection_entries,
		}),

	yearly_billing: true,
	set_yearly_billing: (yearly_billing: boolean) =>
		set({
			yearly_billing,
		}),

	popover_transaction_dialog_open: false,
	popover_category_picker_open: false,
	popover_currency_picker_open: false,

	popover_transaction_dialog_set_open: (s: boolean) =>
		set({
			popover_transaction_dialog_open: s,
		}),
	popover_category_picker_set_open: (s: boolean) =>
		set({
			popover_category_picker_open: s,
		}),
	popover_currency_picker_set_open: (s: boolean) =>
		set({
			popover_currency_picker_open: s,
		}),
}));

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

			apply_filter: q => {
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
							values.map(x => x.id).join(","),
						);
					} else if (operation === "is empty") {
						q.is("category_id", null);
					}
				}
				return q;
			},
		}),
		{ name: "tr::filters" },
	),
);
