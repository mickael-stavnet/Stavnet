import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const shell = process.platform === "win32";
const workerUrl = "http://localhost:8787";

function getLocalWorkerSecret() {
  const devVarsPath = resolve(process.cwd(), "cloudflare", ".dev.vars");
  const line = readFileSync(devVarsPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("STAVNET_DATA_API_SECRET="));

  if (!line) {
    throw new Error("La variable STAVNET_DATA_API_SECRET est absente de cloudflare/.dev.vars.");
  }

  const secret = line.slice("STAVNET_DATA_API_SECRET=".length).trim();

  if (!secret) {
    throw new Error("La variable STAVNET_DATA_API_SECRET est vide dans cloudflare/.dev.vars.");
  }

  return secret.replace(/^['\"]|['\"]$/g, "");
}

function start(args, environment = process.env) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: environment,
    shell,
    stdio: "inherit",
  });
}

async function waitForWorker(secret, worker) {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    if (worker.exitCode !== null || worker.killed) {
      throw new Error("Le Worker local s'est arrêté avant de devenir disponible.");
    }

    try {
      const response = await fetch(`${workerUrl}/v1/showcase`, {
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(1_000),
      });

      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }

  throw new Error("Le Worker local n'est pas devenu disponible sur http://localhost:8787 après 30 secondes.");
}

function ensurePortAvailable(port) {
  return new Promise((resolvePromise, rejectPromise) => {
    const probe = createServer();

    probe.once("error", (error) => {
      if ("code" in error && error.code === "EADDRINUSE") {
        rejectPromise(new Error(`Le port ${port} est déjà utilisé. Arrêtez le serveur existant ou utilisez un autre port.`));
        return;
      }

      rejectPromise(error);
    });

    probe.listen({ port, host: "::", exclusive: true }, () => {
      probe.close((error) => {
        if (error) {
          rejectPromise(error);
          return;
        }

        resolvePromise();
      });
    });
  });
}

function stop(processToStop) {
  if (!processToStop) {
    return Promise.resolve();
  }

  if (processToStop.exitCode !== null || processToStop.killed) {
    return Promise.resolve();
  }

  if (process.platform === "win32") {
    return new Promise((resolvePromise) => {
      const taskkill = spawn("taskkill", ["/pid", String(processToStop.pid), "/t", "/f"], { stdio: "ignore" });
      taskkill.once("error", resolvePromise);
      taskkill.once("exit", resolvePromise);
    });
  }

  processToStop.kill("SIGTERM");
  return Promise.resolve();
}

let isStopping = false;
let app;

async function shutdown(exitCode) {
  if (isStopping) {
    return;
  }

  isStopping = true;
  await Promise.all([stop(worker), stop(app)]);
  process.exit(exitCode);
}

await ensurePortAvailable(3000);

const secret = getLocalWorkerSecret();
const worker = start(["run", "dev:worker:local-db"]);

worker.on("exit", (code) => {
  if (!isStopping) {
    void shutdown(code ?? 1);
  }
});

try {
  await waitForWorker(secret, worker);
} catch (error) {
  await shutdown(1);
  throw error;
}

app = start(["exec", "next", "dev", "--port", "3000"], {
  ...process.env,
  STAVNET_DATA_WORKER_URL: workerUrl,
  STAVNET_DATA_WORKER_SECRET: secret,
});

app.on("exit", (code) => {
  if (!isStopping) {
    void shutdown(code ?? 1);
  }
});

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
