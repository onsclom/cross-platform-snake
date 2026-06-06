import { buildWeb } from "./build.ts";
import index from "../src/platforms/web/index.html";

await buildWeb();

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/snake.wasm": new Response(Bun.file("build/web/snake.wasm")),
  },
});

console.log(`\nServing at http://localhost:${server.port}`);
