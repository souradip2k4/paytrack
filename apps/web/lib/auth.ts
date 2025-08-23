import { resetPassword, verificationLink } from "@/lib/emails";
import {
	getActiveOrganization,
	getActiveSubscription,
	upsertSubscription,
} from "@/server/organization";
import {
	checkout,
	polar,
	portal,
	usage,
	webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer, jwt, organization } from "better-auth/plugins";
import { addDays } from "date-fns";
import { Pool } from "pg";
import { Resend } from "resend";

if (!process.env.RESEND_MAIL) throw new Error("env: RESEND_MAIL is not set");
if (!process.env.RESEND_API_KEY)
	throw new Error("env: RESEND_API_KEY is not set");

const resend = new Resend(process.env.RESEND_API_KEY!);

const polarClient = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	server: "sandbox",
});

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
	}),
	appName: "Budgetbee",
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async data => {
			const { data: success, error } = await resend.emails.send({
				from: `Budgetbee <${process.env.RESEND_MAIL}>`,
				to: [data.user.email],
				subject: "Password reset",
				html: resetPassword(data.url),
			});
			if (error) console.error(error);
			if (success) console.log(success);
		},
	},
	emailVerification: {
		sendVerificationEmail: async data => {
			const { data: success, error } = await resend.emails.send({
				from: `Budgetbee <${process.env.RESEND_MAIL}>`,
				to: [data.user.email],
				subject: "Verify your email",
				html: verificationLink(data.url),
			});
			if (error) console.error(error);
			if (success) console.log(success);
		},
		sendOnSignUp: true,
		sendOnSignIn: true, // send email if user is not verified
	},
	user: {
		modelName: "users",
		fields: {
			emailVerified: "email_verified",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
		deleteUser: {
			enabled: true,
		},
	},
	session: {
		modelName: "sessions",
		fields: {
			updatedAt: "updated_at",
			expiresAt: "expires_at",
			createdAt: "created_at",
			ipAddress: "ip_address",
			userAgent: "user_agent",
			userId: "user_id",
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
		modelName: "accounts",
		fields: {
			accountId: "account_id",
			providerId: "provider_id",
			userId: "user_id",
			accessToken: "access_token",
			refreshToken: "refresh_token",
			idToken: "id_token",
			accessTokenExpiresAt: "access_token_expires_at",
			refreshTokenExpiresAt: "refresh_token_expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	},
	verification: {
		modelName: "verifications",
		fields: {
			expiresAt: "expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	},
	socialProviders: {
		google: {
			enabled: true,
			prompt: "select_account",
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	databaseHooks: {
		session: {
			create: {
				before: async session => {
					const activeOrganizationId = await getActiveOrganization(
						session.userId,
					);
					const subscription = await getActiveSubscription(
						session.userId,
						activeOrganizationId,
					);
					return {
						data: {
							...session,
							activeOrganizationId,
							subscription,
						},
					};
				},
			},
		},
	},
	plugins: [
		organization({
			autoCreateOrganizationOnSignUp: true,
			cancelPendingInvitationsOnReInvite: true,
			sendInvitationEmail: async data => {
				const { data: success, error } = await resend.emails.send({
					from: `Budgetbee <${process.env.RESEND_MAIL}>`,
					to: [data.invitation.email],
					subject: "You've been invited to join a team",
					text: `You've been invited to join ${data.organization.name} by ${data.inviter.user.name}.\nIf this wasn't you, you can ignore this email.`,
				});
				if (error) console.error(error);
				if (success) console.log(success);
			},
			invitationExpiresIn: 24 * 7,
			schema: {
				organization: {
					modelName: "organizations",
					fields: {
						createdAt: "created_at",
					},
				},
				member: {
					modelName: "members",
					fields: {
						organizationId: "organization_id",
						userId: "user_id",
						createdAt: "created_at",
					},
				},
				invitation: {
					modelName: "invitations",
					fields: {
						organizationId: "organization_id",
						expiresAt: "expires_at",
						inviterId: "inviter_id",
					},
				},
				session: {
					fields: {
						activeOrganizationId: "active_organization_id",
					},
				},
			},
		}),

		polar({
			client: polarClient,
			createCustomerOnSignUp: false,
			use: [
				checkout({
					products: [
						{
							productId: process.env.POLAR_PRODUCT_PRO!,
							slug: "pro",
						},
						{
							productId: process.env.POLAR_PRODUCT_PRO_YEARLY!,
							slug: "pro-yearly",
						},
					],
					successUrl: "/welcome?id={CHECKOUT_ID}",
					authenticatedUsersOnly: true,
				}),
				portal(),
				usage(),
				webhooks({
					secret: process.env.POLAR_WHSEC!,
					onCustomerStateChanged: async payload => {
						if (payload.data.activeSubscriptions.length <= 0)
							return;
						const subscription =
							payload.data.activeSubscriptions[0];

						await upsertSubscription({
							amount_paid: subscription.amount,
							period_start:
								subscription.currentPeriodStart.toISOString(),
							period_end:
								subscription.currentPeriodEnd?.toISOString() ||
								addDays(
									subscription.currentPeriodStart,
									30,
								).toISOString(), // TODO: fix this
							email: payload.data.email,
							subscription_id: subscription.id,
							product_id: subscription.productId,
						});
					},
				}),
			],
		}),

		jwt({
			jwt: {
				definePayload: ({ user, session }) => {
					return {
						sub: user.id,
						user_id: user.id,
						role: "authenticated",
						email: user.email,
						claims: {
							organization_id: session.activeOrganizationId,
							subscription: session.subscription,
						},
					};
				},
				issuer: process.env.APP_URL || "http://localhost:3000",
				audience: process.env.APP_URL || "http://localhost:3000",
				expirationTime: "1h",
			},
			schema: {
				jwks: {
					fields: {
						publicKey: "public_key",
						privateKey: "private_key",
						createdAt: "created_at",
					},
				},
			},
		}),

		bearer(),

		nextCookies(),
	],
});
