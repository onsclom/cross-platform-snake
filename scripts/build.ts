import { mkdir } from "node:fs/promises";

const root = `${import.meta.dir}/..`;
const cStd = "c99";
const gameSrc = "src/game/game.c";

const nativeTargets = {
  win32: {
    out: "snake.exe",
    libDir: "vendor/raylib/lib/windows",
    systemLibs: ["-lopengl32", "-lgdi32", "-lwinmm"],
  },
  darwin: {
    out: "snake",
    libDir: "vendor/raylib/lib/macos",
    systemLibs: [
      "-framework",
      "CoreVideo",
      "-framework",
      "IOKit",
      "-framework",
      "Cocoa",
      "-framework",
      "GLUT",
      "-framework",
      "OpenGL",
    ],
  },
  linux: {
    out: "snake",
    libDir: "vendor/raylib/lib/linux",
    systemLibs: ["-lGL", "-lm", "-lpthread", "-ldl", "-lrt", "-lX11"],
  },
} as const;

function ensureZig() {
  if (!Bun.which("zig")) {
    console.error(
      "Error: `zig` not found on PATH. Install: https://ziglang.org/learn/getting-started/",
    );
    process.exit(1);
  }
}

async function zig(args: string[]) {
  console.log(`> zig ${args.join(" ")}`);
  const proc = Bun.spawn(["zig", ...args], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
  if (proc.exitCode !== 0) {
    console.error(`Build failed (exit ${proc.exitCode}).`);
    process.exit(proc.exitCode ?? 1);
  }
}

export async function buildNative(): Promise<string> {
  const target = nativeTargets[process.platform as keyof typeof nativeTargets];
  if (!target) {
    console.error(`Unsupported platform: ${process.platform}`);
    process.exit(1);
  }

  ensureZig();
  await mkdir(`${root}/build`, { recursive: true });

  await zig([
    "cc",
    gameSrc,
    "src/platforms/raylib-platform.c",
    "-o",
    `build/${target.out}`,
    `-std=${cStd}`,
    "-I",
    "vendor/raylib/include",
    "-L",
    target.libDir,
    "-lraylib",
    ...target.systemLibs,
  ]);

  console.log(`Built build/${target.out}`);
  return `build/${target.out}`;
}

export async function buildWeb(): Promise<void> {
  ensureZig();
  const outDir = `${root}/build/web`;
  await mkdir(outDir, { recursive: true });

  await zig([
    "cc",
    gameSrc,
    "-target",
    "wasm32-freestanding",
    `-std=${cStd}`,
    "-O2",
    "-o",
    `${outDir}/snake.wasm`,
    "-Wl,--no-entry",
    "-Wl,--export-dynamic",
    "-Wl,--export-memory",
  ]);

  console.log(`Built ${outDir}/snake.wasm`);
}

if (import.meta.main) {
  const target = process.argv[2];
  if (target === "web") {
    await buildWeb();
  } else {
    await buildNative();
  }
}
