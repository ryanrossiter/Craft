#ifndef _map_h_
#define _map_h_

#include "config.h"
#include <stdio.h>

#define EMPTY_ENTRY(entry) ((entry)->value == 0)

#define MAP_FOR_EACH(map, ex, ey, ez, ew) \
    { int xx = 0, yy = 0, zz = 0; \
    for (unsigned int i = 0; i < map->size; i++) { \
        MapEntry *entry = map->data + i; \
        int ex = xx + map->dx; \
        int ey = yy + map->dy; \
        int ez = zz + map->dz; \
        int ew = entry->w; \
        \
        if (++xx >= CHUNK_SIZE) { \
            xx = 0; \
            if (++yy >= CHUNK_SIZE) { \
                yy = 0; \
                zz++; \
            } \
        }

#define END_MAP_FOR_EACH \
    }}

typedef struct {
    char state;
    char w;
} MapEntry;

typedef struct {
    int dx;
    int dy;
    int dz;
    unsigned int mask;
    unsigned int size;
    MapEntry *data;
} Map;

void map_alloc(Map *map, int dx, int dy, int dz, int mask);
void map_free(Map *map);
void map_copy(Map *dst, Map *src);
//void map_grow(Map *map);
int map_set(Map *map, int x, int y, int z, int w);
int map_get(Map *map, int x, int y, int z);

#endif
