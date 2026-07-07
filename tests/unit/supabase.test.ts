import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("supabase bootstrap", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("creates the client with required environment variables", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    await import("@/lib/supabase");

    expect(createClientMock).toHaveBeenCalledWith("https://example.supabase.co", "anon-key");
  });

  it("throws a clear error when a required env variable is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    await expect(import("@/lib/supabase")).rejects.toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
