import { StatusBadge } from "@/components/status-badge";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("StatusBadge", () => {
	it("should render Paid text", () => {
		render(<StatusBadge status="paid" />);
		expect(screen.getByText("Paid")).toBeInTheDocument();
	});

	it("should render Pending text", () => {
		render(<StatusBadge status="pending" />);
		expect(screen.getByText("Pending")).toBeInTheDocument();
	});

	it("should render Overdue text", () => {
		render(<StatusBadge status="overdue" />);
		expect(screen.getByText("Overdue")).toBeInTheDocument();
	});
});
