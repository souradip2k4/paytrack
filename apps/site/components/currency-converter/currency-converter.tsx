"use client";

import {
	COMMON_AMOUNTS,
	currencies,
	formatCurrency,
	getCurrency,
	toPairSlug,
} from "@/lib/currencies";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@budgetbee/ui/core/breadcrumb";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "@budgetbee/ui/core/native-select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@budgetbee/ui/core/table";
import { trimLeadingAndTailingSlashes } from "@budgetbee/ui/lib/utils";
import { format } from "date-fns";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useCurrencyPairQueryState } from "./query-state";

export type RateData = {
	rates: Record<string, number>;
	date: string;
};

/** Fetches fresh spot rates and clears stale data when the base currency changes. */
export function useExchangeRate(base: string) {
	const [data, setData] = React.useState<RateData | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		setData(null);

		fetch(`/api/currency/rates?base=${encodeURIComponent(base)}`, {
			signal: controller.signal,
		})
			.then(res => {
				if (!res.ok) throw new Error("Failed to fetch exchange rates");
				return res.json();
			})
			.then((json: { rates: Record<string, number>; date: string }) => {
				setData({ rates: json.rates, date: json.date });
				setLoading(false);
			})
			.catch((err: Error) => {
				if (err.name === "AbortError") return;
				setError(err.message);
				setLoading(false);
			});

		return () => controller.abort();
	}, [base]);

	return { data, loading, error };
}

export function CurrencyConvertBreadCrumbs() {
	const path = usePathname();
	const slugs = React.useMemo(() => {
		const paths = trimLeadingAndTailingSlashes(path);
		const parts = [{ name: "Home", href: "/" }, {}];
		return [];
	}, [path]);
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/">Home</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					{/* <DropdownMenu> */}
					{/* 	<DropdownMenuTrigger asChild> */}
					{/* 		<Button size="icon-sm" variant="ghost"> */}
					{/* 			<BreadcrumbEllipsis /> */}
					{/* 			<span className="sr-only">Toggle menu</span> */}
					{/* 		</Button> */}
					{/* 	</DropdownMenuTrigger> */}
					{/* 	<DropdownMenuContent align="start"> */}
					{/* 		<DropdownMenuGroup> */}
					{/* 			<DropdownMenuItem> */}
					{/* 				Documentation */}
					{/* 			</DropdownMenuItem> */}
					{/* 			<DropdownMenuItem>Themes</DropdownMenuItem> */}
					{/* 			<DropdownMenuItem>GitHub</DropdownMenuItem> */}
					{/* 		</DropdownMenuGroup> */}
					{/* 	</DropdownMenuContent> */}
					{/* </DropdownMenu> */}
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="#">Components</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export function CurrencySelect({
	value,
	onChange,
	id,
}: {
	value: string;
	onChange: (code: string) => void;
	id?: string;
}) {
	return (
		<NativeSelect
			id={id}
			value={value}
			onChange={e => onChange(e.target.value)}>
			{currencies.map(c => (
				<NativeSelectOption key={c.code} value={c.code}>
					{c.flag} {c.code} - {c.name}
				</NativeSelectOption>
			))}
		</NativeSelect>
	);
}

interface CurrencyConverterProps {
	defaultFrom?: string;
	defaultTo?: string;
}

export function CurrencyConverter({
	defaultFrom = "USD",
	defaultTo = "INR",
}: CurrencyConverterProps) {
	const amountRef = React.useRef<HTMLInputElement>(null);

	const [{ from, to }, setPair] = useCurrencyPairQueryState(
		defaultFrom,
		defaultTo,
	);
	const [amount, setAmount] = React.useState("1");

	const { data, loading, error } = useExchangeRate(from);
	const rate = data?.rates[to] ?? null;
	const parsedAmount = Number.parseFloat(amount) || 0;
	const result = rate !== null ? parsedAmount * rate : null;
	const fromCurrency = getCurrency(from);
	const toCurrency = getCurrency(to);
	const quickAmounts = COMMON_AMOUNTS.filter(amt =>
		[1, 10, 100, 1_000].includes(amt),
	);

	const handleSwap = React.useCallback(() => {
		setPair({
			from: to,
			to: from,
		});
	}, [from, setPair, to]);

	return (
		<Card className="border-border bg-card w-full">
			<CardContent className="space-y-6">
				<div className="space-y-2 border-b pb-6">
					<p className="text-muted-foreground text-xs uppercase">
						Live conversion
					</p>
					<p className="text-sm">
						Convert between major global currencies with the latest
						available market rate.
					</p>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="converter-amount"
							className="text-muted-foreground text-sm font-medium">
							Amount
						</Label>
						<Input
							id="converter-amount"
							type="number"
							value={amount}
							ref={amountRef}
							onChange={e => setAmount(e.target.value)}
							placeholder="Enter amount"
							inputMode="decimal"
							min="0"
							step="any"
						/>
					</div>

					<div className="grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr] items-end gap-x-3 gap-y-2">
						<Label
							htmlFor="from-currency"
							className="text-muted-foreground text-sm font-medium">
							From
						</Label>
						<span></span>
						<Label
							htmlFor="to-currency"
							className="text-muted-foreground text-sm font-medium">
							To
						</Label>
						<NativeSelect
							id="from-currency"
							className="w-full"
							value={from}
							onChange={e =>
								setPair({
									from: e.target.value,
								})
							}>
							{currencies.map(c => (
								<NativeSelectOption key={c.code} value={c.code}>
									{c.flag} {c.code} - {c.name}
								</NativeSelectOption>
							))}
						</NativeSelect>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleSwap}
							className="size-8 rounded-full"
							aria-label="Swap currencies">
							<ArrowLeftRight className="h-4 w-4" />
						</Button>
						<NativeSelect
							id="to-currency"
							className="w-full"
							value={to}
							onChange={e =>
								setPair({
									to: e.target.value,
								})
							}>
							{currencies.map(c => (
								<NativeSelectOption key={c.code} value={c.code}>
									{c.flag} {c.code} - {c.name}
								</NativeSelectOption>
							))}
						</NativeSelect>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{quickAmounts.map(preset => (
						<Button
							key={preset}
							type="button"
							variant={
								amount === String(preset) ? "secondary" : (
									"outline"
								)
							}
							size="sm"
							onClick={() => setAmount(String(preset))}
							className="border-input rounded-full border">
							{formatCurrency(preset, from)}
						</Button>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setAmount("");
							amountRef.current?.focus();
						}}
						className="border-input rounded-full border">
						Custom
					</Button>
				</div>

				<div className="bg-input/30 border-input rounded-2xl border p-5">
					{loading ?
						<div className="text-muted-foreground flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Fetching exchange rates...</span>
						</div>
					: error ?
						<p className="text-destructive text-sm">{error}</p>
					: result !== null && rate !== null ?
						<div className="space-y-3">
							<div className="flex flex-wrap items-start justify-between gap-6">
								<div className="space-y-2">
									<p className="text-muted-foreground text-xs uppercase">
										Equivalent amount
									</p>
									<h1 className="text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-3xl">
										{formatCurrency(result, to)}
									</h1>
								</div>
								<div className="bg-input border-input rounded-full border px-3 py-1.5 text-right text-xs font-medium">
									1 {from} ={" "}
									{rate < 1 ?
										rate.toFixed(6)
									:	rate.toFixed(4)}{" "}
									{to}
								</div>
							</div>
							<p className="text-muted-foreground text-sm leading-6">
								{fromCurrency ?
									`${fromCurrency.flag} ${fromCurrency.name}`
								:	from}{" "}
								to{" "}
								{toCurrency ?
									`${toCurrency.flag} ${toCurrency.name}`
								:	to}
								{data?.date ?
									` · Last updated: ${format(data.date, "MMM d, yyyy")}`
								:	""}
							</p>
						</div>
					:	<p className="text-muted-foreground text-sm">
							Enter an amount to see the converted value.
						</p>
					}
				</div>
			</CardContent>
		</Card>
	);
}

interface RelatedToolProps {
	cta: string;
	description: string;
	href?: string;
	pairHrefBase?: string;
}

export function CurrencySelectWithRelatedTools(
	props: CurrencyConverterProps & RelatedToolProps,
) {
	const {
		cta,
		href,
		pairHrefBase,
		description,
		defaultFrom = "USD",
		defaultTo = "INR",
		...rest
	} = props;
	const [{ from, to }] = useCurrencyPairQueryState(defaultFrom, defaultTo);
	const resolvedHref =
		pairHrefBase ?
			`${pairHrefBase}/${toPairSlug(from, to)}`
		:	(href ?? "/exchange-rates");
	return (
		<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
			<CurrencyConverter
				defaultFrom={defaultFrom}
				defaultTo={defaultTo}
				{...rest}
			/>
			<div className="flex">
				<Link href={resolvedHref} className="group h-fit">
					<Card className="border-border bg-card group-hover:border-primary/40 h-full gap-0 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:shadow-black/5">
						<CardContent className="space-y-3 p-5">
							<p className="text-muted-foreground text-xs uppercase">
								Related tool
							</p>
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-2">
									<h3 className="text-foreground">{cta}</h3>
									<p className="text-muted-foreground text-sm leading-6">
										{description}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}

export function ConversionTable({ from, to }: { from: string; to: string }) {
	const { data, loading } = useExchangeRate(from);
	const rate = data?.rates[to] ?? null;
	const fromCurrency = getCurrency(from);
	const toCurrency = getCurrency(to);

	if (!fromCurrency || !toCurrency) return null;

	return (
		<Card className="border-border bg-card gap-0 py-0 shadow-lg shadow-black/5">
			<CardHeader className="border-border border-b p-6">
				<CardTitle className="font-normal">
					{fromCurrency.flag} {from} to {toCurrency.flag} {to}
				</CardTitle>
				<CardDescription>
					Common benchmark amounts converted at the latest available
					rate.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="hover:bg-transparent">
								<TableHead className="h-11 px-6">
									{fromCurrency.name} ({from})
								</TableHead>
								<TableHead className="h-11 px-6 text-right">
									{toCurrency.name} ({to})
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{COMMON_AMOUNTS.map(amt => (
								<TableRow key={amt}>
									<TableCell className="px-6 py-3">
										{formatCurrency(amt, from)}
									</TableCell>
									<TableCell className="px-6 py-3 text-right font-medium">
										{loading ?
											<span className="text-muted-foreground">
												...
											</span>
										: rate !== null ?
											formatCurrency(amt * rate, to)
										:	<span className="text-muted-foreground">
												—
											</span>
										}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
