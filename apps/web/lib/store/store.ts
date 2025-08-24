import { type RowSelectionState } from "@tanstack/react-table";
import { create } from "zustand";

export type Store = {
	row_selection_entries: RowSelectionState;
	set_row_selection_entries: (row_selection: RowSelectionState) => void;

	yearly_billing: boolean;
	set_yearly_billing: (yearly_billing: boolean) => void;

	popover_transaction_dialog_open: boolean;
	popover_category_picker_open: boolean;
	popover_currency_picker_open: boolean;
	popover_status_picker_open: boolean;

	popover_transaction_dialog_set_open: (s: boolean) => void;
	popover_category_picker_set_open: (s: boolean) => void;
	popover_currency_picker_set_open: (s: boolean) => void;
	popover_status_picker_set_open: (s: boolean) => void;
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
	popover_status_picker_open: false,

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
	popover_status_picker_set_open: (s: boolean) =>
		set({
			popover_status_picker_open: s,
		}),
}));
