import ServerPlugin from '~/network/ServerPlugin';

export default class TimeKeeperPlugin extends ServerPlugin {
    constructor() {
        super();
        this.timeDiff = 0;   
    }

    get now() {
        return Date.now() - this.timeDiff;
    }

    registerHandlers(registerHandler, emit, serverConfig) {
        registerHandler('core.update', ({ time }) => {
            this.timeDiff = (this.timeDiff + Date.now() - time) / 2; // 2 step rolling average
        });
    }
}
