import Defs from '~/Defs';
import Chunk from '~/world/Chunk';
import { chunkKey, chunked } from '~/world/ChunkUtils';

export default class ChunkManager {
    constructor(worldInterface, physics, chunkLoader) {
        this.worldInterface = worldInterface;
        this.physics = physics;
        this.chunkLoader = chunkLoader;
        this.chunks = {};
    }

    containsChunk(p, q, r) {
        return chunkKey(p, q, r) in this.chunks;
    }

    getChunk(p, q, r) {
        return this.chunks[chunkKey(p, q, r)];
    }

    getChunkByChunkKey(key) {
        return this.chunks[key];
    }

    removeChunk(chunk) {
        if (!this.containsChunk(chunk.p, chunk.q, chunk.r)) throw Error("Chunk does not exist");

        this.chunkLoader.unloadChunk(chunk);
        this._deleteChunk(chunk);
        delete this.chunks[chunkKey(chunk.p, chunk.q, chunk.r)];
        this.physics.removeBody(chunk.body);
        chunk.body = null;
    }

    async createChunk(p, q, r) {
        if (this.containsChunk(p, q, r)) throw Error("Chunk already exists");

        let chunk = this._initChunk(p, q, r);
        this.chunks[chunkKey(p, q, r)] = chunk;
        await this.chunkLoader.loadChunk(chunk);
        this.physics.addBody(chunk.body);
        return chunk;
    }

    _initChunk(p, q, r) {
        let mem = this.worldInterface.get_unused_chunk_mem_location();
        this.worldInterface.init_chunk(mem, p, q, r);

        let chunk = new Chunk({ p, q, r });
        chunk.assignMemory(mem);

        return chunk;
    }

    _deleteChunk(chunk) {
        chunk.onDelete();
        this.worldInterface.delete_chunk(chunk.getMemoryPosition());
    }
}
