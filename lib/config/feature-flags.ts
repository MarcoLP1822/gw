/**
 * Feature Flags Configuration
 * 
 * Centralized control for experimental/beta features.
 * Set via environment variables for easy toggle without deployment.
 */

export const FEATURE_FLAGS = {
    /**
     * Enable Apply Consistency Suggestions
     * When disabled, "Preview Modifica" button won't appear
     */
    SUGGESTION_AUTO_APPLY: process.env.NEXT_PUBLIC_ENABLE_SUGGESTION_APPLY === 'true',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    return FEATURE_FLAGS[flag];
}
