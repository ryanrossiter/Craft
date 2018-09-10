import Defs from '~/Defs';

import Server from '~/network/Server';
import IO from "socket.io";

import ServerLogPlugin from '~/network/plugins/ServerLogPlugin';

export default class MasterServer extends Server {
    constructor(config) {
        super(config);

        this.addPlugin(new ServerLogPlugin());
    }

    createSocket() {
        return new IO(Defs.PORT, {
            transports: ["websocket"],
            serveClient: false
        });
    }

    stopConnection() {
        this.socket.close();
    }
}