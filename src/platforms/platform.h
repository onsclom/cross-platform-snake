#pragma once

#include <stdbool.h>

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

typedef struct GameConfig {
  int width;
  int height;
  const char *title;
  int target_fps;
} GameConfig;

void platform_clear(Rgba color);
void platform_draw_rect(int x, int y, int width, int height, Rgba color);
void platform_draw_text(const char *text, int x, int y, int font_size,
                        Rgba color);
bool platform_input_down(InputAction action);
bool platform_input_pressed(InputAction action);

GameConfig game_config(void);
void game_init(void);
void game_update(float dt);
void game_shutdown(void);
