import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "stavnet_admin_session";
export const ADMIN_PASSWORD = "StavNet92";

function expectedSessionToken(): string {
  return createHmac("sha256", ADMIN_PASSWORD)
    .update("stavnet-admin-session-v1")
    .digest("hex");
}

export function isValidAdminPassword(password: unknown): password is string {
  return typeof password === "string" && password === ADMIN_PASSWORD;
}

export function createAdminSessionToken(): string {
  return expectedSessionToken();
}

export function isValidAdminSessionToken(token: unknown): token is string {
  if (
    typeof token !== "string" ||
    token.length !== expectedSessionToken().length
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(token, "utf8"),
    Buffer.from(expectedSessionToken(), "utf8"),
  );
}
