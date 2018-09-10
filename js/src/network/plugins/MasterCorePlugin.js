import ServerPlugin from '~/network/ServerPlugin';
import { generateUuid } from '~/util/UUID';

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
        registerHandler('join', ({ name }, cb) => {
            let uuid = generateUuid();
            this.players[uuid] = { name };
            cb(uuid);
        });
    }
}