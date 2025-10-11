import { type RowSelectionState } from "@tanstack/react-table";
import { create } from "zustand";

export type Store = {
	row_selection_entries: RowSelectionState;
	set_row_selection_entries: (row_selection: RowSelectionState) => void;

	row_selection_entries_ids: string[];

	yearly_billing: boolean;
	set_yearly_billing: (yearly_billing: boolean) => void;

	popover_transaction_dialog_open: boolean;
	popover_datepicker_open: boolean;
	popover_category_picker_open: boolean;
	popover_currency_picker_open: boolean;
	popover_status_picker_open: boolean;

	popover_transaction_dialog_set_open: (s: boolean) => void;
	popover_category_picker_set_open: (s: boolean) => void;
	popover_currency_picker_set_open: (s: boolean) => void;
	popover_status_picker_set_open: (s: boolean) => void;

	modal_subscription_open: boolean;
	modal_subscription_set_open: (s: boolean) => void;
	modal_subscription_date: Date | null;
	modal_subscription_set_date: (d: Date | null) => void;

	modal_upgrade_plan_open: boolean;
};

export const today = new Date();

export const useStore = create<Store>(set => ({
	row_selection_entries: {},
	row_selection_entries_ids: [],
	set_row_selection_entries: row_selection_entries =>
		set({
			row_selection_entries,
		}),

	yearly_billing: false,
	set_yearly_billing: (yearly_billing: boolean) =>
		set({
			yearly_billing,
		}),

	popover_transaction_dialog_open: false,
	popover_datepicker_open: false,
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

	modal_subscription_open: false,
	modal_subscription_set_open: (s: boolean) =>
		set({
			modal_subscription_open: s,
		}),
	modal_subscription_date: null,
	modal_subscription_set_date: (d: Date | null) =>
		set({
			modal_subscription_date: d,
		}),

	modal_upgrade_plan_open: false,
}));
