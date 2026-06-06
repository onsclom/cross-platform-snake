#include "../platforms/platform.h"

#define SCREEN_W 800
#define SCREEN_H 450

#define PADDLE_W 12
#define PADDLE_H 80
#define PADDLE_X 20
#define PADDLE_SPEED 420.0f

#define BALL_SIZE 12
#define BALL_SPEED_INIT 320.0f
#define BALL_SPEED_INC 18.0f

static float paddle_y;
static float ball_x, ball_y;
static float ball_dx, ball_dy;
static int score;
static bool dead;

static int int_to_str(int n, char *buf, int buf_size) {
  if (buf_size <= 0)
    return 0;
  char tmp[16];
  int len = 0;
  bool neg = false;
  if (n < 0) {
    neg = true;
    n = -n;
  }
  if (n == 0) {
    tmp[len++] = '0';
  } else {
    while (n > 0) {
      tmp[len++] = '0' + (n % 10);
      n /= 10;
    }
  }
  if (neg)
    tmp[len++] = '-';
  int out = 0;
  for (int i = len - 1; i >= 0 && out < buf_size - 1; i--)
    buf[out++] = tmp[i];
  buf[out] = '\0';
  return out;
}

static void draw_text_centered(const char *text, int cx, int y, int font_size,
                               Rgba color) {
  int w = platform_measure_text(text, font_size);
  platform_draw_text(text, cx - w / 2, y, font_size, color);
}

static float clampf(float v, float lo, float hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

static void launch_ball(void) {
  ball_x = SCREEN_W * 0.4f;
  ball_y = SCREEN_H * 0.5f;
  ball_dx = BALL_SPEED_INIT;
  ball_dy = BALL_SPEED_INIT * 0.65f;
}

WASM_EXPORT(game_width) int game_width(void) { return SCREEN_W; }
WASM_EXPORT(game_height) int game_height(void) { return SCREEN_H; }
WASM_EXPORT(game_title) const char *game_title(void) { return "volley"; }

WASM_EXPORT(game_init)
void game_init(void) {
  paddle_y = (SCREEN_H - PADDLE_H) / 2.0f;
  score = 0;
  dead = false;
  launch_ball();
}

WASM_EXPORT(game_tick)
void game_tick(float dt) {
  if (dead) {
    platform_clear(COLOR_BLACK);
    char score_buf[32] = "score: ";
    int_to_str(score, score_buf + 7, sizeof(score_buf) - 7);
    draw_text_centered("GAME OVER", SCREEN_W / 2, SCREEN_H / 2 - 36, 32,
                       COLOR_WHITE);
    draw_text_centered(score_buf, SCREEN_W / 2, SCREEN_H / 2 + 8, 22,
                       COLOR_WHITE);
    draw_text_centered("enter to restart", SCREEN_W / 2, SCREEN_H / 2 + 44, 18,
                       COLOR_RAYWHITE);
    if (platform_input_pressed(INPUT_CONFIRM))
      game_init();
    return;
  }

  if (platform_input_down(INPUT_UP))
    paddle_y -= PADDLE_SPEED * dt;
  if (platform_input_down(INPUT_DOWN))
    paddle_y += PADDLE_SPEED * dt;
  paddle_y = clampf(paddle_y, 0.0f, SCREEN_H - PADDLE_H);

  ball_x += ball_dx * dt;
  ball_y += ball_dy * dt;

  if (ball_y < 0) {
    ball_y = 0;
    ball_dy = -ball_dy;
  }
  if (ball_y + BALL_SIZE > SCREEN_H) {
    ball_y = SCREEN_H - BALL_SIZE;
    ball_dy = -ball_dy;
  }

  if (ball_x + BALL_SIZE > SCREEN_W) {
    ball_x = SCREEN_W - BALL_SIZE;
    ball_dx = -ball_dx;
  }

  if (ball_dx < 0 && ball_x <= PADDLE_X + PADDLE_W &&
      ball_x + BALL_SIZE >= PADDLE_X && ball_y + BALL_SIZE >= paddle_y &&
      ball_y <= paddle_y + PADDLE_H) {
    ball_x = PADDLE_X + PADDLE_W;
    ball_dx = -ball_dx + BALL_SPEED_INC; // reflect and speed up
    score++;
  }

  if (ball_x + BALL_SIZE < 0)
    dead = true;

  platform_clear(COLOR_BLACK);
  platform_draw_rect(SCREEN_W - 6, 0, 6, SCREEN_H, COLOR_WHITE);
  platform_draw_rect(PADDLE_X, (int)paddle_y, PADDLE_W, PADDLE_H, COLOR_WHITE);
  platform_draw_rect((int)ball_x, (int)ball_y, BALL_SIZE, BALL_SIZE,
                     COLOR_WHITE);

  char hud[16];
  int_to_str(score, hud, sizeof(hud));
  draw_text_centered(hud, SCREEN_W / 2, 14, 26, COLOR_WHITE);
}
