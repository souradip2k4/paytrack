import { registerOTel } from "@vercel/otel";
import {
	AlwaysOnSampler,
	TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-node";

export async function register() {
	registerOTel({
		serviceName: "budgetbee-otel",
		traceSampler:
			process.env.NODE_ENV === "development" ?
				new AlwaysOnSampler()
			:	new TraceIdRatioBasedSampler(0.1),
	});
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("@/instrumentation.node");
	}
}
