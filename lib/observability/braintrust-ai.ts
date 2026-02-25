import "server-only";

import * as ai from "ai";
import { initLogger, wrapAISDK } from "braintrust";

const globalForBraintrust = globalThis as unknown as {
  braintrustInitialized?: boolean;
  tracedAiSdk?: typeof ai;
  braintrustLogger?: ReturnType<typeof initLogger>;
};

function getTracingConfig() {
  const apiKey = process.env.BRAINTRUST_API_KEY;
  const projectName = process.env.BRAINTRUST_PROJECT_NAME;

  if (!apiKey || !projectName) {
    return null;
  }

  return { apiKey, projectName };
}

export function getBraintrustLogger() {
  if (globalForBraintrust.braintrustLogger) {
    return globalForBraintrust.braintrustLogger;
  }

  const config = getTracingConfig();
  if (!config) {
    return null;
  }

  globalForBraintrust.braintrustLogger = initLogger({
    apiKey: config.apiKey,
    projectName: config.projectName,
  });
  globalForBraintrust.braintrustInitialized = true;

  return globalForBraintrust.braintrustLogger;
}

export function getTracedAiSdk() {
  if (globalForBraintrust.tracedAiSdk) {
    return globalForBraintrust.tracedAiSdk;
  }

  const config = getTracingConfig();

  if (config && !globalForBraintrust.braintrustInitialized) {
    getBraintrustLogger();
  }

  globalForBraintrust.tracedAiSdk = config ? wrapAISDK(ai) : ai;
  return globalForBraintrust.tracedAiSdk;
}
