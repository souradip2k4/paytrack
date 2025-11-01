import { Resend } from "resend";

import { resetPassword } from "./reset-password";
import { verificationLink } from "./verification-link";

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend, resetPassword, verificationLink };
