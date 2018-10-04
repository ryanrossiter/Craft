import ServerPlugin from '~/network/ServerPlugin';

export default class TimeKeeperPlugin extends ServerPlugin {
    constructor(clientModel) {
        super();
        this.clientModel = clientModel;
        this.timeDiff = 0;
        this.gameTime = 0;
        this.lastGameTimeUpdate = 0;
    }

    get now() {
        return Date.now() - this.timeDiff;
    }

    registerHandlers(registerHandler, emit, serverConfig) {
        registerHandler('core.update', (socket, { time, gameTime }) => {
            this.timeDiff = (this.timeDiff + Date.now() - time) / 2; // 2 step rolling average
            this.gameTime = gameTime;
            this.lastGameTimeUpdate = Date.now();
        });
    }

    update() {
        this.clientModel.setMemoryValue('time', this.gameTime + Date.now() - this.lastGameTimeUpdate);
    }
}
