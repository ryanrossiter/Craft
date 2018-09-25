import Defs from '~/Defs';
import SerializedObject from '~/util/SerializedObject';
import MemoryBackedObject from '~/util/MemoryBackedObject';
import { ChunkStruct } from '~/StructDefs';
import { isBlockSolid, chunkKey, toChunkCoords } from '~/world/ChunkUtils';
import CANNON from 'cannon';

const MAPENTRY_SIZE = 2;

export default class Chunk extends MemoryBackedObject(SerializedObject(Object, 'CHUNK', {
    p: 0, q: 0, r: 0
}), ChunkStruct) {
    constructor() {
        super(...arguments);
        this.active = false;
        this.isDirty = false;
        this.loaded = false;
        this.body = this._createBody();
    }

    get key() {
        return chunkKey(this.p, this.q, this.r);
    }

    initMemory() {
        this.active = true;
    }

    onDelete() {
        this.active = false;
    }

    adjacent(p, q, r) {
        return Math.max(Math.abs(this.p - p), Math.abs(this.q - q), Math.abs(this.r - r)) <= 1;
    }

    getMap() {
        let mapPos = this.getMemoryValue('map.data');
        let size = this.getMemoryValue('map.size');

        if (mapPos) {
            return new Uint8Array(Module.HEAPU32.buffer, mapPos, size * MAPENTRY_SIZE);
        } else {
            console.warn("Chunk map is null", this.p, this.q, this.r);
            return null;
        }
    }

    getBlock(x, y, z, map) {
        let [xx, yy, zz] = toChunkCoords(x, y, z, this.p, this.q, this.r);
        let index = xx + yy * Defs.CHUNK_SIZE + zz * Defs.CHUNK_SIZE * Defs.CHUNK_SIZE;

        if (index < 0 || index >= Math.pow(Defs.CHUNK_SIZE, 3)) throw Error("Chunk index OOB");

        return (map || this.getMap()).slice(index * MAPENTRY_SIZE, (index + 1) * MAPENTRY_SIZE);
    }

    setBlock(x, y, z, state, w) {
        let [xx, yy, zz] = toChunkCoords(x, y, z, this.p, this.q, this.r);
        let index = xx + yy * Defs.CHUNK_SIZE + zz * Defs.CHUNK_SIZE * Defs.CHUNK_SIZE;

        if (index < 0 || index >= Math.pow(Defs.CHUNK_SIZE, 3)) throw Error("Chunk index OOB");

        this.getMap().set([state, w], index * MAPENTRY_SIZE);
        this.dirty();
    }

    dirty() {
        this.setMemoryValue('dirty', 1);
        this.isDirty = true;
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

        if (data.hasOwnProperty('map') && this.active) {
            this.getMap().set(new Uint8Array(data.map));
            this.dirty();
            this.loaded = true;
        }
    }

    _createBody() {
        let halfChunk = Defs.WORLD_SCALE * Defs.CHUNK_SIZE / 2;
        let shape = new CANNON.Box(new CANNON.Vec3(halfChunk, halfChunk, halfChunk));
        shape.type = Defs.SHAPE_TYPE_CHUNK;

        let body = new CANNON.Body({
            shape,
            type: CANNON.Body.STATIC,
            position: new CANNON.Vec3(
                // subtract 0.5 a block since the blocks are rendered with their point in the center
                (this.p * Defs.CHUNK_SIZE - 0.5) * Defs.WORLD_SCALE,
                (this.r * Defs.CHUNK_SIZE - 0.5) * Defs.WORLD_SCALE,
                (this.q * Defs.CHUNK_SIZE - 0.5) * Defs.WORLD_SCALE)
        });
        body.chunk = this;
        body.shapeOffsets[0].set(halfChunk, halfChunk, halfChunk);
        body.computeAABB();
        body.updateBoundingRadius();

        return body;
    }
}
