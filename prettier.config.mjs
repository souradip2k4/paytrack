/** @type {import('prettier').Config} */
const prettier = {
	useTabs: true,
	tabWidth: 4,
	trailingComma: "all",
	semi: true,
	arrowParens: "avoid",
	bracketSameLine: true,
	experimentalTernaries: true,
	plugins: [
		"prettier-plugin-organize-imports",
		"prettier-plugin-tailwindcss",
		"prettier-plugin-sql",
	],
};

/** @type {import('prettier-plugin-sql').SqlBaseOptions} */
const prettierSql = {
	language: "postgresql",
	database: "postgresql",
};

const config = {
	...prettier,
	...prettierSql,
};

export default config;
