"use client"

import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";

export default function Page() {
    bearerHeader().then(x => {
        console.log(x);
        db(x).from("transactions").select("*").then(console.log);
    })
    return <div></div>;
}
