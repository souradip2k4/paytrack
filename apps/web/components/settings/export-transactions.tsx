"use client";

import { DatePickerWithRange } from "@/components/date-range-picker";
import { useCategories } from "@/lib/query";
import { authClient } from "@budgetbee/core/auth-client";
import { getDb } from "@budgetbee/core/db";
import { Button } from "@budgetbee/ui/core/button";
import { Checkbox } from "@budgetbee/ui/core/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Label } from "@budgetbee/ui/core/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@budgetbee/ui/core/select";
import { addDays, format } from "date-fns";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import React from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type ExportFormat = "csv" | "excel" | "json";

interface ExportColumn {
    id: string;
    label: string;
    accessor: string;
    selected: boolean;
}

const defaultColumns: ExportColumn[] = [
    { id: "id", label: "Transaction ID", accessor: "id", selected: false },
    { id: "transaction_date", label: "Date", accessor: "transaction_date", selected: true },
    { id: "name", label: "Title", accessor: "name", selected: true },
    { id: "amount", label: "Amount", accessor: "amount", selected: true },
    { id: "currency", label: "Currency", accessor: "currency", selected: true },
    { id: "status", label: "Status", accessor: "status", selected: true },
    { id: "category_id", label: "Category", accessor: "category_id", selected: true },
    { id: "category_id_raw", label: "Category ID", accessor: "category_id", selected: false },
    { id: "created_at", label: "Created At", accessor: "created_at", selected: false },
    { id: "updated_at", label: "Updated At", accessor: "updated_at", selected: false },
];

export function ExportTransactions() {
    const { data: authData } = authClient.useSession();
    const { data: categories } = useCategories();
    const [isOpen, setIsOpen] = React.useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [exportFormat, setExportFormat] = React.useState<ExportFormat>("csv");
    const [isExporting, setIsExporting] = React.useState(false);
    const [columns, setColumns] = React.useState<ExportColumn[]>(defaultColumns);

    // Create category map for ID to Name lookup
    const categoryMap = React.useMemo(() => {
        if (!categories) return new Map<string, string>();
        return categories.reduce((acc, cat) => {
            acc.set(cat.id, cat.name);
            return acc;
        }, new Map<string, string>());
    }, [categories]);

    const selectedColumns = columns.filter(c => c.selected);

    const toggleColumn = (columnId: string) => {
        setColumns(prev =>
            prev.map(col =>
                col.id === columnId ? { ...col, selected: !col.selected } : col
            )
        );
    };

    const selectAllColumns = () => {
        setColumns(prev => prev.map(col => ({ ...col, selected: true })));
    };

    const deselectAllColumns = () => {
        setColumns(prev => prev.map(col => ({ ...col, selected: false })));
    };

    const handleExport = async () => {
        if (!dateRange?.from || !dateRange?.to || !authData?.user?.id) {
            toast.error("Please select a valid date range");
            return;
        }

        if (selectedColumns.length === 0) {
            toast.error("Please select at least one column to export");
            return;
        }

        setIsExporting(true);

        try {
            const db = await getDb();
            const startDateStr = format(dateRange.from, "yyyy-MM-dd");
            // Add 1 day to end date so we include everything on that day
            const endDate = addDays(dateRange.to, 1);
            const endDateStr = format(endDate, "yyyy-MM-dd");

            const res = await db
                .from("transactions")
                .select("*")
                .gte("transaction_date", startDateStr)
                .lt("transaction_date", endDateStr) // Use lt with next day to include full end day
                .order("transaction_date", { ascending: false });

            if (res.error) {
                throw new Error(res.error.message);
            }

            const transactions = res.data;

            if (!transactions || transactions.length === 0) {
                toast.info("No transactions found in the selected date range");
                setIsExporting(false);
                return;
            }

            // Format data for export with selected columns only
            const exportData = transactions.map((t: any) => {
                const row: Record<string, any> = {};
                selectedColumns.forEach(col => {
                    let value = t[col.accessor];

                    // Format specific fields
                    if (col.id === "transaction_date" && value) {
                        value = format(new Date(value), "yyyy-MM-dd");
                    } else if (col.id === "amount" && value !== undefined) {
                        value = parseFloat(value).toFixed(2);
                    } else if ((col.id === "created_at" || col.id === "updated_at") && value) {
                        value = format(new Date(value), "yyyy-MM-dd HH:mm");
                    } else if (col.id === "category_id" && value) {
                        // Convert category ID to category name
                        value = categoryMap.get(value) || value;
                    } else if (col.id === "category_id_raw") {
                        // Keep category ID as-is (already has the raw value)
                        value = value ?? "";
                    }

                    row[col.label] = value ?? "";
                });
                return row;
            });

            const fileName = `transactions_${startDateStr}_to_${format(dateRange.to, "yyyy-MM-dd")}`;

            switch (exportFormat) {
                case "csv":
                    downloadCSV(exportData, fileName);
                    break;
                case "excel":
                    downloadExcel(exportData, fileName);
                    break;
                case "json":
                    downloadJSON(exportData, fileName);
                    break;
            }

            toast.success(`Successfully exported ${transactions.length} transactions`);
            setIsOpen(false);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export transactions");
        } finally {
            setIsExporting(false);
        }
    };

    const downloadCSV = (data: any[], fileName: string) => {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(","),
            ...data.map(row =>
                headers
                    .map(header => {
                        const value = row[header];
                        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value ?? "";
                    })
                    .join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        triggerDownload(blob, `${fileName}.csv`);
    };

    const downloadExcel = (data: any[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        triggerDownload(blob, `${fileName}.xlsx`);
    };

    const downloadJSON = (data: any[], fileName: string) => {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        triggerDownload(blob, `${fileName}.json`);
    };

    const triggerDownload = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] gap-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        Export Transactions
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Date Range Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground/80">Date Range</Label>
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={setDateRange}
                        />
                    </div>

                    {/* Column Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground/80">Include Columns</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={selectAllColumns}>
                                    All
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={deselectAllColumns}>
                                    None
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border">
                            {columns.map(column => (
                                <div
                                    key={column.id}
                                    className="flex items-center gap-2">
                                    <Checkbox
                                        id={`col-${column.id}`}
                                        checked={column.selected}
                                        onCheckedChange={() => toggleColumn(column.id)}
                                    />
                                    <Label
                                        htmlFor={`col-${column.id}`}
                                        className="text-sm font-normal cursor-pointer">
                                        {column.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-2">
                        <Label htmlFor="export-format" className="text-sm font-medium text-foreground/80">
                            Format
                        </Label>
                        <Select
                            value={exportFormat}
                            onValueChange={value => setExportFormat(value as ExportFormat)}>
                            <SelectTrigger id="export-format" className="h-10">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                <SelectItem value="json">JSON Data</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={!dateRange?.from || !dateRange?.to || isExporting || selectedColumns.length === 0}
                        className="w-full"
                        size="lg">
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
