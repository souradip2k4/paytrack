import {
	FilterFields,
	FilterOperations,
	FilterStackItem,
	MAX_FILTER_STACK_SIZE,
	useFilterStore,
} from "@/lib/store";
import { act } from "@testing-library/react";
import { nanoid } from "nanoid";
import { beforeEach, describe, expect, it, vi } from "vitest";

const initialState = useFilterStore.getState();

const filter: FilterStackItem = {
	field: "categories",
	operation: "is",
	values: [{ id: "value#n", label: "Food", value: "value#n" }],
	id: "filter#n",
};

const filterStack: FilterStackItem[] = [
	{
		field: "categories",
		operation: "is",
		values: [
			{ id: "value#1", label: "Food", value: "value#1" },
			{ id: "value#2", label: "Travel", value: "value#2" },
			{ id: "value#3", label: "Entertainment", value: "value#3" },
		],
		id: "filter#1",
	},
	{
		field: "status",
		operation: "is",
		values: [
			{ id: "value#4", label: "Paid", value: "value#4" },
			{ id: "value#5", label: "Pending", value: "value#5" },
		],
		id: "filter#2",
	},
	{
		field: "categories",
		operation: "is not",
		values: [{ id: "value#6", label: "Education", value: "value#6" }],
		id: "filter#3",
	},
];

// ============================================================================
// MOCKS
// ============================================================================
const queryMock = {
	eq: vi.fn().mockReturnThis(),
	gt: vi.fn().mockReturnThis(),
	gte: vi.fn().mockReturnThis(),
	lt: vi.fn().mockReturnThis(),
	lte: vi.fn().mockReturnThis(),
	in: vi.fn().mockReturnThis(),
	not: vi.fn().mockReturnThis(),
	is: vi.fn().mockReturnThis(),
};

const localStorageMock = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn().mockReturnValue(null),
	clear: vi.fn().mockReturnValue(null),
};

// ============================================================================
// FILTERSTORE TESTS
// ============================================================================
describe("useFilterStore", () => {
	beforeEach(() => {
		act(() => {
			vi.clearAllMocks();
			vi.stubGlobal("localStorage", localStorageMock);
			useFilterStore.setState({
				...initialState,
				filter_stack: structuredClone(filterStack),
			});
		});
	});

	describe("filter_add", () => {
		it("should add a new filter to the stack", () => {
			act(() => {
				useFilterStore
					.getState()
					.filter_add(
						filter.field,
						filter.operation,
						structuredClone(filter.values),
						filter.id,
					);
			});
			const state = useFilterStore.getState();
			expect(state.filter_stack).toHaveLength(filterStack.length + 1);
			expect(state.filter_stack[state.filter_stack.length - 1]).toEqual(
				filter,
			);
		});

		it("should add a new filter when stack is empty", () => {
			act(() => {
				useFilterStore.setState({ filter_stack: [] });
				useFilterStore
					.getState()
					.filter_add(
						filter.field,
						filter.operation,
						filter.values,
						filter.id,
					);
			});
			const state = useFilterStore.getState();
			expect(state.filter_stack).toHaveLength(1);
			expect(state.filter_stack[0]).toEqual(filter);
		});

		it("should allow upto MAX_FILTER_STACK_SIZE filters", () => {
			let filterStack: FilterStackItem[] = Array.from(
				{
					length: MAX_FILTER_STACK_SIZE - 1,
				},
				() => ({
					field: "categories",
					operation: "is",
					values: [
						{ id: nanoid(4), label: nanoid(4), value: nanoid(4) },
					],
					id: nanoid(4),
				}),
			);
			act(() => {
				useFilterStore.setState({ filter_stack: filterStack });

				useFilterStore
					.getState()
					.filter_add(
						filter.field,
						filter.operation,
						structuredClone(filter.values),
						filter.id,
					);
			});

			expect(useFilterStore.getState().filter_stack).toHaveLength(
				MAX_FILTER_STACK_SIZE,
			);
		});

		it("should not add more than MAX_FILTER_STACK_SIZE filters", () => {
			let filterStack: FilterStackItem[] = Array.from(
				{
					length: MAX_FILTER_STACK_SIZE,
				},
				() => ({
					field: "categories",
					operation: "is",
					values: [
						{ id: nanoid(4), label: nanoid(4), value: nanoid(4) },
					],
					id: nanoid(4),
				}),
			);

			act(() => {
				useFilterStore.setState({ filter_stack: filterStack });

				useFilterStore
					.getState()
					.filter_add(
						filter.field,
						filter.operation,
						structuredClone(filter.values),
						filter.id,
					);
			});

			expect(useFilterStore.getState().filter_stack).toHaveLength(
				MAX_FILTER_STACK_SIZE,
			);
		});
	});

	describe("filter_remove", () => {
		it("should remove the first item correctly", () => {
			act(() => {
				useFilterStore.getState().filter_remove(0);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(
				filterStack.length - 1,
			);
		});

		it("should remove the last item correctly", () => {
			act(() => {
				useFilterStore.getState().filter_remove(filterStack.length - 1);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(
				filterStack.length - 1,
			);
		});

		it("should remove any item from the stack", () => {
			act(() => {
				useFilterStore.getState().filter_remove(1);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(
				filterStack.length - 1,
			);
		});

		it("should do nothing for a negative index", () => {
			act(() => {
				useFilterStore.getState().filter_remove(-1);
				useFilterStore.getState().filter_remove(-2);
				useFilterStore.getState().filter_remove(-3);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(
				filterStack.length,
			);
		});

		it("should do nothing for an index larger than the stack size", () => {
			act(() => {
				useFilterStore.getState().filter_remove(filterStack.length);
				useFilterStore.getState().filter_remove(filterStack.length + 1);
				useFilterStore.getState().filter_remove(filterStack.length + 2);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(
				filterStack.length,
			);
		});

		it("should do nothing when the stack is empty", () => {
			act(() => {
				useFilterStore.setState({ filter_stack: [] });
				useFilterStore.getState().filter_remove(0);
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(0);
		});
	});

	describe("filter_clear", () => {
		it("should clear all filters", () => {
			act(() => {
				useFilterStore.getState().filter_clear();
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(0);
		});

		it("should do nothing on empty stack", () => {
			act(() => {
				useFilterStore.setState({ filter_stack: [] });
				useFilterStore.getState().filter_clear();
			});
			expect(useFilterStore.getState().filter_stack).toHaveLength(0);
		});
	});

	describe("filter_apply", () => {
		beforeEach(() => {
			act(() => useFilterStore.setState({ filter_stack: [] }));
		});

		describe("is", () => {
			it("should call in() for category.is.(single_value) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "categories",
								operation: "is",
								values: [
									{
										id: "value#1",
										label: "Food",
										value: "value#1",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.in).toHaveBeenCalledWith("category_id", [
					"value#1",
				]);
			});

			it("should call in() for category.is.(multiple_values) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "categories",
								operation: "is",
								values: [
									{
										id: "value#1",
										label: "Food",
										value: "value#1",
									},
									{
										id: "value#2",
										label: "Travel",
										value: "value#2",
									},
									{
										id: "value#3",
										label: "Entertainment",
										value: "value#3",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.in).toHaveBeenCalledWith("category_id", [
					"value#1",
					"value#2",
					"value#3",
				]);
			});

			it("should call in() for status.is.(single_value) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "status",
								operation: "is",
								values: [
									{
										id: "paid",
										label: "Paid",
										value: "paid",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.in).toHaveBeenCalledWith("status", ["paid"]);
			});

			it("should call in() for status.is.(multiple_values) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "status",
								operation: "is",
								values: [
									{
										id: "paid",
										label: "Paid",
										value: "paid",
									},
									{
										id: "pending",
										label: "Pending",
										value: "pending",
									},
									{
										id: "overdue",
										label: "Overdue",
										value: "overdue",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.in).toHaveBeenCalledWith("status", [
					"paid",
					"pending",
					"overdue",
				]);
			});
		});

		describe("is not", () => {
			it("should call not() for category.is not.(single_value) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "categories",
								operation: "is not",
								values: [
									{
										id: "value#1",
										label: "Food",
										value: "value#1",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.not).toHaveBeenCalledWith(
					"category_id",
					"in",
					"(value#1)",
				);
			});

			it("should call not() for category.is not.(multiple_values) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "categories",
								operation: "is not",
								values: [
									{
										id: "value#1",
										label: "Food",
										value: "value#1",
									},
									{
										id: "value#2",
										label: "Travel",
										value: "value#2",
									},
									{
										id: "value#3",
										label: "Entertainment",
										value: "value#3",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.not).toHaveBeenCalledWith(
					"category_id",
					"in",
					"(value#1,value#2,value#3)",
				);
			});

			it("should call not() for status.is not.(single_value) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "status",
								operation: "is not",
								values: [
									{
										id: "paid",
										label: "Paid",
										value: "paid",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.not).toHaveBeenCalledWith(
					"status",
					"in",
					"(paid)",
				);
			});

			it("should call not() for status.is not.(multiple_values) filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "status",
								operation: "is not",
								values: [
									{
										id: "paid",
										label: "Paid",
										value: "paid",
									},
									{
										id: "pending",
										label: "Pending",
										value: "pending",
									},
								],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.not).toHaveBeenCalledWith(
					"status",
					"in",
					"(paid,pending)",
				);
			});
		});

		describe("is empty", () => {
			it("should call is() for category.is empty filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "categories",
								operation: "is empty",
								values: [],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.is).toHaveBeenCalledWith("category_id", null);
			});

			it("should call is() for status.is empty filter", () => {
				act(() => {
					useFilterStore.setState({
						filter_stack: [
							{
								field: "status",
								operation: "is empty",
								values: [],
								id: "filter#1",
							},
						],
					});
					useFilterStore.getState().filter_apply(queryMock as any);
				});
				expect(queryMock.is).toHaveBeenCalledWith("status", null);
			});
		});

		describe("amount filters", () => {
			const operations: FilterOperations[] = [
				"eq",
				"gt",
				"gte",
				"lt",
				"lte",
			];

			operations.forEach(op => {
				it(`should do nothing if no value is provided for operation ${op}`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).not.toHaveBeenCalled();
				});
			});

			operations.forEach(op => {
				it(`should take the first value if multiple values are provided for ${op}`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [
										{
											id: "value#1",
											label: "100",
											value: 100,
										},
										{
											id: "value#2",
											label: "200",
											value: 100,
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).toHaveBeenCalledExactlyOnceWith(
						"amount",
						100,
					);
				});
			});

			operations.forEach(op => {
				it(`should coerce string values for operation ${op}`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [
										{
											id: "value#1",
											label: "100",
											value: "100",
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).toHaveBeenCalledWith("amount", 100);
				});
			});

			operations.forEach(op => {
				it(`should call ${op}() for amount.${op}.number filter`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [
										{
											id: "value#1",
											label: "100",
											value: 100,
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).toHaveBeenCalledWith("amount", 100);
				});
			});

			operations.forEach(op => {
				it(`should ignore NaN values for ${op}`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [
										{
											id: "value#1",
											label: "NaN-value",
											value: NaN,
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).not.toHaveBeenCalled();
				});
			});

			operations.forEach(op => {
				it(`should ignore computed to NaN values for ${op}`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: "amount",
									operation: op,
									values: [
										{
											id: "value#1",
											label: "NaN-value",
											value: "NaN",
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					// @ts-ignore
					expect(queryMock[op]).not.toHaveBeenCalled();
				});
			});
		});

		describe("date filters", () => {
			const dateFields: FilterFields[] = [
				"created_at",
				"updated_at",
				"transaction_date",
			];

			const operations: FilterOperations[] = ["from", "to", "between"];

			operations.forEach(op => {
				dateFields.forEach(field => {
					it(`should do nothing if no value is provided for ${field}.${op}`, () => {
						act(() => {
							useFilterStore.setState({
								filter_stack: [
									{
										field: field,
										operation: op,
										values: [],
										id: "filter#1",
									},
								],
							});
							useFilterStore
								.getState()
								.filter_apply(queryMock as any);
						});
						expect(queryMock.gte).not.toHaveBeenCalled();
						expect(queryMock.lte).not.toHaveBeenCalled();
						expect(queryMock.gt).not.toHaveBeenCalled();
						expect(queryMock.lt).not.toHaveBeenCalled();
					});
				});
			});

			dateFields.forEach(field => {
				it(`should call gte for ${field}.from filter`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: field,
									operation: "from",
									values: [
										{
											id: "value#1",
											label: "2022-01-01",
											value: new Date("2022-01-01"),
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					expect(queryMock.gte).toHaveBeenCalledWith(
						field,
						new Date("2022-01-01"),
					);
				});
			});

			dateFields.forEach(field => {
				it(`should call lte for ${field}.to filter`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: field,
									operation: "to",
									values: [
										{
											id: "value#1",
											label: "2022-01-01",
											value: new Date("2022-01-01"),
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					expect(queryMock.lte).toHaveBeenCalledWith(
						field,
						new Date("2022-01-01"),
					);
				});
			});

			dateFields.forEach(field => {
				it(`should call gt and lt for ${field}.between filter`, () => {
					act(() => {
						useFilterStore.setState({
							filter_stack: [
								{
									field: field,
									operation: "between",
									values: [
										{
											id: "value#1",
											label: "2022-01-01",
											value: new Date("2022-01-01"),
										},
										{
											id: "value#2",
											label: "2022-01-01",
											value: new Date("2022-01-03"),
										},
									],
									id: "filter#1",
								},
							],
						});
						useFilterStore
							.getState()
							.filter_apply(queryMock as any);
					});
					expect(queryMock.gt).toHaveBeenCalledWith(
						field,
						new Date("2022-01-01"),
					);
					expect(queryMock.lt).toHaveBeenCalledWith(
						field,
						new Date("2022-01-03"),
					);
				});
			});
		});
	});

	describe("filter_toggle", () => {
		it("should add a new filter if id is not found", () => {
			act(() => {
				useFilterStore
					.getState()
					.filter_toggle(
						filter.field,
						filter.operation,
						filter.values[0],
						filter.id,
					);
			});
			const state = useFilterStore.getState();
			expect(state.filter_stack).toHaveLength(filterStack.length + 1);
			expect(state.filter_stack[state.filter_stack.length - 1]).toEqual(
				filter,
			);
		});
	});
});
