import { beforeAll, describe, expect, it, vi } from "vitest";

const testUrl = process.env.SUPABASE_TEST_URL;
const testAnonKey = process.env.SUPABASE_TEST_ANON_KEY;

if (!testUrl || !testAnonKey) {
  throw new Error("Missing Supabase test environment variables");
}

let getPersonsPage: typeof import("@/lib/data/persons").getPersonsPage;
let getDefaultPersonDetail: typeof import("@/lib/data/persons").getDefaultPersonDetail;

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", testUrl);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", testAnonKey);
  vi.resetModules();

  const persons = await import("@/lib/data/persons");
  getPersonsPage = persons.getPersonsPage;
  getDefaultPersonDetail = persons.getDefaultPersonDetail;
});

describe("persons data access against the test database", () => {
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
