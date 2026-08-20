import { createServer } from "node:net";
import { spawn } from "node:child_process";

const MIN_PORT = Number(process.env.DEV_PORT_MIN ?? 3000);
const MAX_PORT = Number(process.env.DEV_PORT_MAX ?? 3099);

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port);
  });
}

let started = false;
for (let port = MIN_PORT; port <= MAX_PORT && !started; port++) {
  if (!(await isPortFree(port))) {
    console.log(`[dev] port ${port} is busy, trying next...`);
    continue;
  }
  console.log(`[dev] starting next dev on port ${port}`);
  started = true;
  const child = spawn(`npx next dev -p ${port}`, {
    stdio: "inherit",
    shell: true,
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

if (!started) {
  console.error(
    `[dev] no free port found in ${MIN_PORT}-${MAX_PORT}. Close something and retry.`,
  );
  process.exit(1);
}
