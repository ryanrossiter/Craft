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
        plugin.registerHandlers((key, handler) => {
            let _handler = (...args) => {
                try { handler(...args); }
                catch (e) {
                    console.error(`Error in socket handler ${key} from plugin ${plugin.constructor.name}:`);
                    console.error(e.stack);
                }
            };

            if (key in this.handlers) {
                this.handlers[key].push(_handler);
            } else {
                this.handlers[key] = [_handler];
            }
        }, this.config);
    }

    registerHandlersOnSocket(socket) {
        for (let key in this.handlers) {
            for (let handler of this.handlers[key]) {
                socket.on(key, (...args) => handler(socket, ...args));
            }
        }
    }
}
