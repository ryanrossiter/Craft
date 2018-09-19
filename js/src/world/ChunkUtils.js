import Defs from '~/Defs';

export function chunkKey(p, q) {
    return `${p}-${q}`;
}

export function chunked(n) {
    return Math.floor(n / Defs.CHUNK_SIZE);
}
