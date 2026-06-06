import { mkdir } from "node:fs/promises";

const root = `${import.meta.dir}/..`;
const sources = ["src/game/game.c", "src/platforms/raylib-platform.c"];
const includeDir = "vendor/raylib/include";
const cStd = "c99";

const targets = {
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

const target = targets[process.platform as keyof typeof targets];
if (!target) {
  console.error(`Unsupported platform: ${process.platform}`);
  process.exit(1);
}

const flagsPath = `${root}/compile_flags.txt`;
if (!(await Bun.file(flagsPath).exists())) {
  await Bun.write(flagsPath, `-I${includeDir}\n-std=${cStd}\n`);
  console.log("Generated compile_flags.txt");
}

if (!Bun.which("zig")) {
  console.error(
    [
      "Error: `zig` was not found on your PATH.",
      "This project compiles with `zig cc`, so you need Zig installed.",
      "",
      "Install it: https://ziglang.org/learn/getting-started/#installing-zig",
    ].join("\n"),
  );
  process.exit(1);
}

await mkdir(`${root}/build`, { recursive: true });

const args = [
  "cc",
  ...sources,
  "-o",
  `build/${target.out}`,
  `-std=${cStd}`,
  "-I",
  includeDir,
  "-L",
  target.libDir,
  "-lraylib",
  ...target.systemLibs,
];

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
console.log(`Built build/${target.out}`);
