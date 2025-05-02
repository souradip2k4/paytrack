import React from "react";

export function useLocalStorage(
	key: string,
	defaultValue: string,
): [string, React.Dispatch<React.SetStateAction<string>>] {
	const item = window.localStorage.getItem(key);
	const [storedValue, setStoredValue] = React.useState<string>(
		item ? item : defaultValue,
	);
	React.useEffect(() => {
		window.localStorage.setItem(key, storedValue);
	}, [key, storedValue]);
	return [storedValue, setStoredValue];
}
