#include <stdlib.h>
#include <string.h>
#include "map.h"

int hash_int(int key) {
    key = ~key + (key << 15);
    key = key ^ (key >> 12);
    key = key + (key << 2);
    key = key ^ (key >> 4);
    key = key * 2057;
    key = key ^ (key >> 16);
    return key;
}

int hash(int x, int y, int z) {
    x = hash_int(x);
    y = hash_int(y);
    z = hash_int(z);
    return x ^ y ^ z;
}

void map_alloc(Map *map, int dx, int dy, int dz, int mask) {
    map->dx = dx;
    map->dy = dy;
    map->dz = dz;
    map->mask = mask;
    map->size = mask + 1;
    map->data = (MapEntry *)calloc(map->mask + 1, sizeof(MapEntry));
}

void map_free(Map *map) {
    free(map->data);
}

void map_copy(Map *dst, Map *src) {
    dst->dx = src->dx;
    dst->dy = src->dy;
    dst->dz = src->dz;
    dst->mask = src->mask;
    dst->size = src->size;
    dst->data = (MapEntry *)calloc(dst->mask + 1, sizeof(MapEntry));
    memcpy(dst->data, src->data, (dst->mask + 1) * sizeof(MapEntry));
}

int map_set(Map *map, int x, int y, int z, int w) {
    unsigned char xx = (unsigned char)(x - map->dx);
    unsigned char yy = (unsigned char)(y - map->dy);
    unsigned char zz = (unsigned char)(z - map->dz);
    if (xx < 0 || xx >= CHUNK_SIZE
        || yy < 0 || yy >= CHUNK_SIZE
        || zz < 0 || zz >= CHUNK_SIZE) {
        return 0;
    }
    unsigned int index = (unsigned int)(xx + yy * CHUNK_SIZE + zz * CHUNK_SIZE * CHUNK_SIZE);
    MapEntry *entry = map->data + index;
    entry->w = (char) w;
    return 1;
}

int map_get(Map *map, int x, int y, int z) {
    unsigned char xx = (unsigned char)(x - map->dx);
    unsigned char yy = (unsigned char)(y - map->dy);
    unsigned char zz = (unsigned char)(z - map->dz);
    if (xx < 0 || xx >= CHUNK_SIZE
        || yy < 0 || yy >= CHUNK_SIZE
        || zz < 0 || zz >= CHUNK_SIZE) {
        return 0;
    }

    unsigned int index = (unsigned int)(xx + yy * CHUNK_SIZE + zz * CHUNK_SIZE * CHUNK_SIZE);
    MapEntry *entry = map->data + index;
    return entry->w;
}

//void map_grow(Map *map) {
//    Map new_map;
//    new_map.dx = map->dx;
//    new_map.dy = map->dy;
//    new_map.dz = map->dz;
//    new_map.mask = (map->mask << 1) | 1;
//    new_map.size = 0;
//    new_map.data = (MapEntry *)calloc(new_map.mask + 1, sizeof(MapEntry));
//    MAP_FOR_EACH(map, ex, ey, ez, ew) {
//        map_set(&new_map, ex, ey, ez, ew);
//    } END_MAP_FOR_EACH;
//    free(map->data);
//    map->mask = new_map.mask;
//    map->size = new_map.size;
//    map->data = new_map.data;
//}
