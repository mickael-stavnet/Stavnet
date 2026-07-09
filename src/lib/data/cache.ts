import { unstable_cache } from "next/cache";
import { logInfo, logWarn } from "@/lib/server-log";

type CacheOptions = Parameters<typeof unstable_cache>[2];

type CacheEntry<Result> = {
  expiresAt: number;
  value: Result;
};

const inFlightCache = new Map<string, Promise<unknown>>();
const memoryCache = new Map<string, CacheEntry<unknown>>();
const cacheCallCounts = new Map<string, number>();

function buildCacheKey(keyParts: string[], args: unknown[]): string {
  return JSON.stringify([keyParts, args]);
}

function getCallCount(cacheKey: string): number {
  const nextCount = (cacheCallCounts.get(cacheKey) ?? 0) + 1;
  cacheCallCounts.set(cacheKey, nextCount);
  return nextCount;
}

function getMemoryTtlMs(options: CacheOptions): number {
  const revalidate = options?.revalidate;

  if (typeof revalidate !== "number" || !Number.isFinite(revalidate) || revalidate <= 0) {
    return 0;
  }

  return revalidate * 1000;
}

export function cacheData<Args extends unknown[], Result>(
  keyParts: string[],
  fn: (...args: Args) => Promise<Result>,
  options: CacheOptions = {},
): (...args: Args) => Promise<Result> {
  const cachedFn = unstable_cache(
    async (...args: Args) => {
      logInfo("DEBUG_LOG_INFINITE_FETCH", {
        cacheKey: keyParts.join("|"),
        phase: "source-start",
        args,
      });
      return fn(...args);
    },
    keyParts,
    options,
  ) as (...args: Args) => Promise<Result>;
  const ttlMs = getMemoryTtlMs(options);

  return async (...args: Args) => {
    const cacheKey = buildCacheKey(keyParts, args);
    const callCount = getCallCount(cacheKey);
    const now = Date.now();
    const memoryEntry = memoryCache.get(cacheKey);

    logInfo("DEBUG_LOG_INFINITE_FETCH", {
      cacheKey: keyParts.join("|"),
      phase: "wrapper-enter",
      callCount,
      args,
      hasMemoryEntry: Boolean(memoryEntry),
      hasInFlightEntry: inFlightCache.has(cacheKey),
      ttlMs,
    });

    if (memoryEntry && memoryEntry.expiresAt > now) {
      logInfo("DEBUG_LOG_INFINITE_FETCH", {
        cacheKey: keyParts.join("|"),
        phase: "memory-hit",
        callCount,
        args,
      });
      return memoryEntry.value as Result;
    }

    const inFlight = inFlightCache.get(cacheKey);

    if (inFlight) {
      logInfo("DEBUG_LOG_INFINITE_FETCH", {
        cacheKey: keyParts.join("|"),
        phase: "deduped-in-flight",
        callCount,
        args,
      });
      return inFlight as Promise<Result>;
    }

    const run = (async () => {
      try {
        const result = await cachedFn(...args);

        if (ttlMs > 0) {
          memoryCache.set(cacheKey, {
            expiresAt: Date.now() + ttlMs,
            value: result,
          });
        }

        logInfo("DEBUG_LOG_INFINITE_FETCH", {
          cacheKey: keyParts.join("|"),
          phase: "wrapper-resolve",
          callCount,
          args,
        });

        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "";

        if (message.includes("incrementalCache missing")) {
          logWarn("DEBUG_LOG_INFINITE_FETCH", {
            cacheKey: keyParts.join("|"),
            phase: "fallback-raw-fn",
            callCount,
            args,
          });

          const result = await fn(...args);

          if (ttlMs > 0) {
            memoryCache.set(cacheKey, {
              expiresAt: Date.now() + ttlMs,
              value: result,
            });
          }

          return result;
        }

        logWarn("DEBUG_LOG_INFINITE_FETCH", {
          cacheKey: keyParts.join("|"),
          phase: "wrapper-error",
          callCount,
          args,
          error: message || String(error),
        });
        throw error;
      } finally {
        inFlightCache.delete(cacheKey);
      }
    })();

    inFlightCache.set(cacheKey, run);

    try {
      return await run;
    } catch (error: unknown) {
      throw error;
    }
  };
}
