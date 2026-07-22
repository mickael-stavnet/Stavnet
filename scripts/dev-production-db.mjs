import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const shell = process.platform === "win32";

function start(args, environment = process.env) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: environment,
    shell,
    stdio: "inherit",
  });
}

function stop(processToStop) {
  if (processToStop.exitCode !== null || processToStop.killed) {
    return;
  }

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(processToStop.pid), "/t", "/f"], { stdio: "ignore" });
    return;
  }

  processToStop.kill("SIGTERM");
}

const worker = start(["run", "dev:worker:production-db"]);
const app = start(["exec", "next", "dev", "--port", "3000"], {
  ...process.env,
  STAVNET_DATA_WORKER_URL: "http://localhost:8787",
});

let isStopping = false;

function shutdown(exitCode) {
  if (isStopping) {
    return;
  }

  isStopping = true;
  stop(worker);
  stop(app);
  process.exit(exitCode);
}

worker.on("exit", (code) => {
  if (!isStopping) {
    shutdown(code ?? 1);
  }
});

app.on("exit", (code) => {
  if (!isStopping) {
    shutdown(code ?? 1);
  }
});

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
