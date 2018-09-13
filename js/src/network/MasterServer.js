import Defs from '~/Defs';

import Server from '~/network/Server';
import IO from "socket.io";

import ServerLogPlugin from '~/network/plugins/ServerLogPlugin';

export default class MasterServer extends Server {
    constructor(config) {
        super(config);

        this.io = new IO({
            transports: ["websocket"],
            serveClient: false
        });

        this.addPlugin(new ServerLogPlugin());
    }

    addPlugin(plugin) {
        plugin.emit = this.io.emit.bind(this.io);
        super.addPlugin(plugin);
    }

    init() {
        this.io.on('connect', (socket) => {
            this.registerHandlersOnSocket(socket);
        });

        this.io.listen(Defs.PORT); // start listening
    }
}