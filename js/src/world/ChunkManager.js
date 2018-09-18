import Defs from '~/Defs';
import Chunk from '~/world/Chunk';

const chunkKey = (p, q) => `${p}-${q}`;

export default class ChunkManager {
    constructor(worldInterface, chunkLoader) {
        this.worldInterface = worldInterface;
        this.chunkLoader = chunkLoader;
        this.chunks = {};
    }

    // loads chunks around x/z position
    ensureChunks(x, z) {
        let p = Math.floor(x / Defs.CHUNK_SIZE);
        let q = Math.floor(z / Defs.CHUNK_SIZE);
        for (let dp = -Defs.CREATE_CHUNK_RADIUS; dp <= Defs.CREATE_CHUNK_RADIUS; dp++) {
            for (let dq = -Defs.CREATE_CHUNK_RADIUS; dq <= Defs.CREATE_CHUNK_RADIUS; dq++) {
                let a = p + dp;
                let b = q + dq;
                if (chunkKey(a, b) in this.chunks) continue;

                let chunk = this._createChunk(a, b);
                this.chunks[chunkKey(a, b)] = chunk;

                this.chunkLoader.loadChunk(chunk);
                chunk.setMemoryValue('dirty', 1);
            }
        }

        for (let chunk of Object.values(this.chunks)) {
            if (Math.abs(p - chunk.p) >= Defs.DELETE_CHUNK_RADIUS
                || Math.abs(q - chunk.q) >= Defs.DELETE_CHUNK_RADIUS) {
                // delete the chunk
                this.chunkLoader.unloadChunk(chunk);
                this._deleteChunk(chunk);
                delete this.chunks[chunkKey(chunk.p, chunk.q)];
            }
        }
    }

    _createChunk(p, q) {
        let mem = this.worldInterface.get_unused_chunk_mem_location();
        this.worldInterface.init_chunk(mem, p, q);

        let chunk = new Chunk({ p, q });
        chunk.assignMemory(mem);

        return chunk;
    }

    _deleteChunk(chunk) {
        this.worldInterface.delete_chunk(chunk.getMemoryPosition());
    }
}
