import { create } from "zustand";

export type EditorStore = { is_editing: boolean };

export const useEditorStore = create<EditorStore>(() => ({
	is_editing: false,
}));
