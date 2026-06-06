const INPUT_UP = 0;
const INPUT_DOWN = 1;
const INPUT_LEFT = 2;
const INPUT_RIGHT = 3;
const INPUT_CONFIRM = 4;
const INPUT_QUIT = 5;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Input state
const keysDown = new Set<number>();
const keysPressed = new Set<number>();

function actionForKey(code: string): number | null {
  switch (code) {
    case "ArrowUp":
    case "KeyW":
      return INPUT_UP;
    case "ArrowDown":
    case "KeyS":
      return INPUT_DOWN;
    case "ArrowLeft":
    case "KeyA":
      return INPUT_LEFT;
    case "ArrowRight":
    case "KeyD":
      return INPUT_RIGHT;
    case "Enter":
    case "Space":
      return INPUT_CONFIRM;
    case "Escape":
      return INPUT_QUIT;
    default:
      return null;
  }
}

document.addEventListener("keydown", (e) => {
  const action = actionForKey(e.code);
  if (action !== null) {
    keysDown.add(action);
    keysPressed.add(action);
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  const action = actionForKey(e.code);
  if (action !== null) {
    keysDown.delete(action);
  }
});

// Rgba struct is passed by pointer on wasm ABI — read {r,g,b,a} from memory
function readRgba(ptr: number): string {
  const mem = new Uint8Array(wasm.memory.buffer);
  return `rgba(${mem[ptr]},${mem[ptr + 1]},${mem[ptr + 2]},${mem[ptr + 3]! / 255})`;
}

function readCString(memory: WebAssembly.Memory, ptr: number): string {
  const bytes = new Uint8Array(memory.buffer);
  let end = ptr;
  while (bytes[end] !== 0) end++;
  return new TextDecoder().decode(bytes.subarray(ptr, end));
}

interface WasmExports {
  memory: WebAssembly.Memory;
  game_width: () => number;
  game_height: () => number;
  game_title: () => number; // returns pointer
  game_init: () => void;
  game_tick: (dt: number) => void;
}

let wasm: WasmExports;

const importObject: WebAssembly.Imports = {
  env: {
    platform_clear(rgba: number) {
      ctx.fillStyle = readRgba(rgba);
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    platform_draw_rect(
      x: number,
      y: number,
      w: number,
      h: number,
      rgba: number,
    ) {
      ctx.fillStyle = readRgba(rgba);
      ctx.fillRect(x, y, w, h);
    },
    platform_draw_text(
      ptr: number,
      x: number,
      y: number,
      fontSize: number,
      rgba: number,
    ) {
      const text = readCString(wasm.memory, ptr);
      ctx.fillStyle = readRgba(rgba);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = "top";
      ctx.fillText(text, x, y);
    },
    platform_measure_text(ptr: number, fontSize: number): number {
      const text = readCString(wasm.memory, ptr);
      ctx.font = `${fontSize}px monospace`;
      return Math.ceil(ctx.measureText(text).width);
    },
    platform_input_down(action: number): number {
      return keysDown.has(action) ? 1 : 0;
    },
    platform_input_pressed(action: number): number {
      return keysPressed.has(action) ? 1 : 0;
    },
  },
};

async function main() {
  const resp = await fetch("snake.wasm");
  const { instance } = await WebAssembly.instantiateStreaming(
    resp,
    importObject,
  );
  wasm = instance.exports as unknown as WasmExports;

  canvas.width = wasm.game_width();
  canvas.height = wasm.game_height();
  document.title = readCString(wasm.memory, wasm.game_title());

  wasm.game_init();

  let last = performance.now();
  function frame(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    wasm.game_tick(dt);
    keysPressed.clear();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
