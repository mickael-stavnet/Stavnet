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

  it("creates the client with required environment variables on first access", async () => {
    const rpcMock = vi.fn();
    const fromMock = vi.fn();

    createClientMock.mockReturnValue({
      rpc: rpcMock,
      from: fromMock,
    } as never);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const { supabase } = await import("@/lib/supabase");

    const result = supabase.rpc("get_books", {});

    expect(createClientMock).toHaveBeenCalledWith("https://example.supabase.co", "anon-key");
    expect(rpcMock).toHaveBeenCalledWith("get_books", {});
    expect(result).toBeUndefined();
  });

  it("throws a clear error when a required env variable is missing on access", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");

    const { supabase } = await import("@/lib/supabase");

    expect(() => supabase.rpc).toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  });
});
