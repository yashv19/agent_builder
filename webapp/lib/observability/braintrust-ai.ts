import "server-only";

import * as ai from "ai";
import { initLogger, wrapAISDK } from "braintrust";

const globalForBraintrust = globalThis as unknown as {
  braintrustLoggers?: Map<string, ReturnType<typeof initLogger>>;
  tracedAiSdk?: typeof ai;
};

function getBraintrustApiKey() {
  const apiKey = process.env.BRAINTRUST_API_KEY?.trim();
  return apiKey && apiKey.length > 0 ? apiKey : null;
}

function resolveBraintrustProjectName(projectName: string | null | undefined) {
  const fromAgent = projectName?.trim();
  if (fromAgent) {
    return fromAgent;
  }

  const fromEnv = process.env.BRAINTRUST_PROJECT_NAME?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : null;
}

export function getBraintrustLogger(projectName?: string | null) {
  const apiKey = getBraintrustApiKey();
  const resolvedProjectName = resolveBraintrustProjectName(projectName);

  if (!apiKey || !resolvedProjectName) {
    return null;
  }

  if (!globalForBraintrust.braintrustLoggers) {
    globalForBraintrust.braintrustLoggers = new Map();
  }

  const cachedLogger = globalForBraintrust.braintrustLoggers.get(resolvedProjectName);
  if (cachedLogger) {
    return cachedLogger;
  }

  const logger = initLogger({
    apiKey,
    projectName: resolvedProjectName,
    setCurrent: false,
  });

  globalForBraintrust.braintrustLoggers.set(resolvedProjectName, logger);
  return logger;
}

export function getTracedAiSdk() {
  if (globalForBraintrust.tracedAiSdk) {
    return globalForBraintrust.tracedAiSdk;
  }

  const apiKey = getBraintrustApiKey();
  globalForBraintrust.tracedAiSdk = apiKey ? wrapAISDK(ai) : ai;
  return globalForBraintrust.tracedAiSdk;
}
