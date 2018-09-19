import ServerPlugin from '~/network/ServerPlugin';
import { chunkKey, chunked } from '~/world/ChunkUtils';

export default class WorldPlugin extends ServerPlugin {
    constructor() {
        super();
        this.chunkSubs = {};
    }

    registerHandlers(registerHandler) {
        registerHandler('block.update', (socket, { x, y, z, state, w }) => {
            let key = chunkKey(chunked(x), chunked(z));
            if (key in this.chunkSubs) {
                this.chunkSubs[key].setBlock(x, y, z, state, w);
            }
        });
    }

    chunkSub(chunk) {
        this.chunkSubs[chunkKey(chunk.p, chunk.q)] = chunk;

        this.emit('chunk.sub', {
            p: chunk.p, q: chunk.q
        }, (data) => {
            if (!data) throw Error("Didn't receive chunk data");
            chunk.updateData(data);
        });
    }

    chunkUnsub(chunk) {
        delete this.chunkSubs[chunkKey(chunk.p, chunk.q)];

        this.emit('chunk.unsub', {
            p: chunk.p, q: chunk.q
        });
    }

    modifyBlock(x, y, z, state, w, undo) {
        this.emit('block.modify', {
            x, y, z, state, w
        }, ({ rejected }) => {
            if (rejected) undo();
        });
    }
}
