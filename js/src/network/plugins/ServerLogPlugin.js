import ServerPlugin from '~/network/ServerPlugin';

export default class ServerLogPlugin extends ServerPlugin {
    registerHandlers(registerHandler, serverConfig) {
        if (serverConfig.isMaster) {
            // Print right away if on master server
            console.log("Socket connected.");
        } else {
            registerHandler('connect', () => {
                console.log("Socket connected.");
            });
        }

        registerHandler('disconnect', () => {
            console.log("Socket disconnected.");
        });
    }
}