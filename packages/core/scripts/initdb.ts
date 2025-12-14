import { faker } from "@faker-js/faker";
import readline from "node:readline";
import { Client as PostgrestClient } from "pg";
import { v4 as uuidv4 } from "uuid";

function confirm(query: string) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise(resolve => {
		rl.question(`${query} (Y/n): `, answer => {
			rl.close();
			const lowerAnswer = answer.toLowerCase();
			resolve(lowerAnswer.startsWith("y") || lowerAnswer === "");
		});
	});
}

const initdb = async () => {
	const db = new PostgrestClient({
		database: process.env.POSTGRES_DATABASE,
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT),
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		connectionTimeoutMillis: 1000,
	});

	await db
		.connect()
		.then(() => console.log("Database connection established."));

	const user_id = process.env.DEV_ONLY_TEST_USER_ID!;

	const response = await confirm(
		`Are you sure you want to delete all data for ${user_id}?`,
	);

	if (!response) {
		console.log("Aborted.");
		process.exit(0);
	}

	db.query("DELETE FROM transactions WHERE user_id = $1", [user_id]);
	db.query("DELETE FROM categories WHERE user_id = $1", [user_id]);
	db.query("DELETE FROM tags WHERE user_id = $1", [user_id]);

	let categories: string[] = [];

	for (let i = 0; i < 5; i++) {
		const category_id = uuidv4();
		const category_name = faker.commerce.department();

		await db.query(
			"INSERT INTO categories (id, name, user_id) VALUES ($1, $2, $3)",
			[category_id, category_name, user_id],
		);

		console.log(`categories(${category_id}, ${category_name}, ${user_id})`);
		categories.push(category_id);
	}

	for (let i = 0; i < 10_000; i++) {
		const now = new Date().toISOString();
		const amount = faker.finance.amount({ min: -1000, max: 1000 });
		await db.query(
			"INSERT INTO transactions (amount, user_id, category_id, name, status, transaction_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
			[
				amount,
				user_id,
				faker.helpers.arrayElement(
					categories.map(value => ({
						value,
						weight: faker.number.int({ min: 1, max: 20 }),
					})),
				).value,
				faker.lorem.sentence({ min: 3, max: 10 }),
				faker.helpers.arrayElement(
					["paid", "pending", "overdue"].map(value => ({
						value,
						weight: faker.number.int({ min: 3, max: 8 }),
					})),
				).value,
				faker.date.recent({ days: 31 }).toISOString(),
				now,
				now,
			],
		);
		console.log(`transactions(${amount}, ${user_id}, ${now})`);
	}

	db.end();
};

initdb();
