import Defs from '~/Defs';
import ServerPlugin from '~/network/ServerPlugin';
import ChunkManager from '~/world/ChunkManager';
import DbChunkLoader from '~/world/DbChunkLoader';
import WorldStore from '~/world/WorldStore';
import { chunkKey, chunked } from '~/world/ChunkUtils'; 

export default class WorldPlugin extends ServerPlugin {
    constructor(worldInterface) {
        super();
        this.subCount = {}; // socketId: subCount
        this.chunkSubs = {}; // chunkKey: [...sockets]
        this.changedChunks = []; // [...chunkKeys]

        this.worldStore = new WorldStore();
        this.chunkManager = new ChunkManager(worldInterface,
            new DbChunkLoader(worldInterface, this.worldStore)
        );
    }

    async getChunk(p, q) {
        let chunk = this.chunkManager.getChunk(p, q);
        if (!chunk) {
            chunk = await this.chunkManager.createChunk(p, q);
        }

        return chunk;
    }

    removeChunk(chunk) {
        let key = chunkKey(chunk.p, chunk.q);
        let ind = this.changedChunks.indexOf(key);
        if (ind !== -1) {
            // chunk was changed, so save it
            this.worldStore.saveChunk(chunk.toData());
            this.changedChunks.splice(ind, 1);
        }

        this.chunkManager.removeChunk(chunk);
    }

    async _onUnsubChunk(key, remainingSubs) {
        if (remainingSubs === 0) {
            this.removeChunk(this.chunkManager.getChunkByChunkKey(key));
            delete this.chunkSubs[key];
        }
    }

    subChunk(p, q, socket) {
        let key = chunkKey(p, q);
        if (!(key in this.chunkSubs)) {
            this.chunkSubs[key] = [socket];
        } else if (this.chunkSubs[key].indexOf(socket) === -1) {
            this.chunkSubs[key].push(socket);
        } else {
            throw Error(`Socket [${socket.id}] is already subscribed to chunk ${key}`);
        }

        if (socket.id in this.subCount) {
            if (++this.subCount[socket.id] >= Defs.MAX_CHUNK_SUBS) {
                console.warn(`Socket [${socket.id}] has chunk subscriptions > ${Defs.MAX_CHUNK_SUBS}`);
            }
        } else {
            this.subCount[socket.id] = 1;
        }
    }

    unsubChunk(p, q, socket) {
        let key = chunkKey(p, q);
        let ind;
        let subs;
        if (key in this.chunkSubs && (ind = this.chunkSubs[key].indexOf(socket)) !== -1) {
            this.chunkSubs[key].splice(ind, 1);

            this._onUnsubChunk(key, this.chunkSubs[key].length);
        } else {
            throw Error(`Socket [${socket.id}] is not subscribed to chunk ${key}`);
        }

        if (socket.id in this.subCount) {
            if (--this.subCount[socket.id] < 0) {
                throw Error(`Socket [${socket.id}] has a sub count < 0`);
            }
        } else {
            this.subCount[socket.id] = 0;
        }
    }

    unsubAllChunks(socket) {
        for (let key in this.chunkSubs) {
            let ind = this.chunkSubs[key].indexOf(socket);
            if (ind !== -1) {
                this.chunkSubs[key].splice(ind, 1);
                this._onUnsubChunk(key, this.chunkSubs[key].length);
            }
        }

        delete this.subCount[socket.id];
    }

    sendBlockUpdateToSockets(sockets, x, y, z, state, w) {
        for (let socket of sockets) {
            socket.emit('block.update', { x, y, z, state, w });
        }
    }

    registerHandlers(registerHandler) {
        registerHandler('disconnect', (socket) => {
            this.unsubAllChunks(socket);
        });

        registerHandler('chunk.sub', async (socket, { p, q }, cb) => {
            this.subChunk(p, q, socket);
            let chunk = await this.getChunk(p, q);
            cb(chunk.toData());
        });

        registerHandler('chunk.unsub', (socket, { p, q }, cb) => {
            let subs = this.unsubChunk(p, q, socket);

            if (subs === 0) {
                console.log("Removing chunk", p, q);
                this.removeChunk(p, q);
            }
        });

        registerHandler('block.modify', async (socket, { x, y, z, state, w }, cb) => {
            let p = chunked(x);
            let q = chunked(z);
            let chunk = await this.getChunk(p, q);

            //console.log(`Set block (${x}, ${y}, ${z}) to ${w}[${state}]`);
            chunk.setBlock(x, y, z, state, w);

            let key = chunkKey(p, q);
            if (key in this.chunkSubs) {
                this.sendBlockUpdateToSockets(this.chunkSubs[key],
                    x, y, z, state, w);
            }

            if (this.changedChunks.indexOf(key) === -1) {
                this.changedChunks.push(key);
            }
        });
    }
}
