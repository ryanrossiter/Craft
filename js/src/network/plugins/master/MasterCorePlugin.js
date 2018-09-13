import ServerPlugin from '~/network/ServerPlugin';
import EntityTypes from '~/entities/EntityTypes';

export default class MasterCorePlugin extends ServerPlugin {
    constructor(masterCore) {
        super();
        this.masterCore = masterCore;
        this.players = {};
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    registerHandlers(registerHandler) {
        registerHandler('client.join', (socket, { name }, cb) => {
            this.players[socket.id] = { name };
            cb({ playerId: socket.id });

            console.log(`Player ${name} joined.`);
            this.masterCore.entities.sendAllEntities(socket);
            this.masterCore.entities.create(EntityTypes.PLAYER, { name, player: socket.id });
        });
    }
}
