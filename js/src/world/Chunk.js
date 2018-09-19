import Defs from '~/Defs';
import SerializedObject from '~/util/SerializedObject';
import MemoryBackedObject from '~/util/MemoryBackedObject';
import { ChunkStruct } from '~/StructDefs';

const MAPENTRY_SIZE = 2;

export default class Chunk extends MemoryBackedObject(SerializedObject(Object, 'CHUNK', {
    p: 0, q: 0
}), ChunkStruct) {
    constructor() {
        super(...arguments);
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

    setBlock(x, y, z, state, w) {
        let index = (x - this.p * Defs.CHUNK_SIZE) + y * Defs.CHUNK_SIZE
            + (z - this.q * Defs.CHUNK_SIZE) * Defs.CHUNK_SIZE * Defs.CHUNK_SIZE;

        if (index < 0 || index >= Math.pow(Defs.CHUNK_SIZE, 3)) throw Error("Chunk index OOB");

        this.getMap().set([state, w], index * MAPENTRY_SIZE);
        this.dirty();
    }

    dirty() {
        this.setMemoryValue('dirty', 1);
    }

    toData() {
        let map = this.getMap();
        return {
            ...super.toData(),
            map: map.buffer.slice(map.byteOffset, map.byteOffset + map.byteLength)
        }
    }

    updateData(data) {
        super.updateData(...arguments);

        if (data.hasOwnProperty('map')) {
            this.getMap().set(new Uint8Array(data.map));
            this.dirty();
        }
    }
}
