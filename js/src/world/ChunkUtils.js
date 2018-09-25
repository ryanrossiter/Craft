import Defs from '~/Defs';

export function chunkKey(p, q, r) {
    return `${p}:${q}:${r}`;
}

export function chunked(n) {
    return Math.floor(n / Defs.CHUNK_SIZE);
}

export function isBlockSolid(block) {
    return block[1] > 0;
}

export function toChunkCoords(x, y, z, p, q, r) {
    return [
        x - p * Defs.CHUNK_SIZE,
        y - r * Defs.CHUNK_SIZE,
        z - q * Defs.CHUNK_SIZE
    ];
}
