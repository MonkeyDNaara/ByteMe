export const authLabelClass = "text-sm font-semibold";
export const authInputClass =
  "h-[50px] w-full rounded-2xl border border-base-300 bg-base-100 px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/20";
export const authButtonClass = "btn btn-primary h-13 w-full rounded-full text-base font-bold";

/**
 * The auth provider sends technical messages ("Invalid email or password",
 * "User already exists"). This maps the common ones to friendlier text --
 * purely UI, the server actions stay unchanged.
 */
export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid email or password") || lower.includes("invalid password") || lower.includes("credential")) {
    return "Email or password is wrong. Try again?";
  }
  if (lower.includes("already exists") || lower.includes("already registered")) {
    return "There's already an account with this email. Try signing in instead.";
  }
  if (lower.includes("expired") || lower.includes("invalid token")) {
    return "This reset link has expired. Request a new one below.";
  }
  return message;
}
