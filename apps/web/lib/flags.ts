import { getFeatureFlag } from "@budgetbee/core/feature-flags";

export const getFlag = async (key: string) => { 
  return getFeatureFlag(key);
};

export const getFlagWithContext = async (key: string, context: { accountId?: string; orgId?: string }) => {
    return getFeatureFlag(key, context);
}
