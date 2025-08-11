"use client";

import { useLocalStorage } from "@/hooks/use-localstorage";
import currenciesJson from "@/lib/currencies.json";
import React from "react";

export function CurrencySelect() {
	const id = React.useId();
	const [open, setOpen] = React.useState<boolean>(false);
	const [currency, setCurrency] = useLocalStorage("currency", "USD");
	const currencyKeys = React.useMemo(() => Object.keys(currenciesJson), []);
	return null;
}
