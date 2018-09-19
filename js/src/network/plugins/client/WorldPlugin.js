import ServerPlugin from '~/network/ServerPlugin';
import { chunkKey, chunked } from '~/world/ChunkUtils';

export default class WorldPlugin extends ServerPlugin {
    constructor() {
        super();
        this.chunkSubs = {};
    }

    registerHandlers(registerHandler) {
        registerHandler('block.update', (socket, { x, y, z, state, w }) => {
            let key = chunkKey(chunked(x), chunked(z), chunked(y));
            if (key in this.chunkSubs) {
                this.chunkSubs[key].setBlock(x, y, z, state, w);
            }
        });
    }

    chunkSub(chunk) {
        this.chunkSubs[chunkKey(chunk.p, chunk.q, chunk.r)] = chunk;

        this.emit('chunk.sub', {
            p: chunk.p, q: chunk.q, r: chunk.r
        }, (data) => {
            if (!data) throw Error("Didn't receive chunk data");
            chunk.updateData(data);
        });
    }

    chunkUnsub(chunk) {
        delete this.chunkSubs[chunkKey(chunk.p, chunk.q, chunk.r)];
        
        this.emit('chunk.unsub', {
            p: chunk.p, q: chunk.q, r: chunk.r
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
