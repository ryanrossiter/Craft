import ChunkLoader from '~/world/ChunkLoader';

export default class NetChunkLoader extends ChunkLoader {
    constructor(worldPlugin) {
        super();
        this.worldPlugin = worldPlugin;
    }

    async loadChunk(chunk) {
        await this.worldPlugin.chunkSub(chunk);
    }

    unloadChunk(chunk) {
        this.worldPlugin.chunkUnsub(chunk);
    }
}