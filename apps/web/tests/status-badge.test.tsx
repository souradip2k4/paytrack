import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/status-badge";
import React from "react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";

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
})
