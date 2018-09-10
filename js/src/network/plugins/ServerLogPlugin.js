import ServerPlugin from '~/network/ServerPlugin';

export default class ServerLogPlugin extends ServerPlugin {
    constructor(clientCore) {
        this.clientCore = clientCore;
    }

    registerHandlers(registerHandler) {
        registerHandler('connect', () => {
            console.log("Socket connected.");
        });

        registerHandler('disconnect', () => {
            console.log("Socket disconnected.");
        });
    }
}