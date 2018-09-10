import ServerPlugin from '~/network/ServerPlugin';

export default class ClientCorePlugin extends ServerPlugin {
    constructor(clientCore) {
        this.clientCore = clientCore;
        this.players = {};
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    registerHandlers(registerHandler) {
        registerHandler('client.join', ({ playerId, name }) => {
            this.players[playerId] = { name };
        });

        registerHandler('client.leave', ({ playerId }) => {
            delete this.players[playerId];
        });
    }

    join() {
        this.emit('client.join', { name: "Nemp" }, ({ playerId }) => {
            this.clientCore.onJoin(playerId);
        });
    }
}