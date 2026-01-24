import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalSettingsStore = {
	settings_date_format: string;
	settings_relative_dates: boolean;

	// when enabled, does not close the create category dialog
	// so that users can create more categories
	create_category_can_create_more: boolean;
	create_category_set_can_create_more: (c: boolean) => void;

	confirmation_dialog_delete_category_hidden: boolean;
	set_confirmation_dialog_delete_category_hidden: (v: boolean) => void;
};

export const useLocalSettingsStore = create<LocalSettingsStore>()(
	persist(
		(set, get) => ({
			settings_date_format: "MMM dd, yyyy",
			settings_relative_dates: false,

			create_category_can_create_more: false,
			create_category_set_can_create_more: (c: boolean) =>
				set({ create_category_can_create_more: c }),

			confirmation_dialog_delete_category_hidden: false,
			set_confirmation_dialog_delete_category_hidden: (v: boolean) =>
				set({ confirmation_dialog_delete_category_hidden: v }),
		}),
		{ name: "lo_settings" },
	),
);
