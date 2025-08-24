import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalSettingsStore = {
	settings_date_format: string;
	settings_relative_dates: boolean;
};

export const useLocalSettingsStore = create<LocalSettingsStore>()(
	persist(
		(set, get) => ({
			settings_date_format: "MMM dd, yyyy",
			settings_relative_dates: false,
		}),
		{ name: "lo_settings" },
	),
);
