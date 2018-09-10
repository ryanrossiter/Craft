export default class ServerPlugin {
    constructor() {
        this.emit = null;
    }

    onAddToServer(registerHandler, emit) {
        this.emit = emit;
        this.registerHandlers(...arguments);
    }

    registerHandlers(registerHandler, emit) { /* override in child class */ }
}
