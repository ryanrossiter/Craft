export default class ServerPlugin {
    constructor() {
        this.emit = null;
    }

    registerHandlers(registerHandler, serverConfig) { /* override in child class */ }
}
