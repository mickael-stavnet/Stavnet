import { describe, expect, it } from "vitest";
import { isD1WorkerAvailable } from "./d1-worker-availability";

const url = process.env.STAVNET_DATA_TEST_WORKER_URL;
const secret = process.env.STAVNET_DATA_TEST_WORKER_SECRET;
const describeIfD1 = await isD1WorkerAvailable(url, secret) ? describe : describe.skip;

describeIfD1("D1 Worker contracts", () => {
  it("protects and exposes the test data layer", async () => {
    const response = await fetch(`${url}/v1/query`, { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" }, body: JSON.stringify({ table: "data-books", from: 0, to: 0 }) });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { data: unknown[]; count: number };
    expect(payload.data).toHaveLength(1);
    expect(payload.count).toBe(4998);
  });
});
