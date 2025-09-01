import { resetPassword, verificationLink } from "@/lib/emails";
import { polarClient } from "@/lib/polar";
import { resend } from "@/lib/resend";
import {
	checkout,
	polar,
	portal,
	usage,
	webhooks,
} from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { bearer, customSession, jwt, organization } from "better-auth/plugins";
import { Pool } from "pg";
import { checkEnv } from "./check-env";

checkEnv("APP_URL");
checkEnv("API_URL");
checkEnv("GOOGLE_CLIENT_ID");
checkEnv("GOOGLE_CLIENT_SECRET");
checkEnv("POSTGRES_AUTH_ADMIN_DATABASE_URL");
checkEnv("POSTGRES_SUBSCRIPTION_ADMIN_DATABASE_URL");

const authAdminClient = new Pool({
	connectionString: process.env.POSTGRES_AUTH_ADMIN_DATABASE_URL,
});

const subscriptionAdminClient = new Pool({
	connectionString: process.env.POSTGRES_SUBSCRIPTION_ADMIN_DATABASE_URL,
});

export const auth = betterAuth({
	database: authAdminClient,
	appName: "Budgetbee",
	trustedOrigins: ["http://192.168.0.155:3000"], // TODO: remove this
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
	plugins: [
		customSession(async ({ session, user }) => {
			const subscription = `select product_id from app_subscriptions where user_id = $1 and period_start <= now() and period_end >= now()`;
			const subscriptionRes = await authAdminClient.query(subscription, [
				user.id,
			]);
			const isSubscribed =
				subscriptionRes &&
				subscriptionRes.rows &&
				subscriptionRes.rows.length > 0 &&
				subscriptionRes.rows[0].product_id;
			return {
				user,
				session,
				subscription: {
					isSubscribed,
					productId: subscriptionRes.rows[0].product_id,
				},
			};
		}),

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
					secret: process.env.POLAR_WEBHOOK_SECRET!,
					onSubscriptionActive: async payload => {
						console.log(
							"> subscription request: ",
							payload.data.id,
							payload.data.customer.externalId,
							payload.data.customer.organizationId,
							payload.data.productId,
						);

						const query = `
    INSERT INTO app_subscriptions (
      id,
      status,
      amount_paid,
      starts_at,
      ends_at,
      period_start,
      period_end,
      product_id,
      user_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      starts_at = EXCLUDED.starts_at,
      ends_at = EXCLUDED.ends_at,
      period_start = EXCLUDED.period_start,
      period_end = EXCLUDED.period_end,
      amount_paid = EXCLUDED.amount_paid,
      product_id = EXCLUDED.product_id;
  `;

						const values = [
							payload.data.id,
							"sub_active",
							payload.data.amount,
							payload.data.startedAt?.toISOString(),
							payload.data.endedAt?.toISOString(),
							payload.data.currentPeriodStart.toISOString(),
							payload.data.currentPeriodEnd?.toISOString(),
							payload.data.productId,
							payload.data.customer.externalId,
						];

						try {
							const res = await subscriptionAdminClient.query(
								query,
								values,
							);
							console.log(
								"> Subscription set successfully: ",
								res.rowCount,
							);
						} catch (e) {
							console.error("err: Subscription set failed: ", e);
							// throw an error to notify webhook provider
							throw new Error();
						}
					},
					onSubscriptionRevoked: async payload => {
						console.log(
							"> subscription revoked request: ",
							payload.data.id,
							payload.data.customer.externalId,
							payload.data.customer.organizationId,
							payload.data.productId,
						);

						const query = `DELETE FROM app_subscriptions WHERE id = $1`;

						try {
							const res = await subscriptionAdminClient.query(
								query,
								[payload.data.id],
							);
							console.log(
								"> Subscription revoked: ",
								res.rowCount,
							);
						} catch (e) {
							console.error(
								"err: Subscription delete failed: ",
								e,
							);
							// throw an error to notify webhook provider
							throw new Error();
						}
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
