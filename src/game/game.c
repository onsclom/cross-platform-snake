#include "../platforms/platform.h"

#define SCREEN_W 800
#define SCREEN_H 450
#define PLAYER_SIZE 40
#define PLAYER_SPEED 300.0f // pixels per second

static float player_x;
static float player_y;

static float clampf(float v, float lo, float hi) {
  if (v < lo)
    return lo;
  if (v > hi)
    return hi;
  return v;
}

GameConfig game_config(void) {
  return (GameConfig){
      .width = SCREEN_W,
      .height = SCREEN_H,
      .title = "move the square (wasd / arrows)",
      .target_fps = 60,
  };
}

void game_init(void) {
  player_x = (SCREEN_W - PLAYER_SIZE) / 2.0f;
  player_y = (SCREEN_H - PLAYER_SIZE) / 2.0f;
}

void game_update(float dt) {
  float dx = 0.0f;
  float dy = 0.0f;
  if (platform_input_down(INPUT_LEFT))
    dx -= 1.0f;
  if (platform_input_down(INPUT_RIGHT))
    dx += 1.0f;
  if (platform_input_down(INPUT_UP))
    dy -= 1.0f;
  if (platform_input_down(INPUT_DOWN))
    dy += 1.0f;

  player_x += dx * PLAYER_SPEED * dt;
  player_y += dy * PLAYER_SPEED * dt;
  player_x = clampf(player_x, 0.0f, SCREEN_W - PLAYER_SIZE);
  player_y = clampf(player_y, 0.0f, SCREEN_H - PLAYER_SIZE);

  platform_clear(COLOR_RAYWHITE);
  platform_draw_rect((int)player_x, (int)player_y, PLAYER_SIZE, PLAYER_SIZE,
                     COLOR_MAROON);
}

void game_shutdown(void) {}
