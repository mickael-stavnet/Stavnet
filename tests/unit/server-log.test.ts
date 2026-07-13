import { afterEach, describe, expect, it, vi } from "vitest";

describe("server logger", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("does not emit application logs outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { logError, logInfo, logWarn } = await import("@/lib/server-log");

    logInfo("PRODUCTION_INFO", { secret: "hidden" });
    logWarn("PRODUCTION_WARN", { secret: "hidden" });
    logError("PRODUCTION_ERROR", { secret: "hidden" });

    expect(consoleLog).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("emits logs in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const { logInfo } = await import("@/lib/server-log");

    logInfo("DEVELOPMENT_INFO", { value: 1 });

    expect(consoleLog).toHaveBeenCalledOnce();
  });
});
