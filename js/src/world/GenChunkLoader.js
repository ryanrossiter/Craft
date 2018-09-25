import ChunkLoader from '~/world/ChunkLoader';

export default class GenChunkLoader extends ChunkLoader {
    constructor(worldInterface) {
        super();
        this.worldInterface = worldInterface;
    }

    async loadChunk(chunk) {
        this.worldInterface.gen_chunk(chunk.getMemoryPosition());
        chunk.dirty();
    }
}