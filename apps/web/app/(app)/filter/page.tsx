import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function Page() {
	const tok = await auth.api.getToken({
		headers: await headers(),
	});

	const res = await db.from("dummy").select("*");

	if (res.error) console.error(res.error);
	if (res.data) console.log(res.data);

	return <div></div>;
}
