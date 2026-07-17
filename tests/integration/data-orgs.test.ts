import { beforeAll, describe, expect, it, vi } from "vitest";
import { isSupabaseEgressRestricted } from "./supabase-availability";

const testUrl = process.env.SUPABASE_TEST_URL;
const testAnonKey = process.env.SUPABASE_TEST_ANON_KEY;

const hasSupabaseEnv = typeof testUrl === "string" && testUrl.length > 0 && typeof testAnonKey === "string" && testAnonKey.length > 0;
const describeIfSupabase = hasSupabaseEnv && !(await isSupabaseEgressRestricted(testUrl, testAnonKey)) ? describe : describe.skip;

let getOrganizationsPage: typeof import("@/lib/data/orgs").getOrganizationsPage;
let getOrganizationDetailByName: typeof import("@/lib/data/orgs").getOrganizationDetailByName;
let getDefaultOrganizationDetail: typeof import("@/lib/data/orgs").getDefaultOrganizationDetail;

describeIfSupabase("organizations data access against the test database", () => {
  beforeAll(async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", testUrl as string);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", testAnonKey as string);
    vi.resetModules();

    const orgs = await import("@/lib/data/orgs");
    getOrganizationsPage = orgs.getOrganizationsPage;
    getOrganizationDetailByName = orgs.getOrganizationDetailByName;
    getDefaultOrganizationDetail = orgs.getDefaultOrganizationDetail;
  });

  it("loads the organizations page from Supabase", async () => {
    const page = await getOrganizationsPage(1, 5);

    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(5);
    expect(page.total).toBeGreaterThan(0);
    expect(page.databaseTotal).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it("loads an organization detail from the Supabase test DB", async () => {
    const page = await getOrganizationsPage(1, 1);
    const first = page.items[0];

    expect(first).toBeDefined();
    if (!first) {
      throw new Error("Expected at least one organization in the test database");
    }

    const detail = await getOrganizationDetailByName(first.name);

    expect(detail).not.toBeNull();
    expect(detail?.name).toBe(first.name);
    expect(detail?.publishedRows).toBeInstanceOf(Array);
  });

  it("loads the default organization detail from the Supabase test DB", async () => {
    const detail = await getDefaultOrganizationDetail();

    expect(detail).not.toBeNull();
    expect(detail?.name).not.toBe("");
    expect(detail?.stats.cardsFound).toMatch(/^\d+$/);
    expect(detail?.stats.databaseContains).toMatch(/^\d+$/);
  });
});
