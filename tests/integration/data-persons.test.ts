import { beforeAll, describe, expect, it, vi } from "vitest";
import { isD1WorkerAvailable } from "./d1-worker-availability";

const testUrl = process.env.STAVNET_DATA_TEST_WORKER_URL;
const testSecret = process.env.STAVNET_DATA_TEST_WORKER_SECRET;

const describeIfD1 = await isD1WorkerAvailable(testUrl, testSecret) ? describe : describe.skip;

let getPersonsPage: typeof import("@/lib/data/persons").getPersonsPage;
let getDefaultPersonDetail: typeof import("@/lib/data/persons").getDefaultPersonDetail;

describeIfD1("persons data access against the D1 test database", () => {
  beforeAll(async () => {
    vi.stubEnv("STAVNET_DATA_WORKER_URL", testUrl as string);
    vi.stubEnv("STAVNET_DATA_WORKER_SECRET", testSecret as string);
    vi.resetModules();

    const persons = await import("@/lib/data/persons");
    getPersonsPage = persons.getPersonsPage;
    getDefaultPersonDetail = persons.getDefaultPersonDetail;
  });

  it("loads the persons page from D1", async () => {
    const page = await getPersonsPage(1, 5);

    expect(page.page).toBe(1);
    expect(page.pageSize).toBe(5);
    expect(page.total).toBeGreaterThan(0);
    expect(page.databaseTotal).toBeGreaterThan(0);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it("loads the default person detail from D1", async () => {
    const detail = await getDefaultPersonDetail();

    expect(detail).not.toBeNull();
    expect(detail?.name).not.toBe("");
    expect(detail?.stats.cardsFound).toMatch(/^\d+$/);
    expect(detail?.stats.databaseContains).toMatch(/^\d+$/);
  }, 20_000);
});
