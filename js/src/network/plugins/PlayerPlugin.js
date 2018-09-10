import ServerPlugin from '~/network/ServerPlugin';

export default class PlayerPlugin extends ServerPlugin {
    constructor(onPlayerJoin) {
        super();
        this.players = {};

        this.onPlayerJoin = onPlayerJoin;
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    registerHandlers(registerHandler) {
        registerHandler('player.join', ({ playerId, name }) => {
            this.players[playerId] = { name };
        });

        registerHandler('player.leave', ({ playerId }) => {
            delete this.players[playerId];
        });
    }
}