"use client";

import { Button } from "@/components/ui/button";
import { createOrder, verifyPayment } from "@/lib/actions/razorpay";
import { plans } from "@/lib/plans";
import { useRouter } from "next/navigation";
import React from "react";

type PaymentHandler = (order: {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
}) => Promise<void>;

export function PayButton({
	disabled,
	highlight,
}: {
	disabled?: boolean;
	highlight?: boolean;
}) {
	const router = useRouter();
	const [pending, startTransition] = React.useTransition();
	const plan = plans[0];

	function handleBuy() {
		startTransition(async () => {
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.async = true;

			script.onload = async () => {
				const order = await createOrder({
					planId: plan.id,
					quantity: 1,
				});
				if (!order || order.status === "failed") {
					alert("Error creating orders");
					return;
				}

				const options = {
					key: process.env.NEXT_PUBLIC_RAZORPAY_ID,
					amount:
						(plan.price - plan.price * (plan.discount / 100)) * 100,
					currency: "INR",
					name: "Pro plan",
					order_id: order.body.order_id,
					handler: async (response: {
						razorpay_payment_id: string;
						razorpay_order_id: string;
						razorpay_signature: string;
					}) => {
						const result = await verifyPayment(response);
						if (result.error) {
							router.push("/payment?status=failed");
							return;
						}
						router.push("/payment?status=success");
					},
					/*prefill: {
                        name: "Payment Gateways Demo",
                        email: "premprakash@example.com",
                        contact: "9999999999",
                    },*/
				};

				const rzp = new (window as any).Razorpay(options);
				rzp.open();
			};

			document.body.appendChild(script);
		});
	}

	return (
		<Button
			variant={highlight ? "default" : "secondary"}
			disabled={disabled || pending}
			className="w-full"
			onClick={handleBuy}>
			{disabled ? "Coming soon" : "Get started"}
		</Button>
	);
}
