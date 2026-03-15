import type { FilterFields, FilterStackItem } from "@/lib/store/filter-store";
import type { LocalTransaction } from "./dexie";

type AnyRecord = Record<string, unknown>;

function getField(record: AnyRecord, field: FilterFields): unknown {
	const map: Record<FilterFields, string> = {
		amount: "amount",
		category: "category_id",
		status: "status",
		created_at: "created_at",
		updated_at: "updated_at",
		transaction_date: "transaction_date",
	};
	return record[map[field]];
}

function toDate(v: unknown): Date | null {
	if (v instanceof Date) return v;
	if (typeof v === "string" || typeof v === "number") {
		const d = new Date(v);
		return isNaN(d.getTime()) ? null : d;
	}
	return null;
}

function passesFilter(record: AnyRecord, item: FilterStackItem): boolean {
	const { field, operation, values } = item;
	const raw = getField(record, field);

	if (field === "amount") {
		if (values.length < 1) return true;
		const filterVal = Number(values[0]!.value);
		if (isNaN(filterVal)) return true;
		const recVal = Number(raw);
		if (operation === "eq") return recVal === filterVal;
		if (operation === "gt") return recVal > filterVal;
		if (operation === "gte") return recVal >= filterVal;
		if (operation === "lt") return recVal < filterVal;
		if (operation === "lte") return recVal <= filterVal;
		return true;
	}

	if (field === "category" || field === "status") {
		if (operation === "is empty") return raw === null || raw === undefined;
		if (values.length < 1) return true;
		const vals = values.map(v => String(v.value));
		if (operation === "is") return vals.includes(String(raw));
		if (operation === "is not") return !vals.includes(String(raw));
		return true;
	}

	if (
		field === "created_at" ||
		field === "updated_at" ||
		field === "transaction_date"
	) {
		if (values.length < 1) return true;
		const d1 = toDate(values[0]!.value);
		const recDate = toDate(raw as string);
		if (!d1 || !recDate) return true;

		if (operation === "from") return recDate >= d1;
		if (operation === "to") return recDate <= d1;
		if (operation === "between") {
			const d2 = values.length >= 2 ? toDate(values[1]!.value) : null;
			return recDate > d1 && (d2 ? recDate < d2 : true);
		}
		return true;
	}

	return true;
}

/**
 * In-memory equivalent of filter_apply() from filter-store.
 * Applies the full filter stack to a LocalTransaction array.
 */
export function applyFiltersLocal(
	records: LocalTransaction[],
	filterStack: FilterStackItem[],
): LocalTransaction[] {
	if (filterStack.length === 0) return records;
	return records.filter(r =>
		filterStack.every(item => passesFilter(r as AnyRecord, item)),
	);
}
