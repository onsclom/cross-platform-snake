#pragma once

#include <stdbool.h>

#ifdef __wasm__
#define WASM_EXPORT(name) __attribute__((export_name(#name)))
#define WASM_IMPORT(name) __attribute__((import_module("env"), import_name(#name)))
#else
#define WASM_EXPORT(name)
#define WASM_IMPORT(name)
#endif

typedef struct Rgba {
  unsigned char r, g, b, a;
} Rgba;

#define COLOR_RAYWHITE ((Rgba){245, 245, 245, 255})
#define COLOR_MAROON ((Rgba){190, 33, 55, 255})
#define COLOR_BLACK ((Rgba){0, 0, 0, 255})
#define COLOR_WHITE ((Rgba){255, 255, 255, 255})

typedef enum InputAction {
  INPUT_UP,
  INPUT_DOWN,
  INPUT_LEFT,
  INPUT_RIGHT,
  INPUT_CONFIRM,
  INPUT_QUIT,
  INPUT_COUNT
} InputAction;

WASM_IMPORT(platform_clear)         void platform_clear(Rgba color);
WASM_IMPORT(platform_draw_rect)     void platform_draw_rect(int x, int y, int width, int height, Rgba color);
WASM_IMPORT(platform_draw_text)     void platform_draw_text(const char *text, int x, int y, int font_size, Rgba color);
WASM_IMPORT(platform_measure_text)  int  platform_measure_text(const char *text, int font_size);
WASM_IMPORT(platform_input_down)    bool platform_input_down(InputAction action);
WASM_IMPORT(platform_input_pressed) bool platform_input_pressed(InputAction action);
int game_width(void);
int game_height(void);
const char *game_title(void);
void game_init(void);
void game_tick(float dt);
