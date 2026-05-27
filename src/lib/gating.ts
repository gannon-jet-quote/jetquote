type PlanProfile = {
  plan?: string | null;
} | null | undefined;

export const isBetaUnlockAllEnabled = () =>
  import.meta.env.VITE_BETA_UNLOCK_ALL === "true";

export const getProfilePlan = (profile: PlanProfile) =>
  profile?.plan === "pro" ? "pro" : "free";

export const hasProAccess = (profile: PlanProfile) =>
  isBetaUnlockAllEnabled() || getProfilePlan(profile) === "pro";
