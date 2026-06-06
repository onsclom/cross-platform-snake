import { buildNative } from "./build.ts";

const exe = await buildNative();

console.log(`\n> ./${exe}`);
const proc = Bun.spawn([`./${exe}`], {
  cwd: `${import.meta.dir}/..`,
  stdout: "inherit",
  stderr: "inherit",
});
await proc.exited;
