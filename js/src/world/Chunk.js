import SerializedObject from '~/util/SerializedObject';
import MemoryBackedObject from '~/util/MemoryBackedObject';
import { ChunkStruct } from '~/StructDefs';

const MAPENTRY_SIZE = 2;

// To create chunk:
// 1. get_unused_chunk_mem_location
// 2. init_chunk
// OR 1/2. find_chunk

// 3. load chunk data
// 4. dirty_chunk

export default class Chunk extends MemoryBackedObject(SerializedObject(Object, 'CHUNK', {
    p: 0, q: 0
}), ChunkStruct) {
    constructor() {
        super(...arguments);
    }
    initMemory() {
    }

    getMap() {
        let mapPos = this.getMemoryValue('map.data');
        let size = this.getMemoryValue('map.size');

        if (mapPos) {
            return new Uint8Array(Module.HEAPU32.buffer, mapPos, size * MAPENTRY_SIZE);
        } else {
            return null;
        }
    }

    toData() {
        return {
            ...super.toData(),
            map: this.getMap()
        }
    }
}
