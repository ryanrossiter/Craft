#include "world.h"

void create_world(int p, int q, int r, world_func func, void *arg) {
    int pad = 1;
    float scale = 0.001;
    for (int dx = -pad; dx < CHUNK_SIZE + pad; dx++) {
        int x = p * CHUNK_SIZE + dx;
        for (int dz = -pad; dz < CHUNK_SIZE + pad; dz++) {
            int z = q * CHUNK_SIZE + dz;

            float f = simplex2(x * scale, z * scale, 5, 0.5, 3);
            float g = simplex2(-x * scale, -z * scale, 2, 0.9, 4);
            int mh = g * 32 + 16;
            int h = f * mh;
            for (int dy = -pad; dy < CHUNK_SIZE + pad; dy++) {
                int y = r * CHUNK_SIZE + dy;

                if (y <= h - 5) {
                    // stone (cement?)
                    func(x, y, z, 6, arg);
                } else if (y <= h) {
                    // grass
                    func(x, y, z, 1, arg);
                } else if (SHOW_CLOUDS && y >= 64 && y < 72) {
                    if (simplex3(x * 0.01, y * 0.1, z * 0.01, 8, 0.5, 2) > 0.75) {
                        func(x, y, z, 16, arg);
                    }
                }
            }
        }
    }
}
