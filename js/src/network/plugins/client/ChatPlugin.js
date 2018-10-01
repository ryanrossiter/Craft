import ServerPlugin from '~/network/ServerPlugin';

export default class ChatPlugin extends ServerPlugin {
    constructor() {
        super(); 
    }

    registerHandlers(registerHandler, emit, serverConfig) {
        registerHandler('chat.message', (socket, { msg }) => {
            this.emitEvent('message', msg);
        });
    }

    sendMessage(msg) {
        this.emit('chat.message', { msg });
    }
}
