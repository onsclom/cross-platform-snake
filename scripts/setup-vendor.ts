import { cp, mkdir, rm } from "node:fs/promises";

const RAYLIB_VERSION = "6.0";
const baseUrl = `https://github.com/raysan5/raylib/releases/download/${RAYLIB_VERSION}`;

const root = `${import.meta.dir}/..`;
const vendor = `${root}/vendor/raylib`;

function resolveTarget() {
  const { platform, arch } = process;
  if (platform === "win32") {
    return {
      asset: `raylib-${RAYLIB_VERSION}_win64_mingw-w64.zip`,
      libDir: "windows",
    };
  }
  if (platform === "darwin") {
    return { asset: `raylib-${RAYLIB_VERSION}_macos.tar.gz`, libDir: "macos" };
  }
  if (platform === "linux") {
    const slug =
      arch === "arm64" ? "arm64" : arch === "ia32" ? "i386" : "amd64";
    return {
      asset: `raylib-${RAYLIB_VERSION}_linux_${slug}.tar.gz`,
      libDir: "linux",
    };
  }
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

const { asset, libDir } = resolveTarget();
const header = `${vendor}/include/raylib.h`;
const lib = `${vendor}/lib/${libDir}/libraylib.a`;

if ((await Bun.file(header).exists()) && (await Bun.file(lib).exists())) {
  console.log(
    `vendor/raylib already set up for ${process.platform} (${libDir}).`,
  );
  process.exit(0);
}

async function findTar(): Promise<string | null> {
  const onPath = Bun.which("tar");
  if (onPath) return onPath;
  if (process.platform === "win32") {
    const sys = process.env.SystemRoot ?? "C:\\Windows";
    const builtin = `${sys}\\System32\\tar.exe`;
    if (await Bun.file(builtin).exists()) return builtin;
  }
  return null;
}

const tarBin = await findTar();
if (!tarBin) {
  console.error(
    "Error: `tar` was not found; it's required to extract the raylib archive.",
  );
  process.exit(1);
}

const tmp = `${root}/.vendor-tmp`;
await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });

const url = `${baseUrl}/${asset}`;
console.log(`Fetching ${url}`);
const res = await fetch(url);
if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const archive = `${tmp}/${asset}`;
await Bun.write(archive, res);

console.log("Extracting...");
const untar = Bun.spawn([tarBin, "-xf", archive, "-C", tmp], {
  stdout: "inherit",
  stderr: "inherit",
});
await untar.exited;

const topDir = `${tmp}/${asset.replace(/\.(zip|tar\.gz)$/, "")}`;
const srcHeaderDir = `${topDir}/include`;
const srcLib = `${topDir}/lib/libraylib.a`;

if (
  !(await Bun.file(`${srcHeaderDir}/raylib.h`).exists()) ||
  !(await Bun.file(srcLib).exists())
) {
  console.error(
    "Extraction did not produce the expected include/ and lib/libraylib.a.",
  );
  process.exit(1);
}

await mkdir(`${vendor}/include`, { recursive: true });
await mkdir(`${vendor}/lib/${libDir}`, { recursive: true });
await cp(srcHeaderDir, `${vendor}/include`, { recursive: true });
await Bun.write(lib, Bun.file(srcLib));

await rm(tmp, { recursive: true, force: true });
console.log(
  `Set up vendor/raylib (headers + lib/${libDir}/libraylib.a) for raylib ${RAYLIB_VERSION}.`,
);
