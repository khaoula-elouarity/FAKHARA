import { pathToFileURL } from "node:url";

import { createApp } from "./app.js";

const app = createApp();

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export { app };
export default app;

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await import("./dev.js");
}
