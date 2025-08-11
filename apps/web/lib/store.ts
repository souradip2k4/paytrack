import { type Entry } from "@/app/api/[[...route]]/server";
import { type RowSelectionState } from "@tanstack/react-table";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { create } from "zustand";

type FilterFields = "category" | "tag";
type FilterState = Record<FilterFields, string[]>;

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

export const today = new Date();

export const useStore = create<Store>((set, get) => ({
	fields: [nanoid()],
	addField: () => set(s => ({ fields: [...s.fields, nanoid()] })),
	removeField: (i: number) =>
		set(s => ({ fields: s.fields.toSpliced(i, 1) })),

	filters: { category: [], tag: [] },
	existsFilter: (field: FilterFields, value: string) =>
		get().filters[field].includes(value),

	resetAllFilters: () => {
		set({ filters: { category: [], tag: [] } });
	},

	toggleFilter: (name: FilterFields, value: string) => {
		const filters = get().filters;
		const f = [...(filters[name] || [])];
		let x: FilterState =
			f.includes(value) ?
				{ ...filters, [name]: f.filter(item => item !== value) }
			:	{ ...filters, [name]: [...f, value] };
		set({ filters: x });
	},

	filter_date_from: addDays(today, -30),
	filter_date_to: addDays(today, 2),
	set_filter_date_from: (date: Date) => set({ filter_date_from: date }),
	set_filter_date_to: (date: Date) => set({ filter_date_to: date }),

	data_entries: [],
	set_data_entries: data_entries => set({ data_entries }),
	row_selection_entries: {},
	set_row_selection_entries: row_selection_entries =>
		set({ row_selection_entries }),

	yearly_billing: true,
	set_yearly_billing: (yearly_billing: boolean) => set({ yearly_billing }),

	popover_transaction_dialog_open: false,
	popover_category_picker_open: false,
	popover_currency_picker_open: false,

	popover_transaction_dialog_set_open: (s: boolean) =>
		set({ popover_transaction_dialog_open: s }),
	popover_category_picker_set_open: (s: boolean) =>
		set({ popover_category_picker_open: s }),
	popover_currency_picker_set_open: (s: boolean) =>
		set({ popover_currency_picker_open: s }),
}));
