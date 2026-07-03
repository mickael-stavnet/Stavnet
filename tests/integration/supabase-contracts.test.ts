import { describe, expect, it } from "vitest";

const hasSupabaseEnv =
  typeof process.env.SUPABASE_TEST_URL === "string" &&
  process.env.SUPABASE_TEST_URL.length > 0 &&
  typeof process.env.SUPABASE_TEST_ANON_KEY === "string" &&
  process.env.SUPABASE_TEST_ANON_KEY.length > 0;

const describeIfSupabase = hasSupabaseEnv ? describe : describe.skip;

describeIfSupabase("supabase contracts", () => {
  it("is wired for integration against a dedicated test database", () => {
    expect(process.env.SUPABASE_TEST_URL).toBeTruthy();
    expect(process.env.SUPABASE_TEST_ANON_KEY).toBeTruthy();
  });
});
