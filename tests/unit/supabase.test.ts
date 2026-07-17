import { beforeEach, describe, expect, it, vi } from "vitest";

describe("D1 Worker client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("sends a protected query to the Worker", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 1 }], count: 1 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("STAVNET_DATA_WORKER_URL", "https://worker.example");
    vi.stubEnv("STAVNET_DATA_WORKER_SECRET", "worker-secret");
    const { supabase } = await import("@/lib/supabase");
    const result = await supabase.from("data-books").select("id", { count: "exact" }).eq("id", 1);
    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.count).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith("https://worker.example/v1/query", expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer worker-secret" }) }));
  });

  it("reports a missing Worker URL clearly", async () => {
    vi.stubEnv("STAVNET_DATA_WORKER_URL", "");
    vi.stubEnv("STAVNET_DATA_WORKER_SECRET", "worker-secret");
    const { supabase } = await import("@/lib/supabase");
    const result = await supabase.rpc("get_books_page", {});
    expect(result.error?.message).toContain("STAVNET_DATA_WORKER_URL");
  });
});
