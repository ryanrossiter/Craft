#include <emscripten.h>
#include "world.h"
#include <stdbool.h>
#include <libc/string.h>

#define MAX_CHUNKS 4096

static Chunk chunks[MAX_CHUNKS];

void init_chunk(Chunk *chunk, int p, int q, int r) {
    chunk->active = true;
    chunk->p = p;
    chunk->q = q;
    chunk->r = r;
    chunk->dirty = 0;
    SignList *signs = &chunk->signs;
    sign_list_alloc(signs, 16);
    Map *block_map = &chunk->map;
    Map *light_map = &chunk->lights;
    int dx = p * CHUNK_SIZE;
    int dy = r * CHUNK_SIZE;
    int dz = q * CHUNK_SIZE;
    map_alloc(block_map, dx, dy, dz, 0x7fff);
    map_alloc(light_map, dx, dy, dz, 0x7fff); // TODO: Idk make it smaller or something
}

void delete_chunk(Chunk *chunk) {
    map_free(&chunk->map);
    map_free(&chunk->lights);
    sign_list_free(&chunk->signs);
    chunk->active = 0;
}

void map_set_func(int x, int y, int z, int w, void *arg) {
    Map *map = (Map *)arg;
    map_set(map, x, y, z, w);
}

void gen_chunk(Chunk *chunk) {
    create_world(chunk->p, chunk->q, chunk->r, map_set_func, &chunk->map);
}

Chunk *find_chunk(int p, int q, int r) {
    for (int i = 0; i < MAX_CHUNKS; i++) {
        Chunk *chunk = chunks + i;
        if (chunk->active && chunk->p == p && chunk->q == q && chunk->r == r) {
            return chunk;
        }
    }
    return 0;
}

Chunk* get_unused_chunk_mem_location() {
    for (int i = 1; i < MAX_CHUNKS; i++) {
        Chunk *chunk = chunks + i;
        if (!chunk->active) return chunk;
    }

    return NULL;
}

int main() {
    memset(chunks, 0, sizeof(Chunk) * MAX_CHUNKS);
}
