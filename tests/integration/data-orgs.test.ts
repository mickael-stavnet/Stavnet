import { beforeAll, describe, expect, it, vi } from "vitest";
import { isD1WorkerAvailable } from "./d1-worker-availability";

const testUrl = process.env.STAVNET_DATA_TEST_WORKER_URL;
const testSecret = process.env.STAVNET_DATA_TEST_WORKER_SECRET;

const describeIfD1 = await isD1WorkerAvailable(testUrl, testSecret) ? describe : describe.skip;

let getOrganizationsPage: typeof import("@/lib/data/orgs").getOrganizationsPage;
let getOrganizationDetailByName: typeof import("@/lib/data/orgs").getOrganizationDetailByName;
let getDefaultOrganizationDetail: typeof import("@/lib/data/orgs").getDefaultOrganizationDetail;

describeIfD1("organizations data access against the D1 test database", () => {
  beforeAll(async () => {
    vi.stubEnv("STAVNET_DATA_WORKER_URL", testUrl as string);
    vi.stubEnv("STAVNET_DATA_WORKER_SECRET", testSecret as string);
    vi.resetModules();

    const orgs = await import("@/lib/data/orgs");
    getOrganizationsPage = orgs.getOrganizationsPage;
    getOrganizationDetailByName = orgs.getOrganizationDetailByName;
    getDefaultOrganizationDetail = orgs.getDefaultOrganizationDetail;
  });

  it("loads the organizations page from D1", async () => {
    const page = await getOrganizationsPage(1, 5);

    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(5);
    expect(page.total).toBeGreaterThan(0);
    expect(page.databaseTotal).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it("loads an organization detail from the D1 test database", async () => {
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
  }, 20_000);

  it("loads the default organization detail from the Supabase test DB", async () => {
    const detail = await getDefaultOrganizationDetail();

    expect(detail).not.toBeNull();
    expect(detail?.name).not.toBe("");
    expect(detail?.stats.cardsFound).toMatch(/^\d+$/);
    expect(detail?.stats.databaseContains).toMatch(/^\d+$/);
  });
});
