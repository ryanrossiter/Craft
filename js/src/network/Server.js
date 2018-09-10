export default class Server {
    constructor(config) {
        this.config = {
            isMaster: true,
            ...config
        }

        this.handlers = {};
        this.plugins = [];

        this.socket = this.createConnection();
    }

    startConnection() { /* override in child */ }
    stopConnection() { /* override in child */ }
    createConnection() { /* override in child */ }

    addPlugin(plugin) {
        this.plugins.push(plugin);
        plugin.onAddToServer((key, handler) => {
            if (key in this.handlers) {
                this.handlers[key].push(handler);
            } else {
                this.handlers[key] = [handler];
                this.socket.on(key, () => this.dispatchHandler(key));
            }
        }, this.socket.emit);
    }

    dispatchHandler(key) {
        if (!(key in this.handlers)) {
            throw `No handler is registered for '${key}'.`;
        }

        for (let handler of this.handlers[key]) {
            handler();
        }
    }
}
