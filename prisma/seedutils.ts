import prisma from "@/lib/prisma";

async function cleardb() {
	if (process.env.NODE_ENV === "production") return; // double check is always good :)
	await prisma.entry.deleteMany();
	await prisma.category.deleteMany();
	await prisma.tag.deleteMany();
	await prisma.apiKey.deleteMany();
	await prisma.user.deleteMany();
}

export { cleardb as _devonly_cleardb };
