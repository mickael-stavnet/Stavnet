import "server-only";

type LogLevel = "INFO" | "WARN" | "ERROR";

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_, current) => {
        if (current instanceof Error) {
          return {
            name: current.name,
            message: current.message,
            stack: current.stack,
          };
        }
        return current;
      },
      2,
    );
  } catch {
    return String(value);
  }
}

function write(level: LogLevel, title: string, emoji: string, payload?: unknown): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const prefix = `[${title}] ${emoji} [${level}]`;
  if (payload === undefined) {
    console.log(prefix);
    return;
  }
  console.log(`${prefix}\n${safeSerialize(payload)}`);
}

export function logInfo(title: string, payload?: unknown): void {
  write("INFO", title, "🔹", payload);
}

export function logWarn(title: string, payload?: unknown): void {
  write("WARN", title, "⚠️", payload);
}

export function logError(title: string, payload?: unknown): void {
  write("ERROR", title, "🔥", payload);
}
