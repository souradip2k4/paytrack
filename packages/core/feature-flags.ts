import { redis } from "./redis";
import { getAuthAdminClient } from "./db-pool"; 

export type FeatureFlagScope = "global" | "account" | "organization";

interface FeatureFlagContext {
  accountId?: string;
  orgId?: string;
}

export const getFeatureFlag = async (
  key: string,
  context: FeatureFlagContext = {}
): Promise<boolean> => {
    const { accountId, orgId } = context;
    const cacheKey = `flag:${key}:org:${orgId || 'none'}:acc:${accountId || 'none'}`;
    
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
        return cached === "true";
    }

    const pool = getAuthAdminClient();
    if (!pool) {
      console.warn("Database pool not available for feature flags, returning false");
      return false;
    }

    const query = `
    SELECT value
    FROM feature_flags
    WHERE key = $1
    AND (
      (scope = 'global')
      OR (scope = 'account' AND scope_id = $2)
      OR (scope = 'organization' AND scope_id = $3)
    )
    ORDER BY 
      CASE scope
        WHEN 'organization' THEN 3
        WHEN 'account' THEN 2
        WHEN 'global' THEN 1
      END DESC
    LIMIT 1;
    `;

    try {
        const result = await pool.query(query, [key, accountId || null, orgId || null]);
        const finalValue = result.rows.length > 0 ? result.rows[0].value : false;
        await redis.setex(cacheKey, 300, String(finalValue));
        return finalValue;
    } catch (e) {
        console.error("Error fetching feature flag:", e);
        return false;
    }
}
