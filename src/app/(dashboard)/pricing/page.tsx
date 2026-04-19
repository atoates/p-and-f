import { redirect } from "next/navigation";

/**
 * Legacy redirect. The Pricing configuration now lives under
 * Settings -> Pricing after the pilot feedback that a top-level
 * "Pricing" nav item was confusing (it's configuration, not an
 * operational view). Kept so old bookmarks and the pre-existing
 * onboarding links don't 404.
 */
export default function LegacyPricingRedirect() {
  redirect("/settings?tab=pricing");
}
