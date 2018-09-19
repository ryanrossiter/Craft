import Defs from '~/Defs';
import Chunk from '~/world/Chunk';
import { chunkKey } from '~/world/ChunkUtils';

export default class ChunkManager {
    constructor(worldInterface, chunkLoader) {
        this.worldInterface = worldInterface;
        this.chunkLoader = chunkLoader;
        this.chunks = {};
    }

    containsChunk(p, q) {
        return chunkKey(p, q) in this.chunks;
    }

    getChunk(p, q) {
        return this.chunks[chunkKey(p, q)];
    }

    getChunkByChunkKey(key) {
        return this.chunks[key];
    }

    removeChunk(chunk) {
        if (!this.containsChunk(chunk.p, chunk.q)) throw Error("Chunk does not exist");

        this.chunkLoader.unloadChunk(chunk);
        this._deleteChunk(chunk);
        delete this.chunks[chunkKey(chunk.p, chunk.q)];
    }

    async createChunk(p, q) {
        if (this.containsChunk(p, q)) throw Error("Chunk already exists");

        let chunk = this._initChunk(p, q);
        this.chunks[chunkKey(p, q)] = chunk;
        await this.chunkLoader.loadChunk(chunk);
        return chunk;
    }

    _initChunk(p, q) {
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
