import { unstable_cache } from "next/cache";
import { logInfo, logWarn } from "@/lib/server-log";

type CacheOptions = Parameters<typeof unstable_cache>[2];

type CacheEntry<Result> = {
  expiresAt: number;
  value: Result;
};

const isDevelopment = process.env.NODE_ENV === "development";
const useLocalMemoryCache = process.env.NODE_ENV !== "production";
const MAX_LOCAL_MEMORY_ENTRIES = 256;
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

function purgeExpiredMemoryEntries(now: number): void {
  if (!useLocalMemoryCache) {
    return;
  }

  for (const [cacheKey, entry] of memoryCache) {
    if (entry.expiresAt <= now) {
      memoryCache.delete(cacheKey);
    }
  }
}

function setMemoryEntry(cacheKey: string, entry: CacheEntry<unknown>): void {
  if (!useLocalMemoryCache) {
    return;
  }

  if (memoryCache.size >= MAX_LOCAL_MEMORY_ENTRIES && !memoryCache.has(cacheKey)) {
    const oldestKey = memoryCache.keys().next().value;

    if (typeof oldestKey === "string") {
      memoryCache.delete(oldestKey);
    }
  }

  memoryCache.set(cacheKey, entry);
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
      if (isDevelopment) {
        logInfo("DEBUG_LOG_INFINITE_FETCH", {
          cacheKey: keyParts.join("|"),
          phase: "source-start",
          args,
        });
      }
      return fn(...args);
    },
    keyParts,
    options,
  ) as (...args: Args) => Promise<Result>;
  const ttlMs = getMemoryTtlMs(options);

  return async (...args: Args) => {
    const cacheKey = buildCacheKey(keyParts, args);
    const now = Date.now();
    purgeExpiredMemoryEntries(now);
    const callCount = isDevelopment ? getCallCount(cacheKey) : 0;
    const memoryEntry = useLocalMemoryCache ? memoryCache.get(cacheKey) : undefined;

    if (isDevelopment) {
      logInfo("DEBUG_LOG_INFINITE_FETCH", {
        cacheKey: keyParts.join("|"),
        phase: "wrapper-enter",
        callCount,
        args,
        hasMemoryEntry: Boolean(memoryEntry),
        hasInFlightEntry: inFlightCache.has(cacheKey),
        ttlMs,
      });
    }

    if (memoryEntry && memoryEntry.expiresAt > now) {
      if (isDevelopment) {
        logInfo("DEBUG_LOG_INFINITE_FETCH", {
          cacheKey: keyParts.join("|"),
          phase: "memory-hit",
          callCount,
          args,
        });
      }
      return memoryEntry.value as Result;
    }

    const inFlight = inFlightCache.get(cacheKey);

    if (inFlight) {
      if (isDevelopment) {
        logInfo("DEBUG_LOG_INFINITE_FETCH", {
          cacheKey: keyParts.join("|"),
          phase: "deduped-in-flight",
          callCount,
          args,
        });
      }
      return inFlight as Promise<Result>;
    }

    const run = (async () => {
      try {
        const result = await cachedFn(...args);

        if (ttlMs > 0) {
          setMemoryEntry(cacheKey, {
            expiresAt: Date.now() + ttlMs,
            value: result,
          });
        }

        if (isDevelopment) {
          logInfo("DEBUG_LOG_INFINITE_FETCH", {
            cacheKey: keyParts.join("|"),
            phase: "wrapper-resolve",
            callCount,
            args,
          });
        }

        return result;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "";

        if (message.includes("incrementalCache missing")) {
          if (isDevelopment) {
            logWarn("DEBUG_LOG_INFINITE_FETCH", {
              cacheKey: keyParts.join("|"),
              phase: "fallback-raw-fn",
              callCount,
              args,
            });
          }

          const result = await fn(...args);

          if (ttlMs > 0) {
            setMemoryEntry(cacheKey, {
              expiresAt: Date.now() + ttlMs,
              value: result,
            });
          }

          return result;
        }

        if (isDevelopment) {
          logWarn("DEBUG_LOG_INFINITE_FETCH", {
            cacheKey: keyParts.join("|"),
            phase: "wrapper-error",
            callCount,
            args,
            error: message || String(error),
          });
        }
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
