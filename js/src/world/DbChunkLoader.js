import GenChunkLoader from '~/world/GenChunkLoader';
import WorldStore from '~/world/WorldStore';

export default class DbChunkLoader extends GenChunkLoader {
    constructor(worldInterface, worldStore) {
        super(worldInterface);

        this.worldStore = worldStore;
    }

    async loadChunk(chunk) {
        // check if in store, if not generate new chunk
        let chunkData = await this.worldStore.loadChunk(chunk.p, chunk.q);
        if (chunkData) {
            chunk.updateData(chunkData);
        } else {
            // chunk didn't exist, generate it
            super.loadChunk(chunk);
        }
    }
}