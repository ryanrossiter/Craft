import Defs from '~/Defs';

import Server from '~/network/Server';
import io from 'socket.io-client';

import ServerLogPlugin from '~/network/plugins/ServerLogPlugin';

export default class ClientServer extends Server {
    constructor(config) {
        super({
            isMaster: false,
            ...config
        });

        this.addPlugin(new ServerLogPlugin());
    }

    createConnection() {
        return io({
            port: Defs.PORT,
            transports: ["websocket"],
            autoConnect: false
        });
    }

    startConnection() {
        this.socket.open();
    }

    stopConnection() {
        this.socket.close();
    }
}
