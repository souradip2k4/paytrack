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
};

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
}));
