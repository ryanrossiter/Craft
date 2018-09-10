import ServerPlugin from '~/network/ServerPlugin';

export default class ServerLogPlugin extends ServerPlugin {
    registerHandlers(registerHandler) {
        registerHandler('connect', () => {
            console.log("Socket connected.");
        });

        registerHandler('disconnect', () => {
            console.log("Socket disconnected.");
        });
    }
}