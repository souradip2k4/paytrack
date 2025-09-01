import { Resend } from "resend";
import { checkEnv } from "./check-env";

checkEnv("RESEND_MAIL");
checkEnv("RESEND_API_KEY");

export const resend = new Resend(process.env.RESEND_API_KEY);
