import ChunkManager from '~/world/ChunkManager';
import Defs from '~/Defs';
import { chunked } from '~/world/ChunkUtils';

export default class ClientChunkManager extends ChunkManager {
    // loads chunks around x/z position
    ensureChunks(x, y, z) {
        let p = chunked(x);
        let q = chunked(z);
        let r = chunked(y);
        for (let dp = -Defs.CREATE_CHUNK_RADIUS; dp <= Defs.CREATE_CHUNK_RADIUS; dp++) {
            for (let dq = -Defs.CREATE_CHUNK_RADIUS; dq <= Defs.CREATE_CHUNK_RADIUS; dq++) {
                for (let dr = -Defs.CREATE_CHUNK_RADIUS; dr <= Defs.CREATE_CHUNK_RADIUS; dr++) {
                    let a = p + dp;
                    let b = q + dq;
                    let c = r + dr;
                    if (this.containsChunk(a, b, c)) continue;

                    this.createChunk(a, b, c);
                }
            }
        }

        for (let chunk of Object.values(this.chunks)) {
            if (Math.abs(p - chunk.p) >= Defs.DELETE_CHUNK_RADIUS
                || Math.abs(q - chunk.q) >= Defs.DELETE_CHUNK_RADIUS
                || Math.abs(r - chunk.r) >= Defs.DELETE_CHUNK_RADIUS) {
                // delete the chunk
                this.removeChunk(chunk);
            }
        }
    }

    setBlock(x, y, z, state, w) {
        let p = chunked(x);
        let q = chunked(z);
        let r = chunked(y);
        this.getChunk(p, q, r).setBlock(x, y, z, state, w);

        // dirty any adjacent chunks
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    this.getChunk(
                        chunked(x + dx),
                        chunked(y + dy),
                        chunked(z + dz),
                    ).dirty();
                }
            }   
        }
    }
}