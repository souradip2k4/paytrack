"use server";

import { plans } from "@/lib/plans";
import { createHmac } from "crypto";
import { HTTPException } from "hono/http-exception";
import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";

interface CreateOrderProps {
	planId: number;
	quantity: number;
}

type FailedOrder = {
	statusCode: number;
};

type SuccessfulOrder = {
	order_id: Orders.RazorpayOrder["id"];
	status: Orders.RazorpayOrder["status"];
};

type Order =
	| { status: "success"; body: SuccessfulOrder }
	| { status: "failed"; body: FailedOrder };

class PaymentError extends HTTPException {}

export async function createOrder({
	planId,
	quantity = 1,
}: CreateOrderProps): Promise<Order> {
	const plan = plans.find(p => p.id === planId);

	if (!plan) return { status: "failed", body: { statusCode: 422 } };

	try {
		const KEY = process.env.NEXT_PUBLIC_RAZORPAY_ID;
		const SECRET = process.env.RAZORPAY_SECRET;

		if (!KEY || !SECRET) {
			console.log("?> Missing Razorpay keys");
			return { status: "failed", body: { statusCode: 500 } };
		}

		const instance = new Razorpay({ key_id: KEY, key_secret: SECRET });
		const orders = await instance.orders.create({
			amount: (plan.price - plan.price * (plan.discount / 100)) * 100,
			currency: "INR",
		});

		if (!orders) return { status: "failed", body: { statusCode: 501 } }; // reserved for payment error

		// create order in database

		return {
			status: "success",
			body: {
				order_id: orders.id,
				status: orders.status,
			},
		};
	} catch (error) {
		console.log("===ERROR===");
		console.log(error);
		console.log("===ERROR===");
		return { status: "failed", body: { statusCode: 500 } };
	}
}

export async function verifyPayment(data: {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}) {
	try {
		const shasum = createHmac("sha256", process.env.RAZORPAY_SECRET!);
		shasum.update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`);
		const digest = shasum.digest("hex");

		if (digest !== data.razorpay_signature) {
			return { error: "Transaction not legit!" };
		}

		// Save the payment details in the database

		return { success: true };
	} catch (error) {
		console.log("Error verifying payment", error);
		return { error: "Error verifying payment" };
	}
}
