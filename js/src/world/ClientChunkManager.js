import ChunkManager from '~/world/ChunkManager';
import Defs from '~/Defs';

export default class ClientChunkManager extends ChunkManager {
    // loads chunks around x/z position
    ensureChunks(x, z) {
        let p = Math.floor(x / Defs.CHUNK_SIZE);
        let q = Math.floor(z / Defs.CHUNK_SIZE);
        for (let dp = -Defs.CREATE_CHUNK_RADIUS; dp <= Defs.CREATE_CHUNK_RADIUS; dp++) {
            for (let dq = -Defs.CREATE_CHUNK_RADIUS; dq <= Defs.CREATE_CHUNK_RADIUS; dq++) {
                let a = p + dp;
                let b = q + dq;
                if (this.containsChunk(a, b)) continue;

                this.createChunk(a, b);
            }
        }

        for (let chunk of Object.values(this.chunks)) {
            if (Math.abs(p - chunk.p) >= Defs.DELETE_CHUNK_RADIUS
                || Math.abs(q - chunk.q) >= Defs.DELETE_CHUNK_RADIUS) {
                // delete the chunk
                this.removeChunk(chunk);
            }
        }
    }
}