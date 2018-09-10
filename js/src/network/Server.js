export default class Server {
    constructor(config) {
        this.config = {
            isMaster: true,
            ...config
        }

        this.handlers = {};
        this.plugins = [];
    }

    init() { /* Override in client, create sockets */}

    addPlugin(plugin) {
        this.plugins.push(plugin);
        plugin.onAddToServer((key, handler) => {
            if (key in this.handlers) {
                this.handlers[key].push(handler);
            } else {
                this.handlers[key] = [handler];
            }
        });
    }

    registerHandlersOnSocket(socket) {
        for (let key in this.handlers) {
            for (let handler of this.handlers[key]) {
                socket.on(key, handler);
            }
        }
    }
}
