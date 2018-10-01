import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';
import Defs from '~/Defs';

export default class MasterCorePlugin extends ServerPlugin {
    constructor(masterCore) {
        super();
        this.masterCore = masterCore;
        this.players = {};
        this.lastUpdate = Date.now();
        this.gameTime = Defs.TIME_DAY;
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    update() {
        let now = Date.now();
        if (now - this.lastUpdate > Defs.CORE_SYNC_INTERVAL) {
            this.gameTime += now - this.lastUpdate;
            this.lastUpdate = now;
            this.emit('core.update', { time: now, gameTime: this.gameTime });
        }
    }

    registerHandlers(registerHandler) {
        registerHandler('client.join', (socket, { name }, cb) => {
            this.players[socket.id] = { name };
            cb({ playerId: socket.id });

            console.log(`Player ${name} joined.`);
            this.masterCore.entities.sendAllEntities(socket);
            this.masterCore.entities.create(EntityTypes.PLAYER, { name, player: socket.id, y: 25 });
        });

        registerHandler('disconnect', (socket) => {
            if (socket.id in this.players) {
                delete this.players[socket.id];
                
                let playerEntities = this.masterCore.entities.search((e) => e.player === socket.id);
                for (let e of playerEntities) {
                    this.masterCore.entities.delete(e);
                }
            }
        });
    }
}
