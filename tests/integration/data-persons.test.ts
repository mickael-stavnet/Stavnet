import { beforeAll, describe, expect, it, vi } from "vitest";
import { isSupabaseEgressRestricted } from "./supabase-availability";

const testUrl = process.env.SUPABASE_TEST_URL;
const testAnonKey = process.env.SUPABASE_TEST_ANON_KEY;

const hasSupabaseEnv = typeof testUrl === "string" && testUrl.length > 0 && typeof testAnonKey === "string" && testAnonKey.length > 0;
const describeIfSupabase = hasSupabaseEnv && !(await isSupabaseEgressRestricted(testUrl, testAnonKey)) ? describe : describe.skip;

let getPersonsPage: typeof import("@/lib/data/persons").getPersonsPage;
let getDefaultPersonDetail: typeof import("@/lib/data/persons").getDefaultPersonDetail;

describeIfSupabase("persons data access against the test database", () => {
  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", testUrl as string);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", testAnonKey as string);
    vi.resetModules();

    const persons = await import("@/lib/data/persons");
    getPersonsPage = persons.getPersonsPage;
    getDefaultPersonDetail = persons.getDefaultPersonDetail;
  });

  it("loads the persons page from Supabase", async () => {
    const page = await getPersonsPage(1, 5);

    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(5);
    expect(page.total).toBeGreaterThan(0);
    expect(page.databaseTotal).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it("loads the default person detail from the Supabase test DB", async () => {
    const detail = await getDefaultPersonDetail();

    expect(detail).not.toBeNull();
    expect(detail?.name).not.toBe("");
    expect(detail?.stats.cardsFound).toMatch(/^\d+$/);
    expect(detail?.stats.databaseContains).toMatch(/^\d+$/);
  });
});
