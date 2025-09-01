import { Polar } from "@polar-sh/sdk";
import { checkEnv } from "./check-env";

checkEnv("POLAR_ACCESS_TOKEN");
checkEnv("POLAR_WEBHOOK_SECRET");
checkEnv("POLAR_PRODUCT_PRO");
checkEnv("POLAR_PRODUCT_PRO_YEARLY");
checkEnv("POLAR_PRODUCT_TEAMS");
checkEnv("POLAR_PRODUCT_TEAMS_YEARLY");

export const polarClient = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	server: "sandbox",
});
