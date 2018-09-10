import MasterServer from '~/network/MasterServer';
import ServerCorePlugin from '~/network/plugins/ServerCorePlugin';

export default class ServerCore {
    constructor() {
        this.server = new MasterServer();
        this.serverCorePlugin = new ServerCorePlugin(this);

        this.server.addPlugin(this.serverCorePlugin);
        this.server.start();
    }

    onJoin(playerId) {
        this.state.playerId = playerId;
    }

    start() {
        
    }
}
