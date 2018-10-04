#include <libc/string.h>
#include "world.h"

#define GEN_PAD 16

int get_occupied(int *occupied, int xo, int zo, int x, int z) {
    int i = x - xo + (z - zo) * (CHUNK_SIZE + 2 * GEN_PAD);
    if (i < 0 || i >= (CHUNK_SIZE + 2 * GEN_PAD) * (CHUNK_SIZE + 2 * GEN_PAD)) return 0;
    return occupied[i];
}

void set_occupied(int *occupied, int xo, int zo, int x, int z, int o) {
    int i = x - xo + (z - zo) * (CHUNK_SIZE + 2 * GEN_PAD);
    if (i < 0 || i >= (CHUNK_SIZE + 2 * GEN_PAD) * (CHUNK_SIZE + 2 * GEN_PAD)) return;
    occupied[i] = o;
}

void gen_trees(world_func func, int *occupied, int xo, int zo, int x, int z, int h, void *arg) {
    int tree_dist = 5;
    int trunk_width = 2;
    int height = 15;
    int leaf_radius = 8;
    if (simplex2(x, z, 1, 1, 3) > 0.94) {
        for (int dx = -tree_dist; dx < tree_dist; dx++) {
            for (int dz = -tree_dist; dz < tree_dist; dz++) {
                if (get_occupied(occupied, xo, zo, x + dx, z + dz)) return;
            }
        }

        for (int dx = 0; dx < trunk_width; dx++) {
            for (int dz = 0; dz < trunk_width; dz++) {
                for (int dy = 1; dy <= height; dy++) {
                    func(x + dx, h + dy, z + dz, 5, arg);
                }
            }
        }

        for (int dx = -leaf_radius; dx < leaf_radius; dx++) {
            for (int dz = -leaf_radius; dz < leaf_radius; dz++) {
                int occ = 0;
                for (int dy = -leaf_radius; dy <= leaf_radius; dy++) {
                    int ddy = (int) round(dy / 2.);
                    if (ddy > h + height && dx >= 0 && dx < trunk_width && dz >= 0 && dz < trunk_width) continue;
                    if (simplex3(x + dx, z + dz, h + height + dy, 1, 1, 3) <
                        pow(sqrt(dx * dx + dz * dz + dy * dy) / leaf_radius, 2))
                        continue;
                    func(x + dx, h + height + ddy, z + dz, 15, arg);

                    if (!occ) {
                        set_occupied(occupied, xo, zo, x + dx, z + dz, 1);
                        occ = 1;
                    }
                }
            }
        }
    }
}

void gen_buildings(world_func func, int *occupied, int xo, int zo, int x, int z, int h, void *arg) {
    int xr = 8;
    int zr = 8;
    int height = 8;
    if (simplex2(x, z, 1, 1, 3) > 0.98) {
        for (int dx = -xr; dx <= xr; dx++) {
            for (int dz = -zr; dz <= zr; dz++) {
                if (get_occupied(occupied, xo, zo, x + dx, z + dz)) return;
            }
        }

        for (int dx = -xr; dx <= xr; dx++) {
            for (int dz = -zr; dz <= zr; dz++) {
                set_occupied(occupied, xo, zo, x + dx, z + dz, 1);
                for (int dy = 1; dy <= height; dy++) {
                    if (dx == -xr || dz == -zr || dx == xr || dz == zr) {
                        func(x + dx, h + dy, z + dz, 3, arg);
                    } else if (dy == 0 || dy == height) {
                        func(x + dx, h + dy, z + dz, 3, arg);
                    } else {
                        func(x + dx, h + dy, z + dz, 0, arg);
                    }
                }
            }
        }
    }
}

void create_world(int p, int q, int r, world_func func, void *arg) {
    int pad = GEN_PAD;
    float scale = 0.001;
    int s = (CHUNK_SIZE + 2 * pad) * (CHUNK_SIZE + 2 * pad);
    int occupied[s];
    memset(occupied, 0, s * sizeof(int));
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

            gen_buildings(func, occupied, p * CHUNK_SIZE - pad, q * CHUNK_SIZE - pad, x, z, h, arg);
            gen_trees(func, occupied, p * CHUNK_SIZE - pad, q * CHUNK_SIZE - pad, x, z, h, arg);
        }
    }
}
