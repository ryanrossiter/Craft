import EventEmitter from 'events';

export default class ServerPlugin extends EventEmitter {
    constructor() {
        super();
        this.emitEvent = this.emit; // inherited from EventEmitter
        this.emit = null;
    }

    registerHandlers(registerHandler, serverConfig) { /* override in child class */ }
}
