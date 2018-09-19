#ifndef _world_h_
#define _world_h_

#include "map.h"
#include "sign.h"
#include "config.h"
#include "noise.h"

typedef struct {
    int p;
    int q;
    int active;
    int dirty;
    int miny;
    int maxy;
    Map map;
    Map lights;
    SignList signs;
} Chunk;

typedef void (*world_func)(int, int, int, int, void *);

void create_world(int p, int q, world_func func, void *arg);

#endif
