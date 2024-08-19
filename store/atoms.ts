import { QueryCategories } from "@/lib/api";
import { atom } from "recoil";

export const entryAtom = atom<string[]>({
  key: "entryAtom",
  default: [],
});

export const isEditingAtom = atom<boolean>({
  key: "isEditingAtom",
  default: false,
});

export const categoriesAtom = atom<QueryCategories | undefined>({
  key: "categoriesAtom",
  default: [],
});
