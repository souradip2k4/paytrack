import prisma from "@/lib/prisma";
import {
	getDatapointByCategory,
	getDatapointsByDate,
	getSum,
} from "@prisma/client/sql";

async function main() {
	const sum = await prisma.$queryRawTyped(
		getSum(
			"user_2k3hnpKvotxmMk7LbNBSLV8I4JZ",
			new Date(2024, 8, 1),
			new Date(2024, 8, 31),
		),
	);
	const date = await prisma.$queryRawTyped(
		getDatapointsByDate(
			"user_2k3hnpKvotxmMk7LbNBSLV8I4JZ",
			new Date(2024, 8, 1),
			new Date(2024, 8, 31),
		),
	);
	const category = await prisma.$queryRawTyped(
		getDatapointByCategory("user_2k3hnpKvotxmMk7LbNBSLV8I4JZ"),
	);
	const result = {
		...sum[0],
		date,
		category,
	};
	console.log(category);
}

main();
