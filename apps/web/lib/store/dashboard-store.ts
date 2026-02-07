import { create } from "zustand";
import type { WidgetConfig } from "@/lib/types/dashboard";

export type DashboardStore = {
	// Editing state
	isEditing: boolean;
	setIsEditing: (editing: boolean) => void;

	// Draft widgets (used during editing)
	draftWidgets: WidgetConfig[];
	setDraftWidgets: (widgets: WidgetConfig[]) => void;
	updateWidgetLayout: (id: string, layout: WidgetConfig["layout"]) => void;
	saveWidget: (widget: WidgetConfig) => void;
	deleteWidget: (id: string) => void;

	// Widget settings dialog
	settingsOpen: boolean;
	settingsWidget: WidgetConfig | null;
	openWidgetSettings: (widget: WidgetConfig | null) => void;
	closeWidgetSettings: () => void;

	// Reset
	resetDraft: (widgets: WidgetConfig[]) => void;
};

export const useDashboardStore = create<DashboardStore>()((set) => ({
	isEditing: false,
	setIsEditing: (editing) => set({ isEditing: editing }),

	draftWidgets: [],
	setDraftWidgets: (widgets) => set({ draftWidgets: widgets }),

	updateWidgetLayout: (id, layout) =>
		set((state) => ({
			draftWidgets: state.draftWidgets.map((w) =>
				w.id === id ? { ...w, layout } : w
			),
		})),

	saveWidget: (widget) =>
		set((state) => {
			const idx = state.draftWidgets.findIndex((w) => w.id === widget.id);
			if (idx >= 0) {
				const next = [...state.draftWidgets];
				next[idx] = widget;
				return { draftWidgets: next };
			}
			return { draftWidgets: [...state.draftWidgets, widget] };
		}),

	deleteWidget: (id) =>
		set((state) => ({
			draftWidgets: state.draftWidgets.filter((w) => w.id !== id),
		})),

	settingsOpen: false,
	settingsWidget: null,
	openWidgetSettings: (widget) => set({ settingsOpen: true, settingsWidget: widget }),
	closeWidgetSettings: () => set({ settingsOpen: false, settingsWidget: null }),

	resetDraft: (widgets) => set({ draftWidgets: widgets, isEditing: false }),
}));
