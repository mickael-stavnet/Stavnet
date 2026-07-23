import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { resolve } from "node:path";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const shell = process.platform === "win32";

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

await ensurePortAvailable(3000);

const worker = start(["run", "dev:worker:local-db"]);
const app = start(["exec", "next", "dev", "--port", "3000"], {
  ...process.env,
  STAVNET_DATA_WORKER_URL: "http://localhost:8787",
  STAVNET_DATA_WORKER_SECRET: getLocalWorkerSecret(),
});

let isStopping = false;

async function shutdown(exitCode) {
  if (isStopping) {
    return;
  }

  isStopping = true;
  await Promise.all([stop(worker), stop(app)]);
  process.exit(exitCode);
}

worker.on("exit", (code) => {
  if (!isStopping) {
    void shutdown(code ?? 1);
  }
});

app.on("exit", (code) => {
  if (!isStopping) {
    void shutdown(code ?? 1);
  }
});

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));
