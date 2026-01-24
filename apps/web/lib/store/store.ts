import { type RowSelectionState } from "@tanstack/react-table";
import { create } from "zustand";
import { CATEGORY_COLORS } from "../hash";

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

	sheet_subscription_open: boolean;
	sheet_subscription_set_open: (s: boolean) => void;
	sheet_subscription_date: Date | null;
	sheet_subscription_set_date: (d: Date | null) => void;

	modal_upgrade_plan_open: boolean;

	category_create_dialog_open: boolean;
	category_create_dialog_type: "create" | "update" | "delete";
	category_create_dialog_data: { id?: string; name?: string; color?: string };
	category_create_dialog_set_open: (s: boolean) => void;
	category_create_dialog_set_state: (
		s: boolean,
		type: "create" | "update" | "delete",
		data: { id?: string; name?: string; color?: string },
	) => void;
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

	sheet_subscription_open: false,
	sheet_subscription_set_open: (s: boolean) =>
		set({
			sheet_subscription_open: s,
		}),
	sheet_subscription_date: null,
	sheet_subscription_set_date: (d: Date | null) =>
		set({
			sheet_subscription_date: d,
		}),

	modal_upgrade_plan_open: false,

	category_create_dialog_open: false,
	category_create_dialog_type: "create",
	category_create_dialog_data: {},
	category_create_dialog_set_open: (s: boolean) =>
		set({
			category_create_dialog_open: s,
		}),
	category_create_dialog_set_state: (s, type, data) =>
		set({
			category_create_dialog_open: s,
			category_create_dialog_type: type,
			category_create_dialog_data: data,
		}),
}));
