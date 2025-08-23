import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import {
	OnChangeFn,
	VisibilityState,
	type RowSelectionState,
} from "@tanstack/react-table";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Store = {
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

export const today = new Date();

export const useStore = create<Store>((set, get) => ({
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

export type DisplayFieldIds =
	| "category_id"
	| "name"
	| "transaction_date"
	| "created_at"
	| "updated_at"
	| "user_id"
	| "status";

export type DisplayFields = {
	id: DisplayFieldIds;
	label: string;
	default: boolean;
};

export let display_fields: DisplayFields[] = [
	// { id: "amount", label: "Amount", default: true },
	{ id: "name", label: "Title", default: true },
	{ id: "category_id", label: "Category", default: true },
	{ id: "transaction_date", label: "Transaction date", default: true },
	{ id: "created_at", label: "Created", default: true },
	{ id: "updated_at", label: "Last updated", default: true },
	{ id: "status", label: "Status", default: true },
	{ id: "user_id", label: "Creator", default: false },
];

export type FilterState = Record<FilterFields, string[]>;
export type FilterFields = "amount" | "categories" | "status";
export type FilterOperations =
	| "is" // also, is-any-of when there are multiple values
	| "is not" // also, is-not-any-of when there are multiple values
	| "is empty"
	| "greater than"
	| "less than";
export type FilterValue = { id: string; label: string };
export type FilterStackItem = {
	id: string;
	field: FilterFields;
	operation: FilterOperations;
	values: FilterValue[];
};

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

	display_page_size: string;
	display_group_by: string;

	display_visibility_state: VisibilityState;
	display_row_selection_state: RowSelectionState;
	set_display_visibility_state: OnChangeFn<VisibilityState>;
	set_display_row_selection_state: OnChangeFn<RowSelectionState>;

	apply_filter: (
		query: PostgrestFilterBuilder<
			{ PostgrestVersion: "12" },
			any,
			any,
			any
		>,
	) => PostgrestFilterBuilder<{ PostgrestVersion: "12" }, any, any, any>;

	settings_date_format: string;
	settings_relative_dates: boolean;
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

			apply_filter: q => {
				const property_map: Record<FilterFields, string> = {
					amount: "amount",
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

				const page_size = Number(get().display_page_size);
				q.limit(Number.isSafeInteger(page_size) ? page_size : 100);

				return q;
			},

			display_page_size: "100",
			display_group_by: "month",

			display_visibility_state: {},
			display_row_selection_state: {},

			set_display_visibility_state: e => {
				set(s => {
					const ns =
						typeof e === "function" ?
							e(s.display_visibility_state)
						:	e;
					return { ...s, display_visibility_state: ns };
				});
			},

			set_display_row_selection_state: e => {
				set(s => {
					const ns =
						typeof e === "function" ?
							e(s.display_row_selection_state)
						:	e;
					return { ...s, display_row_selection_state: ns };
				});
			},

			settings_date_format: "MMM dd, yyyy",
			settings_relative_dates: false,
		}),
		{ name: "tr::filters" },
	),
);
