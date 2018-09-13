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

        this.socket = io(`http://${window.location.hostname}:${Defs.PORT}`, {
            transports: ["websocket"],
            autoConnect: false
        });

        this.addPlugin(new ServerLogPlugin());
    }

    addPlugin(plugin) {
        plugin.emit = this.socket.emit.bind(this.socket);
        super.addPlugin(plugin);
    }

    init() {
        this.socket.open();
        super.registerHandlersOnSocket(this.socket);
    }
}
