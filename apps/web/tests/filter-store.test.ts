import { FilterStackItem, useFilterStore } from "@/lib/store";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const initialState = useFilterStore.getState();

const categoryFilter: FilterStackItem = {
	field: "categories",
	operation: "is",
	values: [{ id: "value#1", label: "Food" }],
	id: "filter#1",
};

// ============================================================================
// FILTERSTORE TESTS
// ============================================================================
describe("useFilterStore", () => {
	beforeEach(() => {
		act(() => {
			vi.clearAllMocks();
			useFilterStore.setState(initialState);
		});
	});

	describe("filter_add", () => {
		it("should add a new filter to the stack", () => {
			act(() => {
				useFilterStore
					.getState()
					.filter_add(
						categoryFilter.field,
						categoryFilter.operation,
						categoryFilter.values,
						categoryFilter.id,
					);
			});
			const state = useFilterStore.getState();
			expect(state.filter_stack).toHaveLength(1);
			expect(state.filter_stack[0]).toEqual(categoryFilter);
		});

		it.todo(
			"should not add more than MAX_FILTER_STACK_SIZE filters",
			() => {},
		);

		it.todo("should not add a filter with an empty field", () => {});

		it.todo("should not add a new filter with the same id", () => {});

		it.todo("should not add an invalid operation and field pair", () => {});

		it.todo(
			"should not add an empty filter where it is not allowed",
			() => {},
		);
	});

	describe("filter_remove", () => {
		it("should remove a filter from the stack", () => {
			act(() => {
				useFilterStore
					.getState()
					.filter_add(
						categoryFilter.field,
						categoryFilter.operation,
						categoryFilter.values,
						categoryFilter.id,
					);
				useFilterStore.getState().filter_remove(0);
				expect(useFilterStore.getState().filter_stack).toHaveLength(0);
			});
		});

		it.todo("should do nothing for a negative index", () => {});
		it.todo(
			"should do nothing for an index larger than the stack size",
			() => {},
		);
		it.todo("should remove the last item correctly");
		it.todo("should remove the first item correctly");
	});

	describe("filter_clear", () => {
		it.todo("should clear all filters");
		it.todo("should work on empty stack");
	});
});
