import Defs from '~/Defs';

export function chunkKey(p, q, r) {
    return `${p}:${q}:${r}`;
}

export function chunked(n) {
    return Math.floor(n / Defs.CHUNK_SIZE);
}
