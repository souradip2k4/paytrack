import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
	resource: new Resource({
		[SEMRESATTRS_SERVICE_NAME]: "budgetbee-otel",
	}),
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": {
				enabled: false,
			},
			"@opentelemetry/instrumentation-net": {
				enabled: false,
			},
			"@opentelemetry/instrumentation-dns": {
				enabled: false,
			},
			"@opentelemetry/instrumentation-http": {
				enabled: true,
			},
		}),
	],
	spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
});

sdk.start();
