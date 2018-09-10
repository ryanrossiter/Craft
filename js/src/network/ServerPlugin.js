export default class ServerPlugin {
    constructor() {
        this.emit = null;
    }

    onAddToServer(registerHandler) {
        this.registerHandlers(...arguments);
    }

    registerHandlers(registerHandler) { /* override in child class */ }
}
