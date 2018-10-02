#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <emscripten.h>
#include <math.h>
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include "config.h"
#include "cube.h"
#include "item.h"
#include "map.h"
#include "matrix.h"
#include "noise.h"
#include "sign.h"
#include "tinycthread.h"
#include "util.h"
#include "world.h"

#define MAX_CHUNKS 1024
#define MAX_PLAYERS 128
#define WORKERS 4
#define MAX_NAME_LENGTH 32

#define ALIGN_LEFT 0
#define ALIGN_CENTER 1
#define ALIGN_RIGHT 2

#define WORKER_IDLE 0
#define WORKER_BUSY 1
#define WORKER_DONE 2

#define BUILD_MODE_SINGLE 0
#define BUILD_MODE_FLOOR 1
#define BUILD_MODE_WALL 2

typedef struct {
    Chunk c;
    int faces;
    int sign_faces;
    GLuint buffer;
    GLuint sign_buffer;
} ClientChunk;

typedef struct {
    int p;
    int q;
    int r;
    int faces;
    Map *block_maps[3][3][3];
    Map *light_maps[3][3][3];
    GLfloat *data;
} WorkerItem;

typedef struct {
    int index;
    int state;
    thrd_t thrd;
    mtx_t mtx;
    cnd_t cnd;
    WorkerItem item;
} Worker;

typedef struct {
    int x;
    int y;
    int z;
    int w;
} Block;

typedef struct {
    float x;
    float y;
    float z;
    float rx;
    float ry;
    float t;
} State;

typedef struct {
    int id;
    int current_item;
    char name[MAX_NAME_LENGTH];
    State state;
    GLuint buffer;
} Player;

typedef struct {
    GLuint program;
    GLuint position;
    GLuint normal;
    GLuint uv;
    GLuint matrix;
    GLuint sampler;
    GLuint camera;
    GLuint timer;
    GLuint extra1;
    GLuint extra2;
    GLuint extra3;
    GLuint extra4;
} Attrib;

typedef struct {
    ClientChunk chunks[MAX_CHUNKS];
    Player players[MAX_PLAYERS];
    int worker_radius;
    int render_radius;
    int delete_radius;
    int sign_radius;
    int width;
    int height;
    int build_mode;
    int build_rot;
    int scale;
    int ortho;
    float fov;
    int time;
    int day_length;
    int time_changed;
    struct {
        int x, y, z;
    } p; // A struct for holding temporary coords
    GLFWwindow *window;
    Worker workers[WORKERS];
} Model;

static Model model;
static Model *g = &model;

Model* get_model_mem_location() {
    return g;
}

Player* get_players_mem_location() {
    return g->players;
}

Player* get_unused_player_mem_location() {
    for (int i = 1; i < MAX_PLAYERS; i++) {
        Player *p = g->players + i;
        if (p->id == 0) return p;
    }

    return NULL;
}

Worker* get_workers_mem_location() {
    return g->workers;
}

Chunk* get_unused_chunk_mem_location() {
    for (int i = 1; i < MAX_CHUNKS; i++) {
        Chunk *chunk = &(g->chunks + i)->c;
        if (!chunk->active) return chunk;
    }

    return NULL;
}

int chunked(float x) {
    return (int)floorf(roundf(x) / CHUNK_SIZE);
}

float time_of_day() {
    return (g->time % g->day_length) / (float)g->day_length;
}

float get_daylight() {
    float timer = time_of_day();
    if (timer < 0.5) {
        float t = (timer - 0.25f) * 100;
        return 1 / (1 + powf(2, -t));
    }
    else {
        float t = (timer - 0.85f) * 100;
        return 1 - 1 / (1 + powf(2, -t));
    }
}

int get_scale_factor() {
    int window_width, window_height;
    int buffer_width, buffer_height;
    glfwGetWindowSize(g->window, &window_width, &window_height);
    glfwGetFramebufferSize(g->window, &buffer_width, &buffer_height);
    int result = buffer_width / window_width;
    result = MAX(1, result);
    result = MIN(2, result);
    return result;
}

void get_sight_vector(float rx, float ry, float *vx, float *vy, float *vz) {
    float m = cosf(ry);
    *vx = cosf(rx - RADIANS(90)) * m;
    *vy = sinf(ry);
    *vz = sinf(rx - RADIANS(90)) * m;
}

GLuint gen_crosshair_buffer() {
    int x = g->width / 2;
    int y = g->height / 2;
    int p = 10 * g->scale;
    float data[] = {
        x, y - p, x, y + p,
        x - p, y, x + p, y
    };
    return gen_buffer(sizeof(data), data);
}

GLuint gen_wireframe_buffer(float x, float y, float z, float n) {
    float data[72];
    make_cube_wireframe(data, x, y, z, n);
    return gen_buffer(sizeof(data), data);
}

GLuint gen_sky_buffer() {
    float data[12288];
    make_sphere(data, 1, 3);
    return gen_buffer(sizeof(data), data);
}

GLuint gen_cube_buffer(float x, float y, float z, float n, int w) {
    GLfloat *data = malloc_faces(10, 6);
    float ao[6][4] = {0};
    float light[6][4] = {
        {0.5, 0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5, 0.5},
        {0.5, 0.5, 0.5, 0.5}
    };
    make_cube(data, ao, light, 1, 1, 1, 1, 1, 1, x, y, z, n, w);
    return gen_faces(10, 6, data);
}

GLuint gen_plant_buffer(float x, float y, float z, float n, int w) {
    GLfloat *data = malloc_faces(10, 4);
    float ao = 0;
    float light = 1;
    make_plant(data, ao, light, x, y, z, n, w, 45);
    return gen_faces(10, 4, data);
}

GLuint gen_player_buffer(float x, float y, float z, float rx, float ry) {
    GLfloat *data = malloc_faces(10, 6);
    make_player(data, x, y, z, rx, ry);
    return gen_faces(10, 6, data);
}

void gen_player_buffers() {
    // generate buffers for all active players
    for (int i = 0; i < MAX_PLAYERS; i++) {
        Player *p = g->players + i;
        del_buffer(p->buffer); // if buffer doesn't exist then it will be silently ignored

        if (p->id != 0) {
            // player is active
            State *s = &p->state;
            p->buffer = gen_player_buffer(s->x, s->y, s->z, s->rx, s->ry);
        }
    }
}

GLuint gen_text_buffer(float x, float y, float n, char *text) {
    int length = (int)strlen(text);
    GLfloat *data = malloc_faces(4, length);
    for (int i = 0; i < length; i++) {
        make_character(data + i * 24, x, y, n / 2, n, text[i]);
        x += n;
    }
    return gen_faces(4, length, data);
}

void draw_triangles_3d_ao(Attrib *attrib, GLuint buffer, int count) {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glEnableVertexAttribArray(attrib->position);
    glEnableVertexAttribArray(attrib->normal);
    glEnableVertexAttribArray(attrib->uv);
    glVertexAttribPointer(attrib->position, 3, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 10, 0);
    glVertexAttribPointer(attrib->normal, 3, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 10, (GLvoid *)(sizeof(GLfloat) * 3));
    glVertexAttribPointer(attrib->uv, 4, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 10, (GLvoid *)(sizeof(GLfloat) * 6));
    glDrawArrays(GL_TRIANGLES, 0, count);
    glDisableVertexAttribArray(attrib->position);
    glDisableVertexAttribArray(attrib->normal);
    glDisableVertexAttribArray(attrib->uv);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void draw_triangles_3d_text(Attrib *attrib, GLuint buffer, int count) {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glEnableVertexAttribArray(attrib->position);
    glEnableVertexAttribArray(attrib->uv);
    glVertexAttribPointer(attrib->position, 3, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 5, 0);
    glVertexAttribPointer(attrib->uv, 2, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 5, (GLvoid *)(sizeof(GLfloat) * 3));
    glDrawArrays(GL_TRIANGLES, 0, count);
    glDisableVertexAttribArray(attrib->position);
    glDisableVertexAttribArray(attrib->uv);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void draw_triangles_3d(Attrib *attrib, GLuint buffer, int count) {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glEnableVertexAttribArray(attrib->position);
    glEnableVertexAttribArray(attrib->normal);
    glEnableVertexAttribArray(attrib->uv);
    glVertexAttribPointer(attrib->position, 3, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 8, 0);
    glVertexAttribPointer(attrib->normal, 3, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 8, (GLvoid *)(sizeof(GLfloat) * 3));
    glVertexAttribPointer(attrib->uv, 2, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 8, (GLvoid *)(sizeof(GLfloat) * 6));
    glDrawArrays(GL_TRIANGLES, 0, count);
    glDisableVertexAttribArray(attrib->position);
    glDisableVertexAttribArray(attrib->normal);
    glDisableVertexAttribArray(attrib->uv);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void draw_triangles_2d(Attrib *attrib, GLuint buffer, int count) {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glEnableVertexAttribArray(attrib->position);
    glEnableVertexAttribArray(attrib->uv);
    glVertexAttribPointer(attrib->position, 2, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 4, 0);
    glVertexAttribPointer(attrib->uv, 2, GL_FLOAT, GL_FALSE,
        sizeof(GLfloat) * 4, (GLvoid *)(sizeof(GLfloat) * 2));
    glDrawArrays(GL_TRIANGLES, 0, count);
    glDisableVertexAttribArray(attrib->position);
    glDisableVertexAttribArray(attrib->uv);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void draw_lines(Attrib *attrib, GLuint buffer, int components, int count) {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
    glEnableVertexAttribArray(attrib->position);
    glVertexAttribPointer(
        attrib->position, components, GL_FLOAT, GL_FALSE, 0, 0);
    glDrawArrays(GL_LINES, 0, count);
    glDisableVertexAttribArray(attrib->position);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void draw_chunk(Attrib *attrib, ClientChunk *chunk) {
    draw_triangles_3d_ao(attrib, chunk->buffer, chunk->faces * 6);
}

void draw_item(Attrib *attrib, GLuint buffer, int count) {
    draw_triangles_3d_ao(attrib, buffer, count);
}

void draw_text(Attrib *attrib, GLuint buffer, int length) {
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    draw_triangles_2d(attrib, buffer, length * 6);
    glDisable(GL_BLEND);
}

void draw_signs(Attrib *attrib, ClientChunk *chunk) {
    glEnable(GL_POLYGON_OFFSET_FILL);
    glPolygonOffset(-8, -1024);
    draw_triangles_3d_text(attrib, chunk->sign_buffer, chunk->sign_faces * 6);
    glDisable(GL_POLYGON_OFFSET_FILL);
}

void draw_sign(Attrib *attrib, GLuint buffer, int length) {
    glEnable(GL_POLYGON_OFFSET_FILL);
    glPolygonOffset(-8, -1024);
    draw_triangles_3d_text(attrib, buffer, length * 6);
    glDisable(GL_POLYGON_OFFSET_FILL);
}

void draw_cube(Attrib *attrib, GLuint buffer) {
    draw_item(attrib, buffer, 36);
}

void draw_plant(Attrib *attrib, GLuint buffer) {
    draw_item(attrib, buffer, 24);
}

void draw_player(Attrib *attrib, Player *player) {
    draw_cube(attrib, player->buffer);
}

float player_player_distance(Player *p1, Player *p2) {
    State *s1 = &p1->state;
    State *s2 = &p2->state;
    float x = s2->x - s1->x;
    float y = s2->y - s1->y;
    float z = s2->z - s1->z;
    return sqrtf(x * x + y * y + z * z);
}

float player_crosshair_distance(Player *p1, Player *p2) {
    State *s1 = &p1->state;
    State *s2 = &p2->state;
    float d = player_player_distance(p1, p2);
    float vx, vy, vz;
    get_sight_vector(s1->rx, s1->ry, &vx, &vy, &vz);
    vx *= d; vy *= d; vz *= d;
    float px, py, pz;
    px = s1->x + vx; py = s1->y + vy; pz = s1->z + vz;
    float x = s2->x - px;
    float y = s2->y - py;
    float z = s2->z - pz;
    return sqrtf(x * x + y * y + z * z);
}

Player *player_crosshair(Player *player) {
    Player *result = 0;
    float threshold = RADIANS(5);
    float best = 0;
    for (int i = 0; i < MAX_PLAYERS; i++) {
        Player *other = g->players + i;
        if (other == player || other->id == 0) {
            continue;
        }
        float p = player_crosshair_distance(player, other);
        float d = player_player_distance(player, other);
        if (d < 96 && p / d < threshold) {
            if (best == 0 || d < best) {
                best = d;
                result = other;
            }
        }
    }
    return result;
}

// TODO: Speedup using a hash map or something
ClientChunk *find_chunk(int p, int q, int r) {
    for (int i = 0; i < MAX_CHUNKS; i++) {
        ClientChunk *chunk = g->chunks + i;
        if (chunk->c.active && chunk->c.p == p && chunk->c.q == q && chunk->c.r == r) {
            return chunk;
        }
    }
    return 0;
}

int chunk_distance(ClientChunk *chunk, int p, int q, int r) {
    int dp = ABS(chunk->c.p - p);
    int dq = ABS(chunk->c.q - q);
    int dr = ABS(chunk->c.r - r);
    return MAX(MAX(dp, dq), dr);
}

// TODO: Make work with 'r' coordinate
int chunk_visible(float planes[6][4], int p, int q, int r) {
    int x = p * CHUNK_SIZE - 1;
    int y = r * CHUNK_SIZE - 1;
    int z = q * CHUNK_SIZE - 1;
    int d = CHUNK_SIZE + 1;
    float points[8][3] = {
        {x + 0, y + 0, z + 0},
        {x + d, y + 0, z + 0},
        {x + 0, y + 0, z + d},
        {x + d, y + 0, z + d},
        {x + 0, y + d, z + 0},
        {x + d, y + d, z + 0},
        {x + 0, y + d, z + d},
        {x + d, y + d, z + d}
    };
    int n = g->ortho ? 4 : 6;
    for (int i = 0; i < n; i++) {
        int in = 0;
        int out = 0;
        for (int j = 0; j < 8; j++) {
            float dd =
                planes[i][0] * points[j][0] +
                planes[i][1] * points[j][1] +
                planes[i][2] * points[j][2] +
                planes[i][3];
            if (dd < 0) {
                out++;
            }
            else {
                in++;
            }
            if (in && out) {
                break;
            }
        }
        if (in == 0) {
            return 0;
        }
    }
    return 1;
}

int _hit_test(
    Map *map, float max_distance, int previous,
    float x, float y, float z,
    float vx, float vy, float vz,
    int *hx, int *hy, int *hz)
{
    int m = 32;
    int px = 0;
    int py = 0;
    int pz = 0;
    for (int i = 0; i < max_distance * m; i++) {
        int nx = (int)roundf(x);
        int ny = (int)roundf(y);
        int nz = (int)roundf(z);
        if (nx != px || ny != py || nz != pz) {
            int hw = map_get(map, nx, ny, nz);
            if (hw > 0) {
                if (previous) {
                    *hx = px; *hy = py; *hz = pz;
                }
                else {
                    *hx = nx; *hy = ny; *hz = nz;
                }
                return hw;
            }
            px = nx; py = ny; pz = nz;
        }
        x += vx / m; y += vy / m; z += vz / m;
    }
    return 0;
}

int hit_test(
    int previous, float x, float y, float z, float rx, float ry,
    int *bx, int *by, int *bz)
{
    int result = 0;
    float best = 0;
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    float vx, vy, vz;
    get_sight_vector(rx, ry, &vx, &vy, &vz);
    for (int i = 0; i < MAX_CHUNKS; i++) {
        ClientChunk *chunk = g->chunks + i;
        if (!chunk->c.active || chunk_distance(chunk, p, q, r) > 1) {
            continue;
        }
        int hx, hy, hz;
        int hw = _hit_test(&chunk->c.map, 8, previous,
            x, y, z, vx, vy, vz, &hx, &hy, &hz);
        if (hw > 0) {
            float d = sqrtf(
                powf(hx - x, 2) + powf(hy - y, 2) + powf(hz - z, 2));
            if (best == 0 || d < best) {
                best = d;
                *bx = hx; *by = hy; *bz = hz;
                result = hw;
            }
        }
    }
    return result;
}

int hit_test_face(Player *player, int *x, int *y, int *z, int *face) {
    State *s = &player->state;
    int w = hit_test(0, s->x, s->y, s->z, s->rx, s->ry, x, y, z);
    if (is_obstacle(w)) {
        int hx, hy, hz;
        hit_test(1, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
        int dx = hx - *x;
        int dy = hy - *y;
        int dz = hz - *z;
        if (dx == -1 && dy == 0 && dz == 0) {
            *face = 0; return 1;
        }
        if (dx == 1 && dy == 0 && dz == 0) {
            *face = 1; return 1;
        }
        if (dx == 0 && dy == 0 && dz == -1) {
            *face = 2; return 1;
        }
        if (dx == 0 && dy == 0 && dz == 1) {
            *face = 3; return 1;
        }
        if (dx == 0 && dy == 1 && dz == 0) {
            int degrees = (int)roundf(DEGREES(atan2f(s->x - hx, s->z - hz)));
            if (degrees < 0) {
                degrees += 360;
            }
            int top = ((degrees + 45) / 90) % 4;
            *face = 4 + top; return 1;
        }
    }
    return 0;
}

int collide(int height, float *x, float *y, float *z) {
    int result = 0;
    int p = chunked(*x);
    int q = chunked(*z);
    int r = chunked(*y);
    ClientChunk *chunk = find_chunk(p, q, r);
    if (!chunk) {
        return result;
    }
    Map *map = &chunk->c.map;
    int nx = (int)roundf(*x);
    int ny = (int)roundf(*y);
    int nz = (int)roundf(*z);
    float px = *x - nx;
    float py = *y - ny;
    float pz = *z - nz;
    float pad = 0.25;
    for (int dy = 0; dy < height; dy++) {
        if (px < -pad && is_obstacle(map_get(map, nx - 1, ny - dy, nz))) {
            *x = nx - pad;
        }
        if (px > pad && is_obstacle(map_get(map, nx + 1, ny - dy, nz))) {
            *x = nx + pad;
        }
        if (py < -pad && is_obstacle(map_get(map, nx, ny - dy - 1, nz))) {
            *y = ny - pad;
            result = 1;
        }
        if (py > pad && is_obstacle(map_get(map, nx, ny - dy + 1, nz))) {
            *y = ny + pad;
            result = 1;
        }
        if (pz < -pad && is_obstacle(map_get(map, nx, ny - dy, nz - 1))) {
            *z = nz - pad;
        }
        if (pz > pad && is_obstacle(map_get(map, nx, ny - dy, nz + 1))) {
            *z = nz + pad;
        }
    }
    return result;
}

int player_intersects_block(
    int height,
    float x, float y, float z,
    int hx, int hy, int hz)
{
    int nx = (int)roundf(x);
    int ny = (int)roundf(y);
    int nz = (int)roundf(z);
    for (int i = 0; i < height; i++) {
        if (nx == hx && ny - i == hy && nz == hz) {
            return 1;
        }
    }
    return 0;
}

int _gen_sign_buffer(
    GLfloat *data, float x, float y, float z, int face, const char *text)
{
    static const int glyph_dx[8] = {0, 0, -1, 1, 1, 0, -1, 0};
    static const int glyph_dz[8] = {1, -1, 0, 0, 0, -1, 0, 1};
    static const int line_dx[8] = {0, 0, 0, 0, 0, 1, 0, -1};
    static const int line_dy[8] = {-1, -1, -1, -1, 0, 0, 0, 0};
    static const int line_dz[8] = {0, 0, 0, 0, 1, 0, -1, 0};
    if (face < 0 || face >= 8) {
        return 0;
    }
    int count = 0;
    float max_width = 64.f;
    float line_height = 1.25;
    char lines[1024];
    int rows = wrap(text, (int)max_width, lines, 1024);
    rows = MIN(rows, 5);
    int dx = glyph_dx[face];
    int dz = glyph_dz[face];
    int ldx = line_dx[face];
    int ldy = line_dy[face];
    int ldz = line_dz[face];
    float n = 1.0f / (max_width / 10);
    float sx = x - n * (rows - 1) * (line_height / 2) * ldx;
    float sy = y - n * (rows - 1) * (line_height / 2) * ldy;
    float sz = z - n * (rows - 1) * (line_height / 2) * ldz;
    char *key;
    char *line = tokenize(lines, "\n", &key);
    while (line) {
        int length = (int)strlen(line);
        int line_width = string_width(line);
        line_width = (int)MIN(line_width, max_width);
        float rx = sx - dx * line_width / max_width / 2;
        float ry = sy;
        float rz = sz - dz * line_width / max_width / 2;
        for (int i = 0; i < length; i++) {
            int width = char_width(line[i]);
            line_width -= width;
            if (line_width < 0) {
                break;
            }
            rx += dx * width / max_width / 2;
            rz += dz * width / max_width / 2;
            if (line[i] != ' ') {
                make_character_3d(
                    data + count * 30, rx, ry, rz, n / 2, face, line[i]);
                count++;
            }
            rx += dx * width / max_width / 2;
            rz += dz * width / max_width / 2;
        }
        sx += n * line_height * ldx;
        sy += n * line_height * ldy;
        sz += n * line_height * ldz;
        line = tokenize(NULL, "\n", &key);
        rows--;
        if (rows <= 0) {
            break;
        }
    }
    return count;
}

void gen_sign_buffer(ClientChunk *chunk) {
    SignList *signs = &chunk->c.signs;

    // first pass - count characters
    int max_faces = 0;
    for (int i = 0; i < signs->size; i++) {
        Sign *e = signs->data + i;
        max_faces += strlen(e->text);
    }

    // second pass - generate geometry
    GLfloat *data = malloc_faces(5, max_faces);
    int faces = 0;
    for (int i = 0; i < signs->size; i++) {
        Sign *e = signs->data + i;
        faces += _gen_sign_buffer(
            data + faces * 30, e->x, e->y, e->z, e->face, e->text);
    }

    del_buffer(chunk->sign_buffer);
    chunk->sign_buffer = gen_faces(5, faces, data);
    chunk->sign_faces = faces;
}

int has_lights(ClientChunk *chunk) {
    if (!SHOW_LIGHTS) {
        return 0;
    }
    for (int dp = -1; dp <= 1; dp++) {
        for (int dq = -1; dq <= 1; dq++) {
            for (int dr = -1; dr <= 1; dr++) {
                ClientChunk *other = chunk;
                if (dp || dq) {
                    other = find_chunk(chunk->c.p + dp, chunk->c.q + dq, chunk->c.r + dr);
                }
                if (!other) {
                    continue;
                }
                Map *map = &other->c.lights;
                if (map->size) {
                    return 1;
                }
            }
        }
    }
    return 0;
}

void dirty_chunk(ClientChunk *chunk) {
    chunk->c.dirty = 1;
    if (has_lights(chunk)) {
        for (int dp = -1; dp <= 1; dp++) {
            for (int dq = -1; dq <= 1; dq++) {
                for (int dr = -1; dr <= 1; dr++) {
                    ClientChunk *other = find_chunk(chunk->c.p + dp, chunk->c.q + dq, chunk->c.r + dr);
                    if (other) {
                        other->c.dirty = 1;
                    }
                }
            }
        }
    }
}

void occlusion(
    const char neighbors[27], const char lights[27], const float shades[27],
    float ao[6][4], float light[6][4])
{
    static const int lookup3[6][4][3] = {
        {{0, 1, 3}, {2, 1, 5}, {6, 3, 7}, {8, 5, 7}},
        {{18, 19, 21}, {20, 19, 23}, {24, 21, 25}, {26, 23, 25}},
        {{6, 7, 15}, {8, 7, 17}, {24, 15, 25}, {26, 17, 25}},
        {{0, 1, 9}, {2, 1, 11}, {18, 9, 19}, {20, 11, 19}},
        {{0, 3, 9}, {6, 3, 15}, {18, 9, 21}, {24, 15, 21}},
        {{2, 5, 11}, {8, 5, 17}, {20, 11, 23}, {26, 17, 23}}
    };
   static const int lookup4[6][4][4] = {
        {{0, 1, 3, 4}, {1, 2, 4, 5}, {3, 4, 6, 7}, {4, 5, 7, 8}},
        {{18, 19, 21, 22}, {19, 20, 22, 23}, {21, 22, 24, 25}, {22, 23, 25, 26}},
        {{6, 7, 15, 16}, {7, 8, 16, 17}, {15, 16, 24, 25}, {16, 17, 25, 26}},
        {{0, 1, 9, 10}, {1, 2, 10, 11}, {9, 10, 18, 19}, {10, 11, 19, 20}},
        {{0, 3, 9, 12}, {3, 6, 12, 15}, {9, 12, 18, 21}, {12, 15, 21, 24}},
        {{2, 5, 11, 14}, {5, 8, 14, 17}, {11, 14, 20, 23}, {14, 17, 23, 26}}
    };
    static const float curve[4] = {0.0, 0.25, 0.5, 0.75};
    for (int i = 0; i < 6; i++) {
        for (int j = 0; j < 4; j++) {
            int corner = neighbors[lookup3[i][j][0]];
            int side1 = neighbors[lookup3[i][j][1]];
            int side2 = neighbors[lookup3[i][j][2]];
            int value = side1 && side2 ? 3 : corner + side1 + side2;
            float shade_sum = 0;
            float light_sum = 0;
            int is_light = lights[13] == 15;
            for (int k = 0; k < 4; k++) {
                shade_sum += shades[lookup4[i][j][k]];
                light_sum += lights[lookup4[i][j][k]];
            }
            if (is_light) {
                light_sum = 15 * 4 * 10;
            }
            float total = curve[value] + shade_sum / 4.0f;
            ao[i][j] = MIN(total, 1.0f);
            light[i][j] = light_sum / 15.0f / 4.0f;
        }
    }
}

#define CG_SIZE (CHUNK_SIZE * 3 + 2)
#define CG_LO (CHUNK_SIZE)
#define CG_HI (CHUNK_SIZE * 2 + 1)
#define XYZ(x, y, z) ((y) * CG_SIZE * CG_SIZE + (x) * CG_SIZE + (z))
#define XZ(x, z) ((x) * CG_SIZE + (z))

void light_fill(
    char *opaque, char *light,
    int x, int y, int z, int w, int force)
{
    if (x + w < CG_LO || z + w < CG_LO || y + w < CG_LO) {
        return;
    }
    if (x - w > CG_HI || z - w > CG_HI || y - w > CG_HI) {
        return;
    }
    if (light[XYZ(x, y, z)] >= w) {
        return;
    }
    if (!force && opaque[XYZ(x, y, z)]) {
        return;
    }
    light[XYZ(x, y, z)] = (char)w--;
    light_fill(opaque, light, x - 1, y, z, w, 0);
    light_fill(opaque, light, x + 1, y, z, w, 0);
    light_fill(opaque, light, x, y - 1, z, w, 0);
    light_fill(opaque, light, x, y + 1, z, w, 0);
    light_fill(opaque, light, x, y, z - 1, w, 0);
    light_fill(opaque, light, x, y, z + 1, w, 0);
}

void compute_chunk(WorkerItem *item) {
    char *opaque = (char *)calloc(CG_SIZE * CG_SIZE * CG_SIZE, sizeof(char));
    char *light = (char *)calloc(CG_SIZE * CG_SIZE * CG_SIZE, sizeof(char));
    char *highest = (char *)calloc(CG_SIZE * CG_SIZE, sizeof(char));

    // Sub 1 from offsets to account for 1-wide padding around arrays
    int ox = item->p * CHUNK_SIZE - CHUNK_SIZE - 1;
    int oy = item->r * CHUNK_SIZE - CHUNK_SIZE - 1;
    int oz = item->q * CHUNK_SIZE - CHUNK_SIZE - 1;

    // check for lights
    int has_light = 0;
    if (SHOW_LIGHTS) {
        for (int a = 0; a < 3; a++) {
            for (int b = 0; b < 3; b++) {
                for (int c = 0; c < 3; c++) {
                    Map *map = item->light_maps[a][b][c];
                    if (map && map->size) {
                        has_light = 1;
                    }
                }
            }
        }
    }

    // populate opaque array
    for (int a = 0; a < 3; a++) {
        for (int b = 0; b < 3; b++) {
            for (int c = 0; c < 3; c++) {
                Map *map = item->block_maps[a][b][c];
                if (!map) {
                    continue;
                }
                MAP_FOR_EACH(map, ex, ey, ez, ew) {
                    int x = ex - ox;
                    int y = ey - oy;
                    int z = ez - oz;
                    int w = ew;
                    // TODO: this should be unnecessary
                    if (x < 0 || y < 0 || z < 0) {
                        continue;
                    }
                    if (x >= CG_SIZE || y >= CG_SIZE || z >= CG_SIZE) {
                        continue;
                    }
                    // END TODO
                    opaque[XYZ(x, y, z)] = !is_transparent(w);
                    if (opaque[XYZ(x, y, z)]) {
                        highest[XZ(x, z)] = (char) MAX(highest[XZ(x, z)], y);
                    }
                } END_MAP_FOR_EACH;
            }
        }
    }

    // flood fill light intensities
    if (has_light) {
        for (int a = 0; a < 3; a++) {
            for (int b = 0; b < 3; b++) {
                for (int c = 0; c < 3; c++) {
                    Map *map = item->light_maps[a][b][c];
                    if (!map) {
                        continue;
                    }
                    MAP_FOR_EACH(map, ex, ey, ez, ew) {
                        int x = ex - ox;
                        int y = ey - oy;
                        int z = ez - oz;
                        light_fill(opaque, light, x, y, z, ew, 1);
                    } END_MAP_FOR_EACH;
                }
            }
        }
    }

    Map *map = item->block_maps[1][1][1];

    // count exposed faces
    int miny = 0x0fffffff;
    int maxy = -1 * 0x0fffffff;
    int faces = 0;
    MAP_FOR_EACH(map, ex, ey, ez, ew) {
        if (ew <= 0) {
            continue;
        }
        int x = ex - ox;
        int y = ey - oy;
        int z = ez - oz;
        int f1 = !opaque[XYZ(x - 1, y, z)];
        int f2 = !opaque[XYZ(x + 1, y, z)];
        int f3 = !opaque[XYZ(x, y + 1, z)];
        int f4 = !opaque[XYZ(x, y - 1, z)];
        int f5 = !opaque[XYZ(x, y, z - 1)];
        int f6 = !opaque[XYZ(x, y, z + 1)];
        int total = f1 + f2 + f3 + f4 + f5 + f6;
        if (total == 0) {
            continue;
        }
        if (is_plant(ew)) {
            total = 4;
        }
        miny = MIN(miny, ey);
        maxy = MAX(maxy, ey);
        faces += total;
    } END_MAP_FOR_EACH;

    // generate geometry
    GLfloat *data = malloc_faces(10, faces);
    int offset = 0;
    MAP_FOR_EACH(map, ex, ey, ez, ew) {
        if (ew <= 0) {
            continue;
        }
        int x = ex - ox;
        int y = ey - oy;
        int z = ez - oz;
        int f1 = !opaque[XYZ(x - 1, y, z)];
        int f2 = !opaque[XYZ(x + 1, y, z)];
        int f3 = !opaque[XYZ(x, y + 1, z)];
        int f4 = !opaque[XYZ(x, y - 1, z)];
        int f5 = !opaque[XYZ(x, y, z - 1)];
        int f6 = !opaque[XYZ(x, y, z + 1)];
        int total = f1 + f2 + f3 + f4 + f5 + f6;
        if (total == 0) {
            continue;
        }
        char neighbors[27] = {0};
        char lights[27] = {0};
        float shades[27] = {0};
        int index = 0;
        for (int dx = -1; dx <= 1; dx++) {
            for (int dy = -1; dy <= 1; dy++) {
                for (int dz = -1; dz <= 1; dz++) {
                    neighbors[index] = opaque[XYZ(x + dx, y + dy, z + dz)];
                    lights[index] = light[XYZ(x + dx, y + dy, z + dz)];
                    shades[index] = 0;
                    if (y + dy <= highest[XZ(x + dx, z + dz)]) {
                        for (int oy = 0; oy < 8; oy++) {
                            if (opaque[XYZ(x + dx, y + dy + oy, z + dz)]) {
                                shades[index] = 1.0f - oy * 0.125f;
                                break;
                            }
                        }
                    }
                    index++;
                }
            }
        }
        float ao[6][4];
        float light[6][4];
        occlusion(neighbors, lights, shades, ao, light);
        if (is_plant(ew)) {
            total = 4;
            float min_ao = 1;
            float max_light = 0;
            for (int a = 0; a < 6; a++) {
                for (int b = 0; b < 4; b++) {
                    min_ao = MIN(min_ao, ao[a][b]);
                    max_light = MAX(max_light, light[a][b]);
                }
            }
            float rotation = simplex2(ex, ez, 4, 0.5, 2) * 360;
            make_plant(
                data + offset, min_ao, max_light,
                ex, ey, ez, 0.5, ew, rotation);
        }
        else {
            make_cube(
                data + offset, ao, light,
                f1, f2, f3, f4, f5, f6,
                ex, ey, ez, 0.5, ew);
        }
        offset += total * 60;
    } END_MAP_FOR_EACH;

    free(opaque);
    free(light);
    free(highest);

    item->faces = faces;
    item->data = data;
}

void generate_chunk(ClientChunk *chunk, WorkerItem *item) {
    chunk->faces = item->faces;
    del_buffer(chunk->buffer);
    chunk->buffer = gen_faces(10, item->faces, item->data);
    gen_sign_buffer(chunk);
}

void init_chunk(ClientChunk *chunk, int p, int q, int r) {
    chunk->c.active = true;
    chunk->c.p = p;
    chunk->c.q = q;
    chunk->c.r = r;
    chunk->faces = 0;
    chunk->sign_faces = 0;
    chunk->buffer = 0;
    chunk->sign_buffer = 0;
    chunk->c.dirty = 0;
    SignList *signs = &chunk->c.signs;
    sign_list_alloc(signs, 16);
    Map *block_map = &chunk->c.map;
    Map *light_map = &chunk->c.lights;
    int dx = p * CHUNK_SIZE;
    int dy = r * CHUNK_SIZE;
    int dz = q * CHUNK_SIZE;
    map_alloc(block_map, dx, dy, dz, 0x7fff);
    map_alloc(light_map, dx, dy, dz, 0x7fff); // TODO: Idk make it smaller or something
}

void delete_chunk(ClientChunk *chunk) {
    map_free(&chunk->c.map);
    map_free(&chunk->c.lights);
    sign_list_free(&chunk->c.signs);
    del_buffer(chunk->buffer);
    del_buffer(chunk->sign_buffer);
    chunk->c.active = 0;
}

void map_set_func(int x, int y, int z, int w, void *arg) {
    Map *map = (Map *)arg;
    map_set(map, x, y, z, w);
}

void gen_chunk(Chunk *chunk) {
    create_world(chunk->p, chunk->q, chunk->r, map_set_func, &chunk->map);
}

void delete_all_chunks() {
    for (int i = 0; i < MAX_CHUNKS; i++) {
        ClientChunk *chunk = g->chunks + i;
        if (!chunk->c.active) continue;

        map_free(&chunk->c.map);
        map_free(&chunk->c.lights);
        sign_list_free(&chunk->c.signs);
        del_buffer(chunk->buffer);
        del_buffer(chunk->sign_buffer);
        chunk->c.active = 0;
    }
}

void check_workers() {
    for (int i = 0; i < WORKERS; i++) {
        Worker *worker = g->workers + i;
        mtx_lock(&worker->mtx);
        if (worker->state == WORKER_DONE) {
            WorkerItem *item = &worker->item;
            ClientChunk *chunk = find_chunk(item->p, item->q, item->r);
            if (chunk) {
                generate_chunk(chunk, item);
            }
            for (int a = 0; a < 3; a++) {
                for (int b = 0; b < 3; b++) {
                    for (int c = 0; c < 3; c++) {
                        Map *block_map = item->block_maps[a][b][c];
                        Map *light_map = item->light_maps[a][b][c];
                        if (block_map) {
                            map_free(block_map);
                            free(block_map);
                        }
                        if (light_map) {
                            map_free(light_map);
                            free(light_map);
                        }
                    }
                }
            }
            worker->state = WORKER_IDLE;
        }
        mtx_unlock(&worker->mtx);
    }
}

void ensure_chunks_worker(Player *player, Worker *worker) {
    State *s = &player->state;
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
    float planes[6][4];
    frustum_planes(planes, g->render_radius, matrix);
    int p = chunked(s->x);
    int q = chunked(s->z);
    int r = chunked(s->y);
    int working_len = WORKER_CHUNK_RADIUS * 2;
    int working_area = working_len * working_len * working_len;
    int start = 0x0fffffff;
    int best_score = start;
    ClientChunk *best_chunk;

    int dp = worker->index, dq = 0, dr = 0;
    for (int di = worker->index; di < working_area; di += WORKERS) {
        int a = p - WORKER_CHUNK_RADIUS + dp;
        int b = q - WORKER_CHUNK_RADIUS + dq;
        int c = r - WORKER_CHUNK_RADIUS + dr;

        dp += WORKERS;
        if (dp >= working_len) {
            dq += dp / working_len;
            dp = dp % working_len;
            if (dq >= working_len) {
                dr += dq / working_len;
                dq = dq % working_len;
            }
        }

        ClientChunk *chunk = find_chunk(a, b, c);
        if (!chunk || (chunk && !chunk->c.dirty)) {
            continue;
        }
        int distance = MAX(MAX(ABS(dp - WORKER_CHUNK_RADIUS), ABS(dq - WORKER_CHUNK_RADIUS)), ABS(dr - WORKER_CHUNK_RADIUS));
        int invisible = !chunk_visible(planes, a, b, c);
        int priority = chunk->buffer && chunk->c.dirty;

        int score = (invisible << 24) | (priority << 16) | distance;
        if (score < best_score) {
            best_score = score;
            best_chunk = chunk;
        }
    }
    if (best_score == start) {
        return;
    }
    ClientChunk *chunk = best_chunk;

    WorkerItem *item = &worker->item;
    item->p = chunk->c.p;
    item->q = chunk->c.q;
    item->r = chunk->c.r;
    for (int dp = -1; dp <= 1; dp++) {
        for (int dq = -1; dq <= 1; dq++) {
            for (int dr = -1; dr <= 1; dr++) {
                ClientChunk *other = chunk;
                if (dp || dq || dr) {
                    other = find_chunk(chunk->c.p + dp, chunk->c.q + dq, chunk->c.r + dr);
                }
                if (other) {
                    Map *block_map = malloc(sizeof(Map));
                    map_copy(block_map, &other->c.map);
                    Map *light_map = malloc(sizeof(Map));
                    map_copy(light_map, &other->c.lights);
                    item->block_maps[dp + 1][dq + 1][dr + 1] = block_map;
                    item->light_maps[dp + 1][dq + 1][dr + 1] = light_map;
                } else {
                    item->block_maps[dp + 1][dq + 1][dr + 1] = 0;
                    item->light_maps[dp + 1][dq + 1][dr + 1] = 0;
                }
            }
        }
    }
    chunk->c.dirty = 0;
    worker->state = WORKER_BUSY;
    cnd_signal(&worker->cnd);
}

void ensure_chunks(Player *player) {
    check_workers();
    for (int i = 0; i < WORKERS; i++) {
        Worker *worker = g->workers + i;
        mtx_lock(&worker->mtx);
        if (worker->state == WORKER_IDLE) {
            ensure_chunks_worker(player, worker);
        }
        mtx_unlock(&worker->mtx);
    }
}

int worker_run(void *arg) {
    Worker *worker = (Worker *)arg;
    int running = 1;
    while (running) {
        mtx_lock(&worker->mtx);
        while (worker->state != WORKER_BUSY) {
            cnd_wait(&worker->cnd, &worker->mtx);
        }
        mtx_unlock(&worker->mtx);
        WorkerItem *item = &worker->item;
        compute_chunk(item);

        mtx_lock(&worker->mtx);
        worker->state = WORKER_DONE;
        mtx_unlock(&worker->mtx);
    }
    return 0;
}

void unset_sign(int x, int y, int z) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        SignList *signs = &chunk->c.signs;
        if (sign_list_remove_all(signs, x, y, z)) {
            chunk->c.dirty = 1;
        }
    }
    else {
        // hm
    }
}

void unset_sign_face(int x, int y, int z, int face) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        SignList *signs = &chunk->c.signs;
        if (sign_list_remove(signs, x, y, z, face)) {
            chunk->c.dirty = 1;
        }
    }
    else {
        // hm
    }
}

void _set_sign(
    int p, int q, int r, int x, int y, int z, int face, const char *text, int dirty)
{
    if (strlen(text) == 0) {
        unset_sign_face(x, y, z, face);
        return;
    }
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        SignList *signs = &chunk->c.signs;
        sign_list_add(signs, x, y, z, face, text);
        if (dirty) {
            chunk->c.dirty = 1;
        }
    }
}

void set_sign(int x, int y, int z, int face, const char *text) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    _set_sign(p, q, r, x, y, z, face, text, 1);
//    client_sign(x, y, z, face, text);
}

void toggle_light(int x, int y, int z) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        Map *map = &chunk->c.lights;
        int w = map_get(map, x, y, z) ? 0 : 15;
        map_set(map, x, y, z, w);
        dirty_chunk(chunk);
    }
}

void set_light(int p, int q, int r, int x, int y, int z, int w) {
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        Map *map = &chunk->c.lights;
        if (map_set(map, x, y, z, w)) {
            dirty_chunk(chunk);
        }
    }
    else {
        // hm
    }
}

void _set_block(int p, int q, int r, int x, int y, int z, int w, int dirty) {
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        Map *map = &chunk->c.map;
        if (map_set(map, x, y, z, w)) {
            if (dirty) {
                dirty_chunk(chunk);
            }
        }
    }
    else {
        // hm
    }
    if (w == 0 && chunked(x) == p && chunked(z) == q && chunked(y) == r) {
        unset_sign(x, y, z);
        set_light(p, q, r, x, y, z, 0);
    }
}

void set_block(int x, int y, int z, int w) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    _set_block(p, q, r, x, y, z, w, 1);
    for (int dx = -1; dx <= 1; dx++) {
        for (int dz = -1; dz <= 1; dz++) {
            for (int dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dz == 0 && dy == 0) {
                    continue;
                }
                if (dx && chunked(x + dx) == p) {
                    continue;
                }
                if (dz && chunked(z + dz) == q) {
                    continue;
                }
                if (dy && chunked(y + dy) == r) {
                    continue;
                }

                // Dirty the adjacent chunk
                ClientChunk *chunk = find_chunk(p + dx, q + dz, r + dy);
                if (chunk) {
                    dirty_chunk(chunk);
                }
            }
        }
    }
//    client_block(x, y, z, w);
}

int get_block(int x, int y, int z) {
    int p = chunked(x);
    int q = chunked(z);
    int r = chunked(y);
    ClientChunk *chunk = find_chunk(p, q, r);
    if (chunk) {
        Map *map = &chunk->c.map;
        return map_get(map, x, y, z);
    }
    return 0;
}

void builder_block(int x, int y, int z, int w) {
    if (y <= 0 || y >= CHUNK_SIZE) {
        return;
    }
    if (is_destructable(get_block(x, y, z))) {
        set_block(x, y, z, 0);
    }
    if (w) {
        set_block(x, y, z, w);
    }
}

int render_chunks(Attrib *attrib, Player *player) {
    int result = 0;
    State *s = &player->state;
    ensure_chunks(player);
    int p = chunked(s->x);
    int q = chunked(s->z);
    int r = chunked(s->y);
    float light = get_daylight();
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
    float planes[6][4];
    frustum_planes(planes, g->render_radius, matrix);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform3f(attrib->camera, s->x, s->y, s->z);
    glUniform1i(attrib->sampler, 0);
    glUniform1i(attrib->extra1, 2);
    glUniform1f(attrib->extra2, light);
    glUniform1f(attrib->extra3, g->render_radius * CHUNK_SIZE);
    glUniform1i(attrib->extra4, g->ortho);
    glUniform1f(attrib->timer, time_of_day());
    for (int i = 0; i < MAX_CHUNKS; i++) {
        ClientChunk *chunk = g->chunks + i;
        if (!chunk->c.active) continue;
        if (chunk_distance(chunk, p, q, r) > g->render_radius) {
            continue;
        }
        if (!chunk_visible(
            planes, chunk->c.p, chunk->c.q, chunk->c.r))
        {
            continue;
        }
        draw_chunk(attrib, chunk);
        result += chunk->faces;
    }
    return result;
}

void render_signs(Attrib *attrib, Player *player) {
    State *s = &player->state;
    int p = chunked(s->x);
    int q = chunked(s->z);
    int r = chunked(s->y);
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
    float planes[6][4];
    frustum_planes(planes, g->render_radius, matrix);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform1i(attrib->sampler, 3);
    glUniform1i(attrib->extra1, 1);
    for (int i = 0; i < MAX_CHUNKS; i++) {
        ClientChunk *chunk = g->chunks + i;
        if (!chunk->c.active) continue;
        if (chunk_distance(chunk, p, q, r) > g->sign_radius) {
            continue;
        }
        if (!chunk_visible(
            planes, chunk->c.p, chunk->c.q, chunk->c.r))
        {
            continue;
        }
        draw_signs(attrib, chunk);
    }
}

//void render_sign(Attrib *attrib, Player *player) {
//    if (!g->typing || g->typing_buffer[0] != CRAFT_KEY_SIGN) {
//        return;
//    }
//    int x, y, z, face;
//    if (!hit_test_face(player, &x, &y, &z, &face)) {
//        return;
//    }
//    State *s = &player->state;
//    float matrix[16];
//    set_matrix_3d(
//        matrix, g->width, g->height,
//        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
//    glUseProgram(attrib->program);
//    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
//    glUniform1i(attrib->sampler, 3);
//    glUniform1i(attrib->extra1, 1);
//    char text[MAX_SIGN_LENGTH];
//    strncpy(text, g->typing_buffer + 1, MAX_SIGN_LENGTH);
//    text[MAX_SIGN_LENGTH - 1] = '\0';
//    GLfloat *data = malloc_faces(5, (int)strlen(text));
//    int length = _gen_sign_buffer(data, x, y, z, face, text);
//    GLuint buffer = gen_faces(5, length, data);
//    draw_sign(attrib, buffer, length);
//    del_buffer(buffer);
//}

void render_players(Attrib *attrib, Player *player) {
    State *s = &player->state;
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform3f(attrib->camera, s->x, s->y, s->z);
    glUniform1i(attrib->sampler, 0);
    glUniform1f(attrib->timer, time_of_day());
    for (int i = 0; i < MAX_PLAYERS; i++) {
        Player *other = g->players + i;
        if (other != player && other->id != 0) {
            draw_player(attrib, other);
        }
    }
}

void render_sky(Attrib *attrib, Player *player, GLuint buffer) {
    State *s = &player->state;
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        0, 0, 0, s->rx, s->ry, g->fov, 0, g->render_radius);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform1i(attrib->sampler, 2);
    glUniform1f(attrib->timer, time_of_day());
    draw_triangles_3d(attrib, buffer, 512 * 3);
}

void _render_wireframe(Attrib *attrib, float *matrix, int x, int y, int z) {
    glUseProgram(attrib->program);
    glLineWidth(1);
    glEnable(GL_COLOR_LOGIC_OP);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    GLuint wireframe_buffer = gen_wireframe_buffer(x, y, z, 0.53);
    draw_lines(attrib, wireframe_buffer, 3, 24);
    del_buffer(wireframe_buffer);
    glDisable(GL_COLOR_LOGIC_OP);
}

void render_wireframe(Attrib *attrib, Player *player) {
    State *s = &player->state;
    float matrix[16];
    set_matrix_3d(
        matrix, g->width, g->height,
        s->x, s->y, s->z, s->rx, s->ry, g->fov, g->ortho, g->render_radius);
    int hx, hy, hz;
    int hw = hit_test(0, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
    if (is_obstacle(hw)) {
        if (g->build_mode == BUILD_MODE_SINGLE) {
            _render_wireframe(attrib, matrix, hx, hy, hz);
        } else if (g->build_mode == BUILD_MODE_FLOOR) {
            for (int dx = -1; dx <= 1; dx++) {
                for (int dz = -1; dz <= 1; dz++) {
                    _render_wireframe(attrib, matrix, hx + dx, hy, hz + dz);
                }
            }
        } else if (g->build_mode == BUILD_MODE_WALL) {
            for (int dy = -1; dy <= 1; dy++) {
                for (int dh = -1; dh <= 1; dh++) {
                    _render_wireframe(attrib, matrix, hx + (g->build_rot == 1? dh : 0), hy + dy, hz + (g->build_rot == 0? dh : 0));
                }
            }
        }
    }
}

void render_crosshairs(Attrib *attrib) {
    float matrix[16];
    set_matrix_2d(matrix, g->width, g->height);
    glUseProgram(attrib->program);
    glLineWidth(4 * g->scale);
    glEnable(GL_COLOR_LOGIC_OP);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    GLuint crosshair_buffer = gen_crosshair_buffer();
    draw_lines(attrib, crosshair_buffer, 2, 4);
    del_buffer(crosshair_buffer);
    glDisable(GL_COLOR_LOGIC_OP);
}

void render_item(Attrib *attrib, int item) {
    float matrix[16];
    set_matrix_item(matrix, g->width, g->height, g->scale);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform3f(attrib->camera, 0, 0, 5);
    glUniform1i(attrib->sampler, 0);
    glUniform1f(attrib->timer, time_of_day());
    if (is_plant(item)) {
        GLuint buffer = gen_plant_buffer(0, 0, 0, 0.5, item);
        draw_plant(attrib, buffer);
        del_buffer(buffer);
    }
    else {
        GLuint buffer = gen_cube_buffer(0, 0, 0, 0.5, item);
        draw_cube(attrib, buffer);
        del_buffer(buffer);
    }
}

void render_text(
    Attrib *attrib, int justify, float x, float y, float n, char *text)
{
    float matrix[16];
    set_matrix_2d(matrix, g->width, g->height);
    glUseProgram(attrib->program);
    glUniformMatrix4fv(attrib->matrix, 1, GL_FALSE, matrix);
    glUniform1i(attrib->sampler, 1);
    glUniform1i(attrib->extra1, 0);
    int length = (int)strlen(text);
    x -= n * justify * (length - 1) / 2;
    GLuint buffer = gen_text_buffer(x, y, n, text);
    draw_text(attrib, buffer, length);
    del_buffer(buffer);
}

void array(Block *b1, Block *b2, int xc, int yc, int zc) {
    if (b1->w != b2->w) {
        return;
    }
    int w = b1->w;
    int dx = b2->x - b1->x;
    int dy = b2->y - b1->y;
    int dz = b2->z - b1->z;
    xc = dx ? xc : 1;
    yc = dy ? yc : 1;
    zc = dz ? zc : 1;
    for (int i = 0; i < xc; i++) {
        int x = b1->x + dx * i;
        for (int j = 0; j < yc; j++) {
            int y = b1->y + dy * j;
            for (int k = 0; k < zc; k++) {
                int z = b1->z + dz * k;
                builder_block(x, y, z, w);
            }
        }
    }
}

void cube(Block *b1, Block *b2, int fill) {
    if (b1->w != b2->w) {
        return;
    }
    int w = b1->w;
    int x1 = MIN(b1->x, b2->x);
    int y1 = MIN(b1->y, b2->y);
    int z1 = MIN(b1->z, b2->z);
    int x2 = MAX(b1->x, b2->x);
    int y2 = MAX(b1->y, b2->y);
    int z2 = MAX(b1->z, b2->z);
    int a = (x1 == x2) + (y1 == y2) + (z1 == z2);
    for (int x = x1; x <= x2; x++) {
        for (int y = y1; y <= y2; y++) {
            for (int z = z1; z <= z2; z++) {
                if (!fill) {
                    int n = 0;
                    n += x == x1 || x == x2;
                    n += y == y1 || y == y2;
                    n += z == z1 || z == z2;
                    if (n <= a) {
                        continue;
                    }
                }
                builder_block(x, y, z, w);
            }
        }
    }
}

void sphere(Block *center, int radius, int fill, int fx, int fy, int fz) {
    static const float offsets[8][3] = {
        {-0.5f, -0.5f, -0.5f},
        {-0.5f, -0.5f, 0.5f},
        {-0.5f, 0.5f, -0.5f},
        {-0.5f, 0.5f, 0.5f},
        {0.5f, -0.5f, -0.5f},
        {0.5f, -0.5f, 0.5f},
        {0.5f, 0.5f, -0.5f},
        {0.5f, 0.5f, 0.5f}
    };
    int cx = center->x;
    int cy = center->y;
    int cz = center->z;
    int w = center->w;
    for (int x = cx - radius; x <= cx + radius; x++) {
        if (fx && x != cx) {
            continue;
        }
        for (int y = cy - radius; y <= cy + radius; y++) {
            if (fy && y != cy) {
                continue;
            }
            for (int z = cz - radius; z <= cz + radius; z++) {
                if (fz && z != cz) {
                    continue;
                }
                int inside = 0;
                int outside = fill;
                for (int i = 0; i < 8; i++) {
                    float dx = x + offsets[i][0] - cx;
                    float dy = y + offsets[i][1] - cy;
                    float dz = z + offsets[i][2] - cz;
                    float d = sqrtf(dx * dx + dy * dy + dz * dz);
                    if (d < radius) {
                        inside = 1;
                    }
                    else {
                        outside = 1;
                    }
                }
                if (inside && outside) {
                    builder_block(x, y, z, w);
                }
            }
        }
    }
}

void cylinder(Block *b1, Block *b2, int radius, int fill) {
    if (b1->w != b2->w) {
        return;
    }
    int w = b1->w;
    int x1 = MIN(b1->x, b2->x);
    int y1 = MIN(b1->y, b2->y);
    int z1 = MIN(b1->z, b2->z);
    int x2 = MAX(b1->x, b2->x);
    int y2 = MAX(b1->y, b2->y);
    int z2 = MAX(b1->z, b2->z);
    int fx = x1 != x2;
    int fy = y1 != y2;
    int fz = z1 != z2;
    if (fx + fy + fz != 1) {
        return;
    }
    Block block = {x1, y1, z1, w};
    if (fx) {
        for (int x = x1; x <= x2; x++) {
            block.x = x;
            sphere(&block, radius, fill, 1, 0, 0);
        }
    }
    if (fy) {
        for (int y = y1; y <= y2; y++) {
            block.y = y;
            sphere(&block, radius, fill, 0, 1, 0);
        }
    }
    if (fz) {
        for (int z = z1; z <= z2; z++) {
            block.z = z;
            sphere(&block, radius, fill, 0, 0, 1);
        }
    }
}

void tree(Block *block) {
    int bx = block->x;
    int by = block->y;
    int bz = block->z;
    for (int y = by + 3; y < by + 8; y++) {
        for (int dx = -3; dx <= 3; dx++) {
            for (int dz = -3; dz <= 3; dz++) {
                int dy = y - (by + 4);
                int d = (dx * dx) + (dy * dy) + (dz * dz);
                if (d < 11) {
                    builder_block(bx + dx, y, bz + dz, 15);
                }
            }
        }
    }
    for (int y = by; y < by + 7; y++) {
        builder_block(bx, y, bz, 5);
    }
}

void on_light() {
    State *s = &g->players->state;
    int hx, hy, hz;
    int hw = hit_test(0, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
    if (hy > 0 && hy <= CHUNK_SIZE && is_destructable(hw)) {
        toggle_light(hx, hy, hz);
    }
}

bool on_left_click() {
    State *s = &g->players->state;
    int hx, hy, hz;
    int hw = hit_test(0, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
    if (is_destructable(hw)) {
        g->p.x = hx;
        g->p.y = hy;
        g->p.z = hz;
        return true;
    }
    return false;
}

bool on_right_click() {
    State *s = &g->players->state;
    int hx, hy, hz;
    int hw = hit_test(1, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
    if (is_obstacle(hw)) {
        if (!player_intersects_block(2, s->x, s->y, s->z, hx, hy, hz)) {
            g->p.x = hx;
            g->p.y = hy;
            g->p.z = hz;
            return true;
        }
    }
    return false;
}

//void on_middle_click() {
//    State *s = &g->players->state;
//    int hx, hy, hz;
//    int hw = hit_test(0, s->x, s->y, s->z, s->rx, s->ry, &hx, &hy, &hz);
//    for (int i = 0; i < item_count; i++) {
//        if (items[i] == hw) {
//            g->item_index = i;
//            break;
//        }
//    }
//}

void create_window() {
    int window_width = WINDOW_WIDTH;
    int window_height = WINDOW_HEIGHT;
    GLFWmonitor *monitor = NULL;
    if (FULLSCREEN) {
        int mode_count;
        monitor = glfwGetPrimaryMonitor();
        const GLFWvidmode *modes = glfwGetVideoModes(monitor, &mode_count);
        window_width = modes[mode_count - 1].width;
        window_height = modes[mode_count - 1].height;
    }
    g->window = glfwCreateWindow(
        window_width, window_height, "Craft", monitor, NULL);
}

void reset_model() {
    memset(g->chunks, 0, sizeof(Chunk) * MAX_CHUNKS);
    memset(g->players, 0, sizeof(Player) * MAX_PLAYERS);
//    memset(g->typing_buffer, 0, sizeof(char) * MAX_TEXT_LENGTH);
//    g->typing = 0;
    g->day_length = DAY_LENGTH;
    glfwSetTime(g->day_length / 3.0);
    g->time_changed = 1;
    g->build_mode = BUILD_MODE_SINGLE;
}

void one_iter();
static FPS fps = {0, 0, 0};
static double last_commit;
static double last_update;
static double previous;
static State *s;
static Player *me;
static Attrib block_attrib = {0};
static Attrib line_attrib = {0};
static Attrib text_attrib = {0};
static Attrib sky_attrib = {0};
static GLuint sky_buffer;

int init() {
    // INITIALIZATION //
    srand((unsigned int)time(NULL));
    rand();

    // WINDOW INITIALIZATION //
    if (!glfwInit()) {
        return -1;
    }
    create_window();
    if (!g->window) {
        glfwTerminate();
        return -1;
    }

    glfwMakeContextCurrent(g->window);
    glfwSetInputMode(g->window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

    if (glewInit() != GLEW_OK) {
        return -1;
    }

    glEnable(GL_CULL_FACE);
    glEnable(GL_DEPTH_TEST);
    glClearColor(0, 0, 0, 1);

    // LOAD TEXTURES //
    GLuint texture;
    glGenTextures(1, &texture);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texture);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    load_png_texture("textures/texture.png");

    GLuint font;
    glGenTextures(1, &font);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, font);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    load_png_texture("textures/font.png");

    GLuint sky;
    glGenTextures(1, &sky);
    glActiveTexture(GL_TEXTURE2);
    glBindTexture(GL_TEXTURE_2D, sky);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    load_png_texture("textures/sky.png");

    GLuint sign;
    glGenTextures(1, &sign);
    glActiveTexture(GL_TEXTURE3);
    glBindTexture(GL_TEXTURE_2D, sign);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    load_png_texture("textures/sign.png");

    // LOAD SHADERS //
    GLuint program;

    program = load_program(
        "shaders/block_vertex.glsl", "shaders/block_fragment.glsl");
    block_attrib.program = program;
    block_attrib.position = (GLuint)glGetAttribLocation(program, "position");
    block_attrib.normal = (GLuint)glGetAttribLocation(program, "normal");
    block_attrib.uv = (GLuint)glGetAttribLocation(program, "uv");
    block_attrib.matrix = (GLuint)glGetUniformLocation(program, "matrix");
    block_attrib.sampler = (GLuint)glGetUniformLocation(program, "sampler");
    block_attrib.extra1 = (GLuint)glGetUniformLocation(program, "sky_sampler");
    block_attrib.extra2 = (GLuint)glGetUniformLocation(program, "daylight");
    block_attrib.extra3 = (GLuint)glGetUniformLocation(program, "fog_distance");
    block_attrib.extra4 = (GLuint)glGetUniformLocation(program, "ortho");
    block_attrib.camera = (GLuint)glGetUniformLocation(program, "camera");
    block_attrib.timer = (GLuint)glGetUniformLocation(program, "timer");

    program = load_program(
        "shaders/line_vertex.glsl", "shaders/line_fragment.glsl");
    line_attrib.program = program;
    line_attrib.position = (GLuint)glGetAttribLocation(program, "position");
    line_attrib.matrix = (GLuint)glGetUniformLocation(program, "matrix");

    program = load_program(
        "shaders/text_vertex.glsl", "shaders/text_fragment.glsl");
    text_attrib.program = program;
    text_attrib.position = (GLuint)glGetAttribLocation(program, "position");
    text_attrib.uv = (GLuint)glGetAttribLocation(program, "uv");
    text_attrib.matrix = (GLuint)glGetUniformLocation(program, "matrix");
    text_attrib.sampler = (GLuint)glGetUniformLocation(program, "sampler");
    text_attrib.extra1 = (GLuint)glGetUniformLocation(program, "is_sign");

    program = load_program(
        "shaders/sky_vertex.glsl", "shaders/sky_fragment.glsl");
    sky_attrib.program = program;
    sky_attrib.position = (GLuint)glGetAttribLocation(program, "position");
    sky_attrib.normal = (GLuint)glGetAttribLocation(program, "normal");
    sky_attrib.uv = (GLuint)glGetAttribLocation(program, "uv");
    sky_attrib.matrix = (GLuint)glGetUniformLocation(program, "matrix");
    sky_attrib.sampler = (GLuint)glGetUniformLocation(program, "sampler");
    sky_attrib.timer = (GLuint)glGetUniformLocation(program, "timer");

    g->worker_radius = WORKER_CHUNK_RADIUS;
    g->render_radius = RENDER_CHUNK_RADIUS;
    g->sign_radius = RENDER_SIGN_RADIUS;

    // INITIALIZE WORKER THREADS
    for (int i = 0; i < WORKERS; i++) {
        Worker *worker = g->workers + i;
        worker->index = i;
        worker->state = WORKER_IDLE;
        mtx_init(&worker->mtx, mtx_plain);
        cnd_init(&worker->cnd);
        thrd_create(&worker->thrd, worker_run, worker);
    }

    // LOCAL VARIABLES //
    reset_model();
    //FPS fps = {0, 0, 0};
    last_commit = glfwGetTime();
    last_update = glfwGetTime();
    sky_buffer = gen_sky_buffer();

    me = g->players;
    s = &g->players->state;
    me->id = 12;
    me->name[0] = '\0';
    me->buffer = 0;
    g->fov = 65;

    // LOAD STATE FROM DATABASE //
//    int loaded = db_load_state(&s->x, &s->y, &s->z, &s->rx, &s->ry);
//    force_chunks(me);
//    if (!loaded) {
//        s->y = highest_block(s->x, s->z) + 2;
//    }

    // init last frame time
    previous = glfwGetTime();

    return 0;
}

void stop() {
    del_buffer(sky_buffer);
    delete_all_chunks();

    glfwTerminate();
}

void run_frame() {
    // WINDOW SIZE AND SCALE //
    g->scale = get_scale_factor();
    glfwGetFramebufferSize(g->window, &g->width, &g->height);
    glViewport(0, 0, g->width, g->height);

    // FRAME RATE //
    if (g->time_changed) {
        g->time_changed = 0;
        last_commit = glfwGetTime();
        last_update = glfwGetTime();
        memset(&fps, 0, sizeof(fps));
    }
    update_fps(&fps);
    double now = glfwGetTime();
    double dt = now - previous;
    dt = MIN(dt, 0.2);
    dt = MAX(dt, 0.0);
    previous = now;

    // PREPARE TO RENDER //
    gen_player_buffers();

    // RENDER 3-D SCENE //
    glClear(GL_COLOR_BUFFER_BIT);
    glClear(GL_DEPTH_BUFFER_BIT);
    render_sky(&sky_attrib, me, sky_buffer);
    glClear(GL_DEPTH_BUFFER_BIT);
    int face_count = render_chunks(&block_attrib, me);
    render_signs(&text_attrib, me);
//    render_sign(&text_attrib, player);
    render_players(&block_attrib, me);
    if (SHOW_WIREFRAME) {
        render_wireframe(&line_attrib, me);
    }

    // RENDER HUD //
    glClear(GL_DEPTH_BUFFER_BIT);
    if (SHOW_CROSSHAIRS) {
        render_crosshairs(&line_attrib);
    }
    if (SHOW_ITEM) {
        render_item(&block_attrib, me->current_item);
    }

    // RENDER TEXT //
    char text_buffer[1024];
    float ts = 12 * g->scale;
    float tx = ts / 2;
    float ty = g->height - ts;
    if (SHOW_INFO_TEXT) {
        int hour = (int)(time_of_day() * 24);
        char am_pm = (char)(hour < 12 ? 'a' : 'p');
        hour = hour % 12;
        hour = hour ? hour : 12;
        snprintf(
            text_buffer, 1024,
            "(%d, %d, %d) (%.2f, %.2f, %.2f) [%d] %d%cm %dfps",
            chunked(s->x), chunked(s->z), chunked(s->y),
            s->x, s->y, s->z,
            face_count * 2,
            hour, am_pm, fps.fps);
        render_text(&text_attrib, ALIGN_LEFT, tx, ty, ts, text_buffer);
        ty -= ts * 2;
    }
//    if (g->typing) {
//        snprintf(text_buffer, 1024, "> %s", g->typing_buffer);
//        render_text(&text_attrib, ALIGN_LEFT, tx, ty, ts, text_buffer);
//    }
    if (SHOW_PLAYER_NAMES) {
        Player *other = player_crosshair(me);
        if (other) {
            render_text(&text_attrib, ALIGN_CENTER,
                g->width / 2.f, g->height / 2.f - ts - 24, ts,
                other->name);
        }
    }

    // RENDER PICTURE IN PICTURE //
//    if (g->observe2) {
//        player = g->players + g->observe2;
//
//        int pw = 256 * g->scale;
//        int ph = 256 * g->scale;
//        int offset = 32 * g->scale;
//        int pad = 3 * g->scale;
//        int sw = pw + pad * 2;
//        int sh = ph + pad * 2;
//
//        glEnable(GL_SCISSOR_TEST);
//        glScissor(g->width - sw - offset + pad, offset - pad, sw, sh);
//        glClear(GL_COLOR_BUFFER_BIT);
//        glDisable(GL_SCISSOR_TEST);
//        glClear(GL_DEPTH_BUFFER_BIT);
//        glViewport(g->width - pw - offset, offset, pw, ph);
//
//        g->width = pw;
//        g->height = ph;
//        g->ortho = 0;
//        g->fov = 65;
//
//        render_sky(&sky_attrib, player, sky_buffer);
//        glClear(GL_DEPTH_BUFFER_BIT);
//        render_chunks(&block_attrib, player);
//        render_signs(&text_attrib, player);
//        render_players(&block_attrib, player);
//        glClear(GL_DEPTH_BUFFER_BIT);
//        if (SHOW_PLAYER_NAMES) {
//            render_text(&text_attrib, ALIGN_CENTER,
//                pw / 2.f, ts, ts, player->name);
//        }
//    }

    // SWAP AND POLL //
    glfwSwapBuffers(g->window);
    glfwPollEvents();
}
