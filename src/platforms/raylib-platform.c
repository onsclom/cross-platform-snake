#include "platform.h"
#include "raylib.h"

static Color to_ray(Rgba c) { return (Color){c.r, c.g, c.b, c.a}; }

static const int *keys_for(InputAction action) {
  static const int up[] = {KEY_UP, KEY_W, KEY_NULL};
  static const int down[] = {KEY_DOWN, KEY_S, KEY_NULL};
  static const int left[] = {KEY_LEFT, KEY_A, KEY_NULL};
  static const int right[] = {KEY_RIGHT, KEY_D, KEY_NULL};
  static const int confirm[] = {KEY_ENTER, KEY_SPACE, KEY_NULL};
  static const int quit[] = {KEY_ESCAPE, KEY_NULL};
  static const int none[] = {KEY_NULL};
  switch (action) {
  case INPUT_UP:
    return up;
  case INPUT_DOWN:
    return down;
  case INPUT_LEFT:
    return left;
  case INPUT_RIGHT:
    return right;
  case INPUT_CONFIRM:
    return confirm;
  case INPUT_QUIT:
    return quit;
  default:
    return none;
  }
}

void platform_clear(Rgba color) { ClearBackground(to_ray(color)); }

void platform_draw_rect(int x, int y, int width, int height, Rgba color) {
  DrawRectangle(x, y, width, height, to_ray(color));
}

void platform_draw_text(const char *text, int x, int y, int font_size,
                        Rgba color) {
  DrawText(text, x, y, font_size, to_ray(color));
}

int platform_measure_text(const char *text, int font_size) {
  return MeasureText(text, font_size);
}

bool platform_input_down(InputAction action) {
  for (const int *k = keys_for(action); *k != KEY_NULL; k++) {
    if (IsKeyDown(*k))
      return true;
  }
  return false;
}

bool platform_input_pressed(InputAction action) {
  for (const int *k = keys_for(action); *k != KEY_NULL; k++) {
    if (IsKeyPressed(*k))
      return true;
  }
  return false;
}

int main(void) {
  InitWindow(game_width(), game_height(), game_title());

  game_init();
  while (!WindowShouldClose()) {
    float dt = GetFrameTime();
    BeginDrawing();
    game_tick(dt);
    EndDrawing();
  }
  CloseWindow();
  return 0;
}
