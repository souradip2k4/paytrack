import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import {
	OnChangeFn,
	VisibilityState,
	type RowSelectionState,
} from "@tanstack/react-table";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export type DisplayStore = {
	display_page_size: string;
	display_group_by: string;

	display_visibility_state: VisibilityState;
	display_row_selection_state: RowSelectionState;
	set_display_visibility_state: OnChangeFn<VisibilityState>;
	set_display_row_selection_state: OnChangeFn<RowSelectionState>;

	apply_display: (
		query: PostgrestFilterBuilder<
			{ PostgrestVersion: "12" },
			any,
			any,
			any
		>,
	) => PostgrestFilterBuilder<{ PostgrestVersion: "12" }, any, any, any>;
};

export const useDisplayStore = create<DisplayStore>()(
	persist(
		(set, get) => ({
			display_page_size: "100",
			display_group_by: "month",

			// set the default visibilities from display_fields
			display_visibility_state: display_fields.reduce((acc, x) => {
				acc[x.id] = x.default;
				return acc;
			}, {} as VisibilityState),

			display_row_selection_state: {},

			set_display_visibility_state: e => {
				set(s => {
					const ns =
						typeof e === "function" ?
							e(s.display_visibility_state)
						:	e;
					return { display_visibility_state: ns };
				});
			},

			set_display_row_selection_state: e => {
				set(s => {
					const ns =
						typeof e === "function" ?
							e(s.display_row_selection_state)
						:	e;
					return { display_row_selection_state: ns };
				});
			},
			apply_display: q => {
				const page_size = Number(get().display_page_size);
				q.limit(Number.isSafeInteger(page_size) ? page_size : 100);
				return q;
			},
		}),
		{ name: "tr_display" },
	),
);
