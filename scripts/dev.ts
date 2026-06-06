import { build } from "./build.ts";

const exe = await build();

console.log(`\n> ./${exe}`);
const proc = Bun.spawn([`./${exe}`], {
  cwd: `${import.meta.dir}/..`,
  stdout: "inherit",
  stderr: "inherit",
});
await proc.exited;
