/** Preference cookies read by the root layout on the server (no flash on load). One year. */
export function writePreferenceCookie(name: "locale" | "theme", value: string): void {
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}
