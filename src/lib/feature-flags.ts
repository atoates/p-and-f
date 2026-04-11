/**
 * Single source of truth for runtime feature flags.
 *
 * Flags are driven by environment variables so we can flip them per
 * environment without redeploying code. Any flag that needs to be
 * visible to client components must be prefixed with NEXT_PUBLIC_ so
 * Next.js inlines it at build time.
 *
 * When adding a flag, default to "off" in production and only flip it
 * on once the underlying integration exists. The subscription page,
 * for example, renders a placeholder UI that references billing
 * features that aren't wired up yet -- it stays hidden until the
 * billing integration lands.
 */

function parseBoolEnv(value: string | undefined): boolean {
  if (!value) return false;
  const normalised = value.trim().toLowerCase();
  return normalised === "1" || normalised === "true" || normalised === "yes";
}

export const featureFlags = {
  /**
   * Controls whether the /subscription route and its sidebar link
   * are exposed. Off by default until billing is actually plumbed in.
   */
  subscriptionBilling: parseBoolEnv(
    process.env.NEXT_PUBLIC_FEATURE_SUBSCRIPTION
  ),
} as const;

export type FeatureFlag = keyof typeof featureFlags;
