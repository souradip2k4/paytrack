import React from "react";

const IS_SERVER = typeof window === "undefined";

export function useLocalStorage(
	key: string,
	defaultValue: string,
): [string, React.Dispatch<React.SetStateAction<string>>] {
	const item = IS_SERVER ? undefined : window.localStorage.getItem(key);
	const [storedValue, setStoredValue] = React.useState<string>(
		item ? item : defaultValue,
	);
	React.useEffect(() => {
		window.localStorage.setItem(key, storedValue);
	}, [key, storedValue]);
	return [storedValue, setStoredValue];
}
