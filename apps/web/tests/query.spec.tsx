// src/hooks/__tests__/useCategories.test.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks Setup ---
// Mock the dependencies BEFORE importing the hook
// Replace with the actual paths to your modules

// 1. Mock the authClient
vi.mock("@budgetbee/core/auth-client", () => ({
	authClient: {
		useSession: vi.fn(),
	},
}));

// 2. Mock the bearerHeader utility
vi.mock("@/lib/utils", () => ({
	bearerHeader: vi
		.fn()
		.mockResolvedValue({ Authorization: "Bearer FAKE_TOKEN" }),
}));

// 3. Mock the database client (e.g., Supabase)
const mockDbQuery = {
	from: vi.fn().mockReturnThis(),
	select: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	order: vi.fn(), // This is the final method in the chain, so it will return the promise
};
vi.mock("@/lib/db", () => ({
	db: vi.fn(() => mockDbQuery),
}));

// --- Now, import the hook and mocked modules ---
import { useCategories } from "@/lib/query"; // Adjust path as needed
import { authClient } from "@budgetbee/core/auth-client";

// --- Test Suite ---
describe("useCategories", () => {
	// Create a new QueryClient for each test to ensure isolation
	const createWrapper = () => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: false, // Disable retries for tests
				},
			},
		});
		// eslint-disable-next-line react/display-name
		return ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		);
	};

	// Reset mocks before each test
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ---- TEST CASE 1: User is not logged in ----
	it("should return an empty array when user is not authenticated", async () => {
		// Arrange: Simulate no user session
		vi.mocked(authClient.useSession).mockReturnValue({
			data: null,
			status: "unauthenticated",
		} as any);

		// Act: Render the hook
		const { result } = renderHook(() => useCategories(), {
			wrapper: createWrapper(),
		});

		// Assert: Wait for the query to settle and check the data
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual([]);
		// Ensure the database was NOT called
		expect(db).not.toHaveBeenCalled();
	});

	// ---- TEST CASE 2: User is logged in and data is fetched successfully ----
	it("should fetch and return categories when user is authenticated", async () => {
		// Arrange: Simulate a logged-in user
		const mockUserId = "user-123-abc";
		vi.mocked(authClient.useSession).mockReturnValue({
			data: { user: { id: mockUserId } },
			status: "authenticated",
		} as any);

		// Arrange: Mock the database response
		const mockCategories = [
			{ id: 1, name: "Groceries", user_id: mockUserId },
			{ id: 2, name: "Utilities", user_id: mockUserId },
		];
		vi.mocked(mockDbQuery.order).mockResolvedValue({
			data: mockCategories,
			error: null,
		});

		// Act: Render the hook
		const { result } = renderHook(() => useCategories(), {
			wrapper: createWrapper(),
		});

		// Assert: Check loading state and final data
		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual(mockCategories);

		// Assert that the db query was constructed correctly
		expect(db).toHaveBeenCalled();
		expect(mockDbQuery.from).toHaveBeenCalledWith("categories");
		expect(mockDbQuery.select).toHaveBeenCalledWith("*");
		expect(mockDbQuery.eq).toHaveBeenCalledWith("user_id", mockUserId);
		expect(mockDbQuery.order).toHaveBeenCalledWith("name");
	});

	// ---- TEST CASE 3: User is logged in but the database returns an error ----
	it("should return an empty array when the database call fails", async () => {
		// Arrange: Simulate a logged-in user
		const mockUserId = "user-456-def";
		vi.mocked(authClient.useSession).mockReturnValue({
			data: { user: { id: mockUserId } },
			status: "authenticated",
		} as any);

		// Arrange: Mock a database error response
		vi.mocked(mockDbQuery.order).mockResolvedValue({
			data: null,
			error: new Error("Database connection failed"),
		});

		// Act
		const { result } = renderHook(() => useCategories(), {
			wrapper: createWrapper(),
		});

		// Assert
		expect(result.current.isLoading).toBe(true);

		// Wait for the query to finish
		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		// Your hook's logic `if (res.error) return [];` means it resolves successfully with an empty array.
		expect(result.current.data).toEqual([]);
		expect(result.current.isError).toBe(false); // The queryFn itself didn't throw, so it's not an error state for TanStack Query
	});
});
