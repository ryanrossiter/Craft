import ServerPlugin from '~/network/ServerPlugin';

export default class ClientCorePlugin extends ServerPlugin {
    constructor(clientCore) {
        super();
        this.clientCore = clientCore;
        this.players = {};
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    registerHandlers(registerHandler) {
        registerHandler('client.join', (socket, { playerId, name }) => {
            this.players[playerId] = { name };
        });

        registerHandler('client.leave', (socket, { playerId }) => {
            delete this.players[playerId];
        });

        registerHandler('core.update', (socket, { gameTime }) => {
            this.clientCore.model.setMemoryValue('time', gameTime);
        });
    }

    join() {
        this.emit('client.join', { name: "Nemp" }, ({ playerId }) => {
            this.clientCore.onJoin(playerId);
        });
    }
}
